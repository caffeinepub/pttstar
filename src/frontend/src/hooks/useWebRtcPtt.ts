import { useState, useEffect, useRef, useCallback } from 'react';
import { useActor } from './useActor';
import { useGetCallerUserProfile } from './useCurrentUserProfile';
import { loadConnection, isDirectoryConnection, isDigitalVoiceConnection, isDigitalVoiceGatewayConfigured } from './usePreferredConnection';
import { deriveRoomLabel } from '../utils/roomKey';
import { DigitalVoiceGatewayClient } from '../utils/digitalVoiceGatewayClient';

interface WebRtcPttState {
  roomKey: string;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  isTransmitting: boolean;
  isReceiving: boolean;
  error: string | null;
}

interface WebRtcPttActions {
  joinRoom: () => Promise<void>;
  leaveRoom: () => void;
  startTransmit: () => Promise<void>;
  stopTransmit: () => void;
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function useWebRtcPtt(roomKey: string): WebRtcPttState & WebRtcPttActions {
  const { actor } = useActor();
  const { data: userProfile } = useGetCallerUserProfile();
  const [connectionStatus, setConnectionStatus] = useState<WebRtcPttState['connectionStatus']>('disconnected');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPollTimeRef = useRef<bigint>(BigInt(0));
  const gatewayClientRef = useRef<DigitalVoiceGatewayClient | null>(null);

  // Initialize remote audio element
  useEffect(() => {
    if (!remoteAudioRef.current) {
      remoteAudioRef.current = new Audio();
      remoteAudioRef.current.autoplay = true;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    if (gatewayClientRef.current) {
      gatewayClientRef.current.disconnect();
      gatewayClientRef.current = null;
    }

    setIsTransmitting(false);
    setIsReceiving(false);
  }, []);

  const createPeerConnection = useCallback((useGateway: boolean = false) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        if (useGateway && gatewayClientRef.current) {
          // Send ICE candidate to gateway
          gatewayClientRef.current.sendIceCandidate(event.candidate.toJSON());
        } else if (actor) {
          // Send ICE candidate to backend signaling
          try {
            const signal = JSON.stringify({
              type: 'ice-candidate',
              candidate: event.candidate,
              roomKey,
            });
            await actor.sendSignal(signal, roomKey);
          } catch (err) {
            console.error('Failed to send ICE candidate:', err);
          }
        }
      }
    };

    pc.ontrack = (event) => {
      if (remoteAudioRef.current && event.streams[0]) {
        remoteAudioRef.current.srcObject = event.streams[0];
        setIsReceiving(true);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setConnectionStatus('connected');
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setConnectionStatus('error');
        setError('Connection failed');
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setConnectionStatus('connected');
      }
    };

    return pc;
  }, [actor, roomKey]);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;

    pollingIntervalRef.current = setInterval(async () => {
      if (!actor || !peerConnectionRef.current) return;

      try {
        const signals = await actor.getSignalsAfterTimestampForRoom(lastPollTimeRef.current, roomKey);
        
        for (const signal of signals) {
          try {
            const data = JSON.parse(signal.content);

            if (data.type === 'offer') {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
              const answer = await peerConnectionRef.current.createAnswer();
              await peerConnectionRef.current.setLocalDescription(answer);
              
              const answerSignal = JSON.stringify({
                type: 'answer',
                answer,
              });
              await actor.sendSignal(answerSignal, roomKey);
            } else if (data.type === 'answer') {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            } else if (data.type === 'ice-candidate') {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }

            lastPollTimeRef.current = signal.timestamp;
          } catch (err) {
            console.error('Failed to process signal:', err);
          }
        }
      } catch (err) {
        console.error('Failed to poll signals:', err);
      }
    }, 1000);
  }, [actor, roomKey]);

  const joinRoom = useCallback(async () => {
    if (!actor) {
      setError('Actor not initialized');
      return;
    }

    try {
      setConnectionStatus('connecting');
      setError(null);

      const connection = loadConnection();
      const useGateway = connection && isDigitalVoiceConnection(connection) && isDigitalVoiceGatewayConfigured(connection);

      if (useGateway && connection && isDigitalVoiceConnection(connection)) {
        // Use Digital Voice Gateway for real WebRTC connection
        const gatewayClient = new DigitalVoiceGatewayClient({
          url: connection.gatewayUrl!,
          token: connection.gatewayToken,
          room: connection.gatewayRoom || roomKey,
          username: connection.gatewayUsername || userProfile?.callsign,
        });

        gatewayClientRef.current = gatewayClient;

        // Connect to gateway
        await gatewayClient.connect();

        // Create peer connection
        peerConnectionRef.current = createPeerConnection(true);

        // Set up gateway message handlers
        gatewayClient.on('offer', async (message) => {
          if (peerConnectionRef.current && message.sdp) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.sdp));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            gatewayClient.sendAnswer(answer);
          }
        });

        gatewayClient.on('answer', async (message) => {
          if (peerConnectionRef.current && message.sdp) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.sdp));
          }
        });

        gatewayClient.on('ice-candidate', async (message) => {
          if (peerConnectionRef.current && message.candidate) {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(message.candidate));
          }
        });

        // Connection status will be set by onconnectionstatechange handler
      } else {
        // Use backend signaling (legacy/fallback)
        peerConnectionRef.current = createPeerConnection(false);
        startPolling();
        
        // For non-gateway connections, set connected immediately (legacy behavior)
        setConnectionStatus('connected');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
      setConnectionStatus('error');
    }
  }, [actor, createPeerConnection, startPolling, roomKey, userProfile]);

  const leaveRoom = useCallback(() => {
    cleanup();
    setConnectionStatus('disconnected');
    setError(null);
  }, [cleanup]);

  const startTransmit = useCallback(async () => {
    if (!peerConnectionRef.current || !actor) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, stream);
      });

      const connection = loadConnection();
      const useGateway = connection && isDigitalVoiceConnection(connection) && isDigitalVoiceGatewayConfigured(connection);

      // Create and send offer
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      if (useGateway && gatewayClientRef.current) {
        // Send offer to gateway
        gatewayClientRef.current.sendOffer(offer);
      } else {
        // Send offer to backend signaling
        const signal = JSON.stringify({
          type: 'offer',
          offer,
        });
        await actor.sendSignal(signal, roomKey);
      }

      setIsTransmitting(true);

      // Record activity with proper metadata from current connection
      const callsign = userProfile?.callsign || 'Unknown';
      
      let networkLabel = 'Unknown Network';
      let talkgroupValue = '';
      
      if (connection) {
        if (isDigitalVoiceConnection(connection)) {
          // For Digital Voice: use mode + reflector as network label
          networkLabel = `${connection.mode.toUpperCase()} / ${connection.reflector}`;
          talkgroupValue = connection.talkgroup || '';
        } else if (isDirectoryConnection(connection)) {
          networkLabel = connection.network.networkLabel;
          talkgroupValue = connection.talkgroup;
        } else {
          networkLabel = deriveRoomLabel(connection);
        }
      }

      await actor.updateNowHearing(
        callsign,
        networkLabel,
        talkgroupValue,
        null,
        null,
        null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start transmission');
      console.error('Failed to start transmit:', err);
    }
  }, [actor, roomKey, userProfile]);

  const stopTransmit = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setIsTransmitting(false);
  }, []);

  return {
    roomKey,
    connectionStatus,
    isTransmitting,
    isReceiving,
    error,
    joinRoom,
    leaveRoom,
    startTransmit,
    stopTransmit,
  };
}
