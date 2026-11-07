import { ROSTER } from '../data/roster.js';
export const randomTeam = (n, avoid = []) => { const out = []; while (out.length < n) { const r = Math.floor(Math.random() * ROSTER.length); if (!out.includes(r) && !avoid.includes(r)) out.push(r); } return out; };
