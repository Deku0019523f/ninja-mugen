// Transport RÉEL : Google Nearby Connections, via le plugin Capacitor « NearbyConnections » (voir capacitor/android/).
// Nearby choisit tout seul la meilleure liaison (BLE → Bluetooth → Wi-Fi LAN / point d'accès Wi-Fi Direct) et la fait monter en débit.
// La qualité de liaison annoncée par Nearby (high = Wi-Fi, medium = Bluetooth, low = BLE) est remontée par l'événement « quality ».
import { Emitter } from './emitter.js';

export const SERVICE_ID = 'com.ninjamugen.nearby';
let cached = null;
const plugin = () => {
  if (cached) return cached;
  const C = typeof window !== 'undefined' && window.Capacitor;
  if (C && C.isNativePlatform && C.isNativePlatform() && C.registerPlugin) cached = C.registerPlugin('NearbyConnections');
  return cached;
};
const enc = (s) => { const u = new TextEncoder().encode(s); let b = ''; for (let i = 0; i < u.length; i++) b += String.fromCharCode(u[i]); return btoa(b); };
const dec = (b64) => { const b = atob(b64), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new TextDecoder().decode(u); };

export class NearbyTransport extends Emitter {
  static available() { return !!plugin(); }
  constructor(strategy = 'point') {
    super(); this.kind = 'nearby'; this.P = plugin(); this.strategy = strategy;   // 'point' = P2P_POINT_TO_POINT (1 contre 1, haut débit) · 'cluster' = P2P_CLUSTER
    this.peer = null; this.names = new Map(); this.bound = false;
  }
  async init() {
    if (!this.bound) {
      const P = this.P, on = (n, f) => P.addListener(n, f);
      on('endpointFound', (e) => this.emit('found', { id: e.endpointId, name: e.endpointName }));
      on('endpointLost', (e) => this.emit('lost', { id: e.endpointId }));
      on('connectionInitiated', (e) => {
        if (this.peer && this.peer !== e.endpointId) { P.rejectConnection({ endpointId: e.endpointId }).catch(() => {}); return; }
        this.names.set(e.endpointId, e.endpointName);
        this.emit('pending', { id: e.endpointId, name: e.endpointName, digits: e.digits });
        P.acceptConnection({ endpointId: e.endpointId }).catch((err) => this.emit('error', { message: String(err && err.message || err) }));
      });
      on('connectionResult', (e) => {
        if (e.status === 'connected') { this.peer = e.endpointId; this.emit('connected', { id: e.endpointId, name: this.names.get(e.endpointId) || '?', quality: this.q || 'unknown' }); }
        else this.emit('failed', { id: e.endpointId, status: e.status });
      });
      on('bandwidth', (e) => { this.q = e.quality; this.emit('quality', { id: e.endpointId, quality: e.quality }); });
      on('disconnected', (e) => { if (this.peer === e.endpointId) { this.peer = null; this.emit('disconnected', { id: e.endpointId }); } });
      on('payload', (e) => this.emit('message', { id: e.endpointId, text: dec(e.data) }));
      this.bound = true;
    }
    const r = await this.P.ensurePermissions();
    if (!r || !r.granted) throw new Error('Permissions Bluetooth / Wi-Fi / appareils proches refusées');
    return true;
  }
  startHost(name) { return this.P.startAdvertising({ name, serviceId: SERVICE_ID, strategy: this.strategy }); }
  stopHost() { return this.P.stopAdvertising().catch(() => {}); }
  startSearch() { return this.P.startDiscovery({ serviceId: SERVICE_ID, strategy: this.strategy }); }
  stopSearch() { return this.P.stopDiscovery().catch(() => {}); }
  connect(id, name) { return this.P.requestConnection({ endpointId: id, name }); }
  send(text) { if (this.peer) this.P.sendPayload({ endpointId: this.peer, data: enc(text) }); }
  async disconnect() { if (this.peer) { const id = this.peer; this.peer = null; await this.P.disconnect({ endpointId: id }).catch(() => {}); } }
  async reset() { this.peer = null; this.q = null; await this.P.stopAll().catch(() => {}); }
}
