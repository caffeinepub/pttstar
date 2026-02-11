import { useState, useEffect, useRef, useCallback } from 'react';
import { useActor } from './useActor';
import { useGetCallerUserProfile } from './useCurrentUserProfile';

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

    setIsTransmitting(false);
    setIsReceiving(false);
  }, []);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = async (event) => {
      if (event.candidate && actor) {
        try {
          const message = JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate.toJSON(),
            roomKey,
          });
          await actor.sendSignal(message);
        } catch (err) {
          console.error('Failed to send ICE candidate:', err);
        }
      }
    };

    pc.ontrack = (event) => {
      if (remoteAudioRef.current && event.streams[0]) {
        remoteAudioRef.current.srcObject = event.streams[0];
        setIsReceiving(true);
        
        // Stop receiving indicator when track ends
        event.track.onended = () => {
          setIsReceiving(false);
        };
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setConnectionStatus('connected');
        setError(null);
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setConnectionStatus('error');
        setError('Connection failed. Please try reconnecting.');
      }
    };

    return pc;
  }, [actor, roomKey]);

  const pollSignals = useCallback(async () => {
    if (!actor) return;

    try {
      const signals = await actor.getSignals(lastPollTimeRef.current);
      
      for (const signal of signals) {
        try {
          const message = JSON.parse(signal.content);
          
          // Only process messages for our room
          if (message.roomKey !== roomKey) continue;

          if (message.type === 'offer') {
            // Received an offer - create answer
            if (!peerConnectionRef.current) {
              peerConnectionRef.current = createPeerConnection();
            }

            const pc = peerConnectionRef.current;
            await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            const answerMessage = JSON.stringify({
              type: 'answer',
              answer: answer,
              roomKey,
            });
            await actor.sendSignal(answerMessage);

          } else if (message.type === 'answer') {
            // Received an answer
            if (peerConnectionRef.current) {
              await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(message.answer)
              );
            }

          } else if (message.type === 'ice-candidate') {
            // Received ICE candidate
            if (peerConnectionRef.current && message.candidate) {
              await peerConnectionRef.current.addIceCandidate(
                new RTCIceCandidate(message.candidate)
              );
            }
          }

          lastPollTimeRef.current = signal.timestamp;
        } catch (err) {
          console.error('Failed to process signal:', err);
        }
      }
    } catch (err) {
      console.error('Failed to poll signals:', err);
    }
  }, [actor, roomKey, createPeerConnection]);

  const joinRoom = useCallback(async () => {
    if (!actor || connectionStatus !== 'disconnected') return;

    try {
      setConnectionStatus('connecting');
      setError(null);

      // Start polling for signals
      pollingIntervalRef.current = setInterval(pollSignals, 1000);

      setConnectionStatus('connected');
    } catch (err) {
      setConnectionStatus('error');
      setError('Failed to join room. Please try again.');
      console.error('Failed to join room:', err);
    }
  }, [actor, connectionStatus, pollSignals]);

  const leaveRoom = useCallback(() => {
    cleanup();
    setConnectionStatus('disconnected');
    setError(null);
  }, [cleanup]);

  const startTransmit = useCallback(async () => {
    if (!actor || isTransmitting) return;

    try {
      setError(null);

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      localStreamRef.current = stream;

      // Create peer connection if needed
      if (!peerConnectionRef.current) {
        peerConnectionRef.current = createPeerConnection();
      }

      const pc = peerConnectionRef.current;

      // Add audio track
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const message = JSON.stringify({
        type: 'offer',
        offer: offer,
        roomKey,
      });
      await actor.sendSignal(message);

      setIsTransmitting(true);

      // Record activity to backend
      if (userProfile?.callsign) {
        try {
          await actor.updateNowHearing();
        } catch (err) {
          console.error('Failed to record activity:', err);
        }
      }

    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please allow microphone access and try again.');
      } else {
        setError('Failed to start transmission. Please check your microphone.');
      }
      console.error('Failed to start transmit:', err);
      
      // Cleanup on error
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
    }
  }, [actor, isTransmitting, roomKey, createPeerConnection, userProfile]);

  const stopTransmit = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Remove tracks from peer connection but keep it alive for receiving
    if (peerConnectionRef.current) {
      const senders = peerConnectionRef.current.getSenders();
      senders.forEach(sender => {
        if (sender.track) {
          peerConnectionRef.current?.removeTrack(sender);
        }
      });
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
