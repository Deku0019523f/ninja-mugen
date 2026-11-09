// Mini émetteur d'événements (pas de dépendance, utilisable dans le navigateur comme sous Node)
export class Emitter {
  constructor() { this._h = {}; }
  on(e, fn) { (this._h[e] ||= []).push(fn); return () => this.off(e, fn); }
  off(e, fn) { const a = this._h[e]; if (a) this._h[e] = a.filter((x) => x !== fn); }
  emit(e, ...a) { for (const f of [...(this._h[e] || [])]) { try { f(...a); } catch (err) { console.error('[net]', e, err); } } }
}
