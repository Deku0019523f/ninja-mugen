// Choix du transport : Nearby Connections dans l'application Android (Capacitor), BroadcastChannel dans un navigateur (tests)
import { NearbyTransport } from './nearby.js';
import { WebTransport } from './web.js';

export const isNative = () => NearbyTransport.available();
export function createTransport() { return NearbyTransport.available() ? new NearbyTransport() : new WebTransport(); }
