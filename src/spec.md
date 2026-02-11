# Specification

## Summary
**Goal:** Enable real-time in-app push-to-talk audio between authenticated users using WebRTC peer-to-peer streaming, with Internet Computer canister calls (polling) as the signaling layer.

**Planned changes:**
- Add WebRTC-based live transmit/receive on the PTT page so a user can press-and-hold to stream microphone audio to other users in the same room, and receivers can hear live audio with low latency.
- Implement backend signaling in the single Motoko actor to create/join/leave rooms and to exchange SDP offers/answers and ICE candidates via authenticated canister methods, with bounded storage and polling-based retrieval.
- Update the PTT UI to show real-time connection/room status (Disconnected/Connecting/Connected), transmitting state, and receiving/playback activity; demote the existing “Last Recording” playback as a fallback/testing feature.
- Add a minimal real-time activity bridge so the Activity / Now Hearing screen updates via polling when someone in the room starts transmitting (callsign, timestamp, connection/room label), while keeping the existing mock-only admin activity method available or clearly separated.
- Ensure safe failure handling: actionable UI errors on signaling/microphone issues, and return to a non-transmitting state; keep the existing license acknowledgement gate blocking transmit until acknowledged.

**User-visible outcome:** From the PTT page, authenticated users can join a room tied to the selected connection and talk live (press-and-hold) while other users with the app open can hear in near real time; the app shows connection/transmit/receive status and the Activity screen reflects live voice activity without manual refresh.
