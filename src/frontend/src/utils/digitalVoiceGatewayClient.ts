/**
 * Digital Voice Gateway Client
 * 
 * Frontend-only client utility for WebRTC signaling with a configured Digital Voice gateway.
 * Handles SDP exchange and room/token/username metadata negotiation.
 */

export interface GatewayConfig {
  url: string;
  token?: string;
  room?: string;
  username?: string;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate';
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  room?: string;
  username?: string;
}

/**
 * Establishes a WebRTC connection through a Digital Voice gateway.
 * This is a simplified client that assumes the gateway supports WebSocket-based signaling.
 */
export class DigitalVoiceGatewayClient {
  private ws: WebSocket | null = null;
  private config: GatewayConfig;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(config: GatewayConfig) {
    this.config = config;
  }

  /**
   * Connect to the gateway WebSocket endpoint
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Convert HTTP(S) URL to WS(S) URL if needed
        let wsUrl = this.config.url;
        if (wsUrl.startsWith('http://')) {
          wsUrl = wsUrl.replace('http://', 'ws://');
        } else if (wsUrl.startsWith('https://')) {
          wsUrl = wsUrl.replace('https://', 'wss://');
        }

        // Append signaling path if not present
        if (!wsUrl.includes('/signal') && !wsUrl.includes('/ws')) {
          wsUrl = wsUrl.endsWith('/') ? `${wsUrl}signal` : `${wsUrl}/signal`;
        }

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          // Send authentication/join message if token/room provided
          if (this.config.token || this.config.room) {
            this.send({
              type: 'join',
              token: this.config.token,
              room: this.config.room,
              username: this.config.username,
            });
          }
          resolve();
        };

        this.ws.onerror = (error) => {
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (err) {
            console.error('Failed to parse gateway message:', err);
          }
        };

        this.ws.onclose = () => {
          this.ws = null;
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Send a message to the gateway
   */
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send an SDP offer to the gateway
   */
  sendOffer(offer: RTCSessionDescriptionInit): void {
    this.send({
      type: 'offer',
      sdp: offer,
      room: this.config.room,
      username: this.config.username,
    });
  }

  /**
   * Send an SDP answer to the gateway
   */
  sendAnswer(answer: RTCSessionDescriptionInit): void {
    this.send({
      type: 'answer',
      sdp: answer,
      room: this.config.room,
      username: this.config.username,
    });
  }

  /**
   * Send an ICE candidate to the gateway
   */
  sendIceCandidate(candidate: RTCIceCandidateInit): void {
    this.send({
      type: 'ice-candidate',
      candidate,
      room: this.config.room,
      username: this.config.username,
    });
  }

  /**
   * Register a handler for incoming messages of a specific type
   */
  on(messageType: string, handler: (data: any) => void): void {
    this.messageHandlers.set(messageType, handler);
  }

  /**
   * Handle incoming messages from the gateway
   */
  private handleMessage(message: any): void {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }
  }

  /**
   * Disconnect from the gateway
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }
}
