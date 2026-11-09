// Choix du transport : Nearby Connections dans l'application Android (Capacitor), WebRTC (code de salon) dans un navigateur.
// ?local dans l'adresse : BroadcastChannel (deux onglets du même navigateur, sans Internet), pour développer.
import { NearbyTransport } from './nearby.js';
import { WebTransport } from './web.js';
import { WebRtcTransport } from './webrtc.js';

export const isNative = () => NearbyTransport.available();
const wantLocal = () => typeof location !== 'undefined' && /[?&]local\b/.test(location.search);
export function createTransport() {
  if (NearbyTransport.available()) return new NearbyTransport();
  if (!wantLocal() && WebRtcTransport.available()) return new WebRtcTransport();
  return new WebTransport();
}
