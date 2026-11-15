// Converted from the ASTRA prototype (Main.dc.html).
// Logic kept as in the prototype: renderVals() computes everything; render() draws it.
import React from 'react';
import { Link } from 'react-router-dom';
import SimBar from '../components/SimBar.jsx';
import Stella from '../components/Stella.jsx';

class Inicio extends React.Component {
state = { lang: 'en', online: true, sel: 'heart', env: 'ship', rot: -20, saved: null };
drag = null;
lastTouch = 0;
componentWillUnmount() { if (this.spin) clearInterval(this.spin); if (this.simT) clearInterval(this.simT); }
startSpin() {
let reduce = false;
try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
if (reduce) return;
this.spin = setInterval(() => {
if (this.drag || Date.now() - this.lastTouch < 2500) return;
this.setState({ rot: (this.state.rot + 0.6) % 360 });
}, 40);
}
hexA(hex, a) {
const n = parseInt(hex.slice(1), 16);
return 'rgba(' + ((n >> 16) & 255) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255) + ', ' + a + ')';
}
anatomy(rotDeg) {
const th = rotDeg * Math.PI / 180, c = Math.cos(th), sn = Math.sin(th), CX = 150;
const f = (v) => Math.round(v * 10) / 10;
const kOf = (d) => Math.sqrt(c * c + d * d * sn * sn);
const proj = (x, y, z) => ({ x: CX + x * c + z * sn, y: y, z: -x * sn + z * c });
const smooth = (P) => {
const n = P.length; let d = 'M' + f(P[0][0]) + ' ' + f(P[0][1]);
for (let i = 0; i < n; i++) {
const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
d += 'C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
}
return d + 'Z';
};
const part = (ax, az, d, pts) => { const k = kOf(d); const bx = CX + ax * c + az * sn; return { z: -ax * sn + az * c, d: smooth(pts.map((q) => [bx + q[0] * k, q[1]])) }; };
const ellipse = (cy, rx, ry, n) => { const out = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; out.push([Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return out; };
const mirror = (pts) => pts.map((q) => [-q[0], q[1]]).reverse();
const seg = (a, b) => { const A = proj(a[0], a[1], a[2]); const B = proj(b[0], b[1], b[2]); return 'M' + f(A.x) + ' ' + f(A.y) + 'L' + f(B.x) + ' ' + f(B.y); };
const ARM = [[-7, 118], [8, 121], [14, 138], [14, 198], [18, 212], [22, 286], [21, 304], [13, 314], [4, 306], [2, 288], [-4, 214], [-8, 198], [-11, 140]];
const LEG = [[-20, 298], [20, 298], [21, 330], [17, 408], [13, 428], [12, 498], [16, 514], [24, 524], [24, 534], [-10, 534], [-10, 516], [-12, 498], [-16, 428], [-19, 408], [-22, 330]];
const TORSO = [[-14, 106], [-50, 116], [-62, 128], [-58, 150], [-50, 172], [-44, 214], [-42, 244], [-50, 284], [-46, 312], [-20, 326], [0, 330], [20, 326], [46, 312], [50, 284], [42, 244], [44, 214], [50, 172], [58, 150], [62, 128], [50, 116], [14, 106]];
// body shell: head, neck, torso, legs
let body = part(0, 0, 1.12, ellipse(62, 27, 34, 18)).d + part(0, 0, 1, [[-10, 90], [10, 90], [11, 110], [-11, 110]]).d + part(0, 0, 0.6, TORSO).d;
body += part(0, 25, 1.6, [[-3, 58], [3, 58], [4, 72], [-4, 72]]).d;
body += part(22, 0, 1, LEG).d + part(-22, 0, 1, mirror(LEG)).d;
// arms, sorted by depth
let backLimbs = '', frontLimbs = '', backBones = '', frontBones = '';
[1, -1].forEach((sd) => {
const arm = part(sd * 62, 0, 1, sd > 0 ? ARM : mirror(ARM));
const bones = seg([sd * 22, 118, -4], [sd * 60, 122, 0]) + seg([sd * 62, 124, 0], [sd * 66, 208, 0]) + seg([sd * 66, 210, 0], [sd * 76, 300, 0]);
if (arm.z < -2) { backLimbs += arm.d; backBones += bones; } else { frontLimbs += arm.d; frontBones += bones; }
});
// skeleton inside the torso and legs
let bones = '';
for (let y = 100; y < 300; y += 12) bones += seg([0, y, -14], [0, y + 8, -14]);
for (let y = 138; y <= 206; y += 13) { const A = proj(0, y, 18), B = proj(34, y + 8, 6), C = proj(30, y + 14, -10), B2 = proj(-34, y + 8, 6), C2 = proj(-30, y + 14, -10);
bones += 'M' + f(A.x) + ' ' + f(A.y) + 'Q' + f(B.x) + ' ' + f(B.y) + ' ' + f(C.x) + ' ' + f(C.y) + 'M' + f(A.x) + ' ' + f(A.y) + 'Q' + f(B2.x) + ' ' + f(B2.y) + ' ' + f(C2.x) + ' ' + f(C2.y); }
{ const L1 = proj(-34, 292, 0), M1 = proj(0, 318, 14), R1 = proj(34, 292, 0); bones += 'M' + f(L1.x) + ' ' + f(L1.y) + 'Q' + f(M1.x) + ' ' + f(M1.y) + ' ' + f(R1.x) + ' ' + f(R1.y); }
[1, -1].forEach((sd) => { bones += seg([sd * 20, 304, 0], [sd * 22, 414, 2]) + seg([sd * 22, 418, 2], [sd * 22, 512, 0]); });
// organs
const k = kOf(0.8);
const organ = (ax, az, pts) => part(ax, az, 0.8, pts).d;
const brain = organ(0, 0, ellipse(52, 21, 15, 16));
const fold = (ax, az, pts) => { const bx = CX + ax * c + az * sn; return 'M' + pts.map((q) => f(bx + q[0] * k) + ' ' + f(q[1])).join('L'); };
const brainFolds = fold(0, 4, [[0, 39], [0, 64]]) + fold(0, 4, [[-15, 46], [-8, 50], [-14, 56]]) + fold(0, 4, [[15, 46], [8, 50], [14, 56]]);
const lungs = organ(-22, 4, [[-4, 136], [8, 140], [12, 170], [10, 196], [-6, 200], [-14, 186], [-14, 156]]) + organ(22, 4, [[4, 136], [14, 156], [14, 186], [6, 200], [-10, 196], [-12, 170], [-8, 140]]);
const heart = organ(8, 16, [[0, 168], [6, 161], [13, 164], [14, 173], [8, 183], [0, 192], [-8, 183], [-14, 173], [-13, 164], [-6, 161]]);
const liver = organ(-14, 10, [[-22, 204], [8, 200], [14, 208], [4, 218], [-16, 224], [-24, 216]]);
const stomach = organ(14, 12, [[-6, 204], [6, 201], [13, 210], [11, 224], [0, 230], [-7, 222], [-3, 212]]);
const gut = organ(0, 8, [[-26, 244], [26, 244], [28, 266], [22, 288], [-22, 288], [-28, 266]]);
const gutFolds = fold(0, 9, [[-18, 254], [18, 254]]) + fold(0, 9, [[-20, 266], [20, 266]]) + fold(0, 9, [[-16, 278], [16, 278]]);
let eyes = '';
[1, -1].forEach((sd) => { const E = proj(sd * 10, 64, 26); eyes += 'M' + f(E.x - 3) + ' ' + f(E.y) + 'a3 3 0 1 0 6 0a3 3 0 1 0 -6 0'; });
return { body: body, backLimbs: backLimbs, frontLimbs: frontLimbs, backBones: backBones, frontBones: frontBones, bones: bones,
brain: brain, brainFolds: brainFolds, lungs: lungs, heart: heart, liver: liver, stomach: stomach, gut: gut, gutFolds: gutFolds, eyes: eyes,
eyeOpacity: c > 0.2 ? 0.95 : 0, organOpacity: (0.62 + 0.38 * Math.max(0, c)).toFixed(2), proj: proj };
}
loadSaved() {
const get = (k) => { try { return JSON.parse(window.localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
// Radiación saves under astra.radev.individual (solar events) and astra.radrec.individual (measurements)
let rad = null;
const evs = (get('astra.radev.individual') || []).filter((e) => e && e.dose !== null && e.dose !== undefined).sort((a, b) => b.start - a.start);
const recs = (get('astra.radrec.individual') || []).filter((r) => r && r.value !== null && r.value !== undefined && r.value !== '').sort((a, b) => b.t - a.t);
if (evs.length) { const e = evs[0]; const d = parseFloat(e.dose); const hi = e.unit === 'mSv' ? [200, 250] : [300, 700];
rad = { kind: 'event', level: d >= hi[1] ? 'care' : (d >= hi[0] ? 'watch' : 'good'), dose: d + ' ' + (e.unit || '') }; }
else if (recs.length) { const r = recs[0]; rad = { kind: 'record', level: 'good', dose: r.value + ' ' + (r.unit || '') }; }
return { checkin: get('astra.checkin'), baseline: get('astra.baseline'), rad: rad };
}
simPoll() {
let raw = '';
try { raw = (window.localStorage.getItem('astra.sim') || '') + '|' + (window.localStorage.getItem('astra.env') || ''); } catch (e) {}
if (raw === this.simRaw) return;
this.simRaw = raw;
this.sim = this.readSim();
let env = null;
try { env = window.localStorage.getItem('astra.env'); } catch (e) {}
this.simEnv = env || 'ship';
this.forceUpdate();
}
readSim() {
try {
const s = JSON.parse(window.localStorage.getItem('astra.sim') || 'null');
if (!s || !s.on) return null;
const all = JSON.parse(window.localStorage.getItem('astra.simdata') || 'null');
const a = all && all[s.astro];
if (!a) return null;
const today = a.days.find((d) => d.day === s.day) || a.days[a.days.length - 1];
return { astro: s.astro, day: today.day, a: a, today: today, upto: a.days.filter((d) => d.day <= today.day) };
} catch (e) { return null; }
}
componentDidMount() {
let lang = /^es/i.test((typeof navigator !== 'undefined' && navigator.language) || '') ? 'es' : 'en';
let online = true;
try {
const s = window.localStorage.getItem('astra.lang');
if (s === 'en' || s === 'es') lang = s;
if (window.localStorage.getItem('astra.online') === '0') online = false;
} catch (e) {}
this.setState({ lang: lang, online: online });
this.startSpin();
this.setState({ saved: this.loadSaved() });
try { const ev = window.localStorage.getItem('astra.env'); if (ev) this.setState({ env: ev }); } catch (e) {}
this.simPoll();
this.simT = setInterval(() => this.simPoll(), 700);
}
remember(key, value) { try { window.localStorage.setItem(key, value); } catch (e) {} }
shared(L) {
const lang = this.state.lang;
const online = this.state.online;
return {
langs: [{ id: 'en', label: 'English' }, { id: 'es', label: 'Español' }].map((g) => {
const on = g.id === lang;
return { label: g.label, pressed: on ? 'true' : 'false', bg: on ? '#F1F4F9' : 'transparent', fg: on ? '#040C33' : '#F1F4F9',
pick: () => { this.remember('astra.lang', g.id); this.setState({ lang: g.id }); } };
}),
navSetup: L('Baseline setup', 'Línea base'),
connLabel: online ? L('Connected', 'Conectado') : L('No connection', 'Sin conexión'),
connColor: online ? '#7CC4F0' : '#9B6BFF',
offlinePressed: online ? 'false' : 'true',
offline: !online,
toggleOnline: () => { this.remember('astra.online', online ? '0' : '1'); this.setState({ online: !online }); }
};
}
renderVals() {
const es = this.state.lang === 'es';
const L = (en, sp) => (es ? sp : en);
const online = this.state.online;
const LEVELS = {
good: { label: L('All good', 'Todo bien'), color: '#7CC4F0' },
watch: { label: L('Keep an eye on it', 'Hay que vigilar'), color: '#B9A5FF' },
care: { label: L('Needs care', 'Necesita cuidado'), color: '#9B6BFF' },
urgent: { label: L('Urgent', 'Urgente'), color: '#FF7A7A' }
};
const routine = L('Nothing to do. Keep your routine.', 'No hay nada que hacer. Sigue tu rutina.');
const nothing = L('Nothing to report.', 'Nada que reportar.');
const of5 = (n) => L(n + ' of 5', n + ' de 5');
const raw = [
{ id: 'mind', name: L('Mind and mood', 'Mente y ánimo'), reading: L('Calm, good focus', 'Tranquilo, buena concentración'), level: 'good', x: '50%', y: '4.6%',
why: L('Your stress, mood and focus answers have been the same as usual for the last 7 days.', 'Tus respuestas de estrés, ánimo y concentración han sido las de siempre en los últimos 7 días.'),
rows: [{ label: L('Tension', 'Tensión'), today: L('Calm', 'Tranquilo'), usual: L('Calm', 'Tranquilo') }, { label: L('Focus', 'Concentración'), today: L('Well', 'Bien'), usual: L('Well', 'Bien') }],
factors: [], action: routine, help: nothing },
{ id: 'eyes', name: L('Eyes', 'Vista'), reading: L('No changes', 'Sin cambios'), level: 'good', x: '50%', y: '11.4%',
why: L('You have not reported blurry vision or headaches in the last 7 days.', 'No has reportado visión borrosa ni dolores de cabeza en los últimos 7 días.'),
rows: [{ label: L('Blurry vision', 'Visión borrosa'), today: 'No', usual: 'No' }, { label: L('Headache', 'Dolor de cabeza'), today: 'No', usual: L('Rarely', 'Rara vez') }],
factors: [], action: routine,
help: L('Tell us at your next check-in if things look blurry or reading up close gets harder.', 'Avísanos en tu próximo chequeo si ves borroso o te cuesta más leer de cerca.') },
{ id: 'heart', name: L('Heart', 'Corazón'), reading: L('82 beats per minute at rest', '82 latidos por minuto en reposo'), level: 'watch', x: '55%', y: '27%',
why: L('Your heart has been beating a little faster than your usual for 3 check-ins in a row. It is still in the healthy range.', 'Tu corazón ha latido un poco más rápido de lo habitual en 3 chequeos seguidos. Sigue dentro del rango saludable.'),
rows: [{ label: L('Heart rate at rest', 'Pulso en reposo'), today: '82', usual: L('68 to 74', '68 a 74') }, { label: L('Blood pressure', 'Presión arterial'), today: '122/78', usual: '118/76' }],
factors: [L('You slept less: 5.8 hours a night', 'Dormiste menos: 5.8 horas por noche'), L('More work than usual this week', 'Más trabajo de lo normal esta semana'), L('Less exercise: 30 minutes yesterday', 'Menos ejercicio: 30 minutos ayer'), L('You drank less water', 'Tomaste menos agua')],
action: L('Rest for 10 minutes, measure your heart rate again and drink some water.', 'Descansa 10 minutos, mide tu pulso otra vez y toma agua.'),
help: L('If it is still high after 2 more check-ins, or it goes over 110 while resting, tell the crew medical officer.', 'Si sigue alto después de 2 chequeos más, o pasa de 110 en reposo, avisa al oficial médico de la tripulación.') },
{ id: 'breath', name: L('Breathing', 'Respiración'), reading: L('Oxygen 98%', 'Oxígeno 98%'), level: 'good', x: '42%', y: '31%',
why: L('Your oxygen and your breathing are the same as usual.', 'Tu oxígeno y tu respiración son los de siempre.'),
rows: [{ label: L('Oxygen in your blood', 'Oxígeno en la sangre'), today: '98%', usual: L('97 to 99%', '97 a 99%') }, { label: L('Breaths per minute', 'Respiraciones por minuto'), today: '15', usual: L('14 to 16', '14 a 16') }],
factors: [], action: routine, help: nothing },
{ id: 'defense', name: L('Defenses', 'Defensas'), reading: L('Temperature 36.8 °C', 'Temperatura 36.8 °C'), level: 'good', x: '50%', y: '42%',
why: L('Your temperature is the same as usual and you have no symptoms.', 'Tu temperatura es la de siempre y no tienes síntomas.'),
rows: [{ label: L('Temperature', 'Temperatura'), today: '36.8 °C', usual: L('36.5 to 37.0 °C', '36.5 a 37.0 °C') }],
factors: [], action: routine, help: nothing },
{ id: 'muscle', name: L('Muscles and bones', 'Músculos y huesos'), reading: L('30 minutes of exercise yesterday', '30 minutos de ejercicio ayer'), level: 'good', x: '40%', y: '75%',
why: L('One short session is fine. Your exercise for the week is still close to your goal.', 'Una sesión corta no es problema. Tu ejercicio de la semana sigue cerca de tu meta.'),
rows: [{ label: L('Exercise yesterday', 'Ejercicio ayer'), today: '30 min', usual: '45 min' }, { label: L('This week', 'Esta semana'), today: '4 h 40', usual: '5 h 15' }],
factors: [], action: L('Try to finish the full exercise session today.', 'Intenta completar la sesión de ejercicio de hoy.'), help: nothing },
{ id: 'sleep', name: L('Sleep', 'Sueño'), reading: L('5.8 hours a night', '5.8 horas por noche'), level: 'watch', x: '73%', y: '7%',
why: L('You have slept less than your usual for 3 nights in a row.', 'Has dormido menos de lo habitual 3 noches seguidas.'),
rows: [{ label: L('Hours of sleep', 'Horas de sueño'), today: '5.8', usual: '7.1' }, { label: L('How restful it was', 'Qué tan reparador fue'), today: L('A little', 'Poco'), usual: L('Good', 'Bueno') }],
factors: [L('Your work schedule moved', 'Tu horario de trabajo cambió'), L('More work than usual this week', 'Más trabajo de lo normal esta semana')],
action: L('Give yourself a full night of sleep tonight. We will keep the evening check-in short.', 'Date una noche completa de sueño hoy. Haremos corto el chequeo de la noche.'),
help: L('If you sleep under 6 hours for 5 nights, tell the crew medical officer.', 'Si duermes menos de 6 horas durante 5 noches, avisa al oficial médico de la tripulación.') }
];
const saved = this.state.saved || {};
const SIM = this.sim || null;
const ck = SIM ? SIM.today : (saved.checkin && saved.checkin.results ? saved.checkin : null);
const base = SIM ? SIM.a.baseline : (saved.baseline && saved.baseline.vals ? saved.baseline.vals : null);
const RANK = { good: 0, watch: 1, care: 2, urgent: 3 };
const worst = (a, b) => (!a ? b : (!b ? a : (RANK[b] > RANK[a] ? b : a)));
if (ck || base) {
const R = ck ? ck.results : {};
const V = ck ? (ck.vals || {}) : {};
const A = ck ? (ck.answers || {}) : {};
const FL = ck ? (ck.flags || {}) : {};
const txt = (r) => (r ? (es ? r.es : r.en) : '');
const byId = {}; raw.forEach((x) => { byId[x.id] = x; });
const setRow = (sys, idx, today, usual) => { const r = sys.rows[idx]; if (!r) return; if (today !== undefined && today !== null && today !== '') r.today = today; if (usual) r.usual = usual; };
const applyLevel = (sys, lvl, why) => { if (!lvl) return; sys.level = lvl; sys.why = why || sys.why; sys.factors = []; if (lvl === 'good') { sys.action = routine; sys.help = nothing; } };
const MIND = [L('Very tense', 'Muy tenso'), L('Tense', 'Tenso'), L('Moderate', 'Moderado'), L('Calm', 'Tranquilo'), L('Very calm', 'Muy tranquilo')];
const FOCUS = [L('Almost impossible', 'Casi imposible'), L('With a lot of effort', 'Con mucho esfuerzo'), L('With some effort', 'Con algo de esfuerzo'), L('Well', 'Bien'), L('Very well', 'Muy bien')];
const SLEEPQ = [L('Not at all', 'Nada'), L('A little', 'Poco'), L('So-so', 'Regular'), L('Good', 'Bueno'), L('Very restful', 'Muy reparador')];
const h = byId.heart;
if (V.hr) h.reading = L(V.hr + ' beats per minute at rest', V.hr + ' latidos por minuto en reposo');
setRow(h, 0, V.hr, base && base.hr ? base.hr : null);
setRow(h, 1, V.sys && V.dia ? V.sys + '/' + V.dia : '', base && base.sys && base.dia ? base.sys + '/' + base.dia : null);
if (R.hr || R.bp) { const lv = worst(R.hr && R.hr.level, R.bp && R.bp.level); applyLevel(h, lv, [txt(R.hr), txt(R.bp)].filter(Boolean).join(' ')); }
const br = byId.breath;
if (V.spo2) br.reading = L('Oxygen ' + V.spo2 + '%', 'Oxígeno ' + V.spo2 + '%');
setRow(br, 0, V.spo2 ? V.spo2 + '%' : '', base && base.spo2 ? base.spo2 + '%' : null);
if (R.spo2) applyLevel(br, R.spo2.level, txt(R.spo2));
const df = byId.defense;
if (V.temp) df.reading = L('Temperature ' + V.temp + ' °C', 'Temperatura ' + V.temp + ' °C');
setRow(df, 0, V.temp ? V.temp + ' °C' : '', base && base.temp ? base.temp + ' °C' : null);
if (R.temp) applyLevel(df, R.temp.level, txt(R.temp));
const mu = byId.muscle;
const exTot = (V.exh || V.exm) ? (parseFloat(V.exh || 0) * 60 + parseFloat(V.exm || 0)) : null;
if (exTot !== null && !isNaN(exTot)) { mu.reading = L(exTot + ' minutes of exercise', exTot + ' minutos de ejercicio'); setRow(mu, 0, exTot + ' min'); }
if (R.exercise || R.urine) applyLevel(mu, worst(R.exercise && R.exercise.level, R.urine && R.urine.level), [txt(R.exercise), txt(R.urine)].filter(Boolean).join(' '));
const mi = byId.mind;
if (A.stress) setRow(mi, 0, MIND[A.stress - 1]);
if (A.focus) setRow(mi, 1, FOCUS[A.focus - 1]);
if (A.stress && A.focus) mi.reading = MIND[A.stress - 1] + ', ' + FOCUS[A.focus - 1].toLowerCase();
if (R.mind) applyLevel(mi, R.mind.level, txt(R.mind));
const sl = byId.sleep;
if (V.sleeph) { sl.reading = L(V.sleeph + ' hours a night', V.sleeph + ' horas por noche'); setRow(sl, 0, V.sleeph); }
if (A.sleepq) setRow(sl, 1, SLEEPQ[A.sleepq - 1]);
if (R.sleep) applyLevel(sl, R.sleep.level, txt(R.sleep));
if (ck) { const ey = byId.eyes; setRow(ey, 0, FL.vision ? L('Yes', 'Sí') : 'No'); setRow(ey, 1, FL.headache ? L('Yes', 'Sí') : 'No'); }
}
const selId = this.state.sel;
const H = this.anatomy(this.state.rot);
const POS = { mind: [0, 44, 22], eyes: [0, 66, 30], heart: [8, 176, 26], breath: [-24, 158, 20], defense: [0, 264, 22], muscle: [-22, 390, 16], sleep: [50, 30, 0] };
const systems = raw.map((s, i) => {
const on = s.id === selId;
const col = LEVELS[s.level].color;
const q = POS[s.id] ? H.proj(POS[s.id][0], POS[s.id][1], POS[s.id][2]) : { x: 150, y: 300, z: 0 };
const behind = q.z < -4;
return Object.assign({}, s, {
x: (q.x / 300 * 100).toFixed(2) + '%',
y: (q.y / 600 * 100).toFixed(2) + '%',
mZ: behind ? 1 : 3,
mZ2: behind ? 2 : 4,
alert: s.level !== 'good',
markerBg: col,
mOpacity: behind ? 0.4 : 1,
mScale: behind ? 0.82 : 1,
glow: this.hexA(col, 0.7),
tileBg: on ? this.hexA(col, 0.3) : this.hexA(col, 0.13),
tileBorder: on ? '#F1F4F9' : this.hexA(col, 0.42),
tileShadow: on ? '0 0 0 2px ' + this.hexA(col, 0.6) + ', 0 12px 36px ' + this.hexA(col, 0.3) : '0 10px 30px rgba(0, 8, 40, 0.35)',
n: String(i + 1),
color: LEVELS[s.level].color,
levelLabel: LEVELS[s.level].label,
pressed: on ? 'true' : 'false',
rowBg: on ? 'rgba(64, 120, 255, 0.18)' : 'transparent',
rowBorder: on ? 'rgba(150, 185, 255, 0.5)' : 'rgba(130, 175, 255, 0.24)',
ring: on ? '0 0 0 3px #040C33, 0 0 0 6px #F1F4F9, 0 0 18px ' + this.hexA(col, 0.9) : '0 0 12px ' + this.hexA(col, 0.7),
hasFactors: s.factors.length > 0,
factors: s.factors.map((f) => ({ text: f })),
pick: () => this.setState({ sel: s.id })
});
});
const sel = systems.find((s) => s.id === selId) || systems[0];
const envId = this.state.env;
const envs = [
{ id: 'ship', label: L('Spacecraft', 'Nave'), note: L('Messages to Earth take about 6 minutes each way, so your crew decides first.', 'Los mensajes a la Tierra tardan unos 6 minutos por trayecto, así que tu tripulación decide primero.') },
{ id: 'station', label: L('Space station', 'Estación espacial'), note: L('You can talk to the doctors on Earth almost in real time.', 'Puedes hablar con los médicos en la Tierra casi en tiempo real.') },
{ id: 'moon', label: L('Moon base', 'Base lunar'), note: L('Messages to Earth take about 1 second each way. Gravity here is one sixth of Earth.', 'Los mensajes a la Tierra tardan cerca de 1 segundo por trayecto. Aquí la gravedad es un sexto de la terrestre.') }
].map((e) => {
const on = e.id === envId;
return Object.assign({}, e, {
pressed: on ? 'true' : 'false',
bg: on ? '#F1F4F9' : 'transparent',
fg: on ? '#040C33' : '#F1F4F9',
border: on ? '#F1F4F9' : 'rgba(150, 185, 255, 0.5)',
pick: () => { try { window.localStorage.setItem('astra.env', e.id); } catch (x) {} this.setState({ env: e.id }); }
});
});
const env = envs.find((e) => e.id === envId) || envs[0];
const alertOf = (id) => systems.some((x) => x.id === id && x.alert);
const RED = 'rgba(255, 70, 95, 0.8)';
const holo = {
body: H.body, backLimbs: H.backLimbs, frontLimbs: H.frontLimbs, backBones: H.backBones, frontBones: H.frontBones, bones: H.bones,
brain: H.brain, brainFolds: H.brainFolds, lungs: H.lungs, heart: H.heart, liver: H.liver, stomach: H.stomach, gut: H.gut, gutFolds: H.gutFolds, eyes: H.eyes,
eyeOpacity: H.eyeOpacity, organOpacity: H.organOpacity,
brainFill: (alertOf('mind') || alertOf('sleep')) ? RED : 'rgba(201, 182, 255, 0.75)',
lungFill: alertOf('breath') ? RED : 'rgba(143, 211, 255, 0.55)',
heartFill: alertOf('heart') ? 'rgba(255, 70, 95, 0.95)' : 'rgba(255, 122, 154, 0.85)',
gutFill: alertOf('defense') ? RED : 'rgba(170, 150, 255, 0.5)',
cursor: this.drag ? 'grabbing' : 'grab',
down: (e) => { if (e.target && e.target.closest && e.target.closest('button')) return; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) {} this.drag = { x: e.clientX, rot: this.state.rot }; this.lastTouch = Date.now(); this.forceUpdate(); },
move: (e) => { if (!this.drag) return; this.lastTouch = Date.now(); this.setState({ rot: this.drag.rot + (e.clientX - this.drag.x) * 0.7 }); },
up: () => { if (!this.drag) return; this.drag = null; this.lastTouch = Date.now(); this.forceUpdate(); },
left: () => { this.lastTouch = Date.now(); this.setState({ rot: this.state.rot - 45 }); },
right: () => { this.lastTouch = Date.now(); this.setState({ rot: this.state.rot + 45 }); }
};
const needs = systems.filter((x) => x.level !== 'good');
const goodN = systems.length - needs.length;
const names = needs.map((x) => x.name.toLowerCase());
const joinNames = (arr) => (arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + L(' and ', ' y ') + arr[arr.length - 1]);
const heroLive = needs.length === 0
? L('All 7 of your body areas look good.', 'Tus 7 áreas del cuerpo están bien.')
: L(goodN + ' of your 7 body areas look good. ' + needs.length + ' need attention: ' + joinNames(names) + '.', goodN + ' de tus 7 áreas del cuerpo están bien. ' + needs.length + ' necesitan atención: ' + joinNames(names) + '.');
const simDose = SIM && SIM.today.dose ? SIM.today.dose[this.state.env] : null;
const radSaved = simDose !== null && simDose !== undefined ? { level: simDose >= 5 ? 'watch' : 'good', dose: simDose.toFixed(2) + ' mGy', sim: true } : (saved.rad && saved.rad.dose ? saved.rad : null);
const t = {
day: SIM ? L('Day ' + SIM.day + ' of the mission · simulation', 'Día ' + SIM.day + ' de la misión · simulación') : L('Day 42 of the mission · demo data', 'Día 42 de la misión · datos de demostración'),
navLabel: L('Sections', 'Secciones'), navHome: L('Home', 'Inicio'), navCheckin: L('Check-in', 'Chequeo'), navTrends: L('My trends', 'Mis tendencias'), navRad: L('Radiation', 'Radiación'),
radTitle: L('Radiation', 'Radiación'), radValue: radSaved && LEVELS[radSaved.level] ? LEVELS[radSaved.level].label : L('Normal', 'Normal'),
radNote: radSaved && radSaved.sim ? (radSaved.level === 'watch' ? L('A solar event today: ' + radSaved.dose + ' (simulated). Open Emergency › Radiation event.', 'Hoy hubo un evento solar: ' + radSaved.dose + ' (simulada). Abre Emergencia › Evento de radiación.') : L('Dose today: ' + radSaved.dose + ' (simulated). Normal for where you are.', 'Dosis de hoy: ' + radSaved.dose + ' (simulada). Normal para donde estás.')) : radSaved ? (radSaved.kind === 'record' ? L('Your last saved measurement: ' + radSaved.dose + '.', 'Tu última medición guardada: ' + radSaved.dose + '.') : L('Dose from your last saved event: ' + radSaved.dose + '.', 'Dosis de tu último evento guardado: ' + radSaved.dose + '.')) : L('Dose from the last solar event: 12 mGy. No symptoms are expected.', 'Dosis del último evento solar: 12 mGy. No se esperan síntomas.'),
radBtn: L('See details', 'Ver detalles'), setupLink: L('Repeat the first-time setup', 'Repetir la configuración inicial'),
langLabel: L('Language', 'Idioma'), emergency: L('Emergency', 'Emergencia'),
offlineBanner: L('No connection right now. ASTRA keeps working and saves everything on this device. It will catch up when the connection is back.', 'No hay conexión en este momento. ASTRA sigue funcionando y guarda todo en este dispositivo. Se pondrá al día cuando vuelva la conexión.'),
summaryLabel: L('Today', 'Hoy'),
heroTitle: L('You are doing well today.', 'Hoy vas bien.'),
heroText: (ck || base) ? heroLive : L('5 of your 7 body areas look good. 2 need a little attention: your heart and your sleep.', '5 de tus 7 áreas del cuerpo están bien. 2 necesitan un poco de atención: tu corazón y tu sueño.'),
sourceNote: SIM ? L('Simulation mode: astronaut ' + SIM.astro + '. All numbers are simulated.', 'Modo simulación: astronauta ' + SIM.astro + '. Todos los números son simulados.') : (ck || base) ? L('Showing the data you saved in Check-in, Baseline setup and Radiation.', 'Mostrando los datos que guardaste en Chequeo, Línea base y Radiación.') : L('Demo data until you save your first check-in.', 'Datos de demostración hasta que guardes tu primer chequeo.'),
nextLabel: L('Next for you', 'Lo que sigue'), nextTitle: L('Daily check-in', 'Chequeo diario'),
nextNote: L('At 21:00 · takes about 4 minutes', 'A las 21:00 · toma unos 4 minutos'), nextBtn: L('Start now', 'Empezar ahora'),
whereLabel: L('Where are you?', '¿Dónde estás?'),
areasTitle: L('Your body today', 'Tu cuerpo hoy'), bodyTitle: L('Body map', 'Mapa del cuerpo'),
rotLeft: L('Turn the body to the left', 'Girar el cuerpo a la izquierda'), rotRight: L('Turn the body to the right', 'Girar el cuerpo a la derecha'),
dragHint: L('Drag to turn', 'Arrastra para girar'),
bodyHint: L('The numbers match the list. Choose an area to see what is happening.', 'Los números coinciden con la lista. Elige un área para ver qué está pasando.'),
colToday: L('Today', 'Hoy'), colUsual: L('Your usual', 'Lo habitual en ti'),
factorsTitle: L('What may be behind it', 'Qué puede estar detrás'),
doTitle: L('What you can do now', 'Qué puedes hacer ahora'), helpTitle: L('When to ask for help', 'Cuándo pedir ayuda'),
btnTrend: L('See how it changed', 'Ver cómo cambió'), btnMeasure: L('Measure again', 'Medir otra vez'),
moreLabel: L('More', 'Más'),
streakTitle: L('Your check-ins', 'Tus chequeos'), streakValue: L('12 days in a row', '12 días seguidos'),
streakNote: L('Every check-in helps ASTRA learn what is normal for you.', 'Cada chequeo ayuda a ASTRA a aprender qué es normal en ti.'),
reportTitle: L('Share and save', 'Compartir y guardar'),
btnReport: L('Summary for the doctor', 'Resumen para el médico'), btnBackup: L('Save a copy', 'Guardar una copia'),
footer: L('ASTRA helps you notice changes. It does not diagnose. Every number on this screen is demo data, and the limits are drafts waiting for the biomedical team.', 'ASTRA te ayuda a notar cambios. No hace diagnósticos. Todos los números de esta pantalla son datos de demostración, y los límites son borradores pendientes del equipo biomédico.')
};
const reportNote = online
? L('Your data is saved on this device and backed up while you are connected.', 'Tus datos se guardan en este dispositivo y se respaldan mientras estás conectado.')
: L('Your data is saved on this device. The backup will continue when the connection is back.', 'Tus datos se guardan en este dispositivo. El respaldo seguirá cuando vuelva la conexión.');
const radColor = radSaved && LEVELS[radSaved.level] ? LEVELS[radSaved.level].color : '#7CC4F0';
return Object.assign(this.shared(L), { radColor: radColor, t: t, systems: systems, sel: sel, envs: envs, env: env, holo: holo, reportNote: reportNote });
}
render() {
const v = this.renderVals();
return (<><div className="astra-sky" aria-hidden="true"><span className="astra-stars"></span><span className="astra-stars s2"></span><span className="astra-stars s3"></span><span className="astra-spark" style={{ left: "12%", top: "9%", animationDelay: "-4s" }}></span><span className="astra-spark" style={{ left: "83%", top: "6%", animationDelay: "-1s" }}></span><span className="astra-spark" style={{ left: "64%", top: "30%", animationDelay: "-3s" }}></span><span className="astra-spark" style={{ left: "7%", top: "52%", animationDelay: "-4s" }}></span><span className="astra-spark" style={{ left: "91%", top: "61%", animationDelay: "-2s" }}></span><span className="astra-spark" style={{ left: "38%", top: "84%", animationDelay: "-1s" }}></span><span className="astra-shoot" style={{ top: "8%", left: "1100px", animationDelay: "0s", animationDuration: "11s" }}></span><span className="astra-shoot" style={{ top: "26%", left: "1420px", animationDelay: "-4s", animationDuration: "13s" }}></span><span className="astra-shoot" style={{ top: "46%", left: "900px", animationDelay: "-8s", animationDuration: "15s" }}></span><span className="astra-shoot" style={{ top: "64%", left: "1300px", animationDelay: "-2s", animationDuration: "17s" }}></span><span className="astra-shoot" style={{ top: "18%", left: "700px", animationDelay: "-11s", animationDuration: "19s" }}></span><span className="astra-shoot" style={{ top: "80%", left: "1000px", animationDelay: "-6s", animationDuration: "14s" }}></span></div><div style={{ minHeight: "100vh", boxSizing: "border-box", padding: "24px", position: "relative", zIndex: "1", background: "transparent", color: "#F1F4F9", fontFamily: "Inter, system-ui, sans-serif", fontSize: "16px", lineHeight: "1.5" }}><div style={{ maxWidth: "1320px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}><SimBar /><header className="astra-header" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 20px" }}><img src="/assets/astra-logo.png" alt="" style={{ boxShadow: "0 0 0 1px rgba(124, 196, 240, 0.4), 0 0 24px rgba(61, 123, 255, 0.55)", width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }} /><div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}><span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "26px", letterSpacing: "0.1em" }}>{"ASTRA"}</span><span style={{ fontSize: "13px", color: "#A9BEEA" }}>{v.t.day}</span></div><nav aria-label={v.t.navLabel} style={{ display: "flex", flexWrap: "wrap", gap: "6px", flex: "1 1 auto" }}><Link to="/" aria-current="page" style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 18px", borderRadius: "22px", background: "rgba(64, 120, 255, 0.18)", color: "#F1F4F9", fontWeight: "600", textDecoration: "none" }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" style={{ flex: "0 0 auto", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M3 11 L12 4 L21 11"></path><path d="M5.5 9.5 V20 H18.5 V9.5"></path><path d="M10 20 V14 H14 V20"></path></svg>{v.t.navHome}</Link><Link to="/chequeo" style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 18px", borderRadius: "22px", color: "#D3DEF7", fontWeight: "500", textDecoration: "none" }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" style={{ flex: "0 0 auto", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round" }}><rect x="5" y="4" width="14" height="17" rx="2.5"></rect><path d="M9 4 V2.8 H15 V4"></path><path d="M8.5 12.5 L11 15 L15.5 10"></path></svg>{v.t.navCheckin}</Link><Link to="/tendencias" style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 18px", borderRadius: "22px", color: "#D3DEF7", fontWeight: "500", textDecoration: "none" }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" style={{ flex: "0 0 auto", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M3 20 H21"></path><path d="M4 16 L9 11 L13 14 L20 6"></path><path d="M15.5 6 H20 V10.5"></path></svg>{v.t.navTrends}</Link><Link to="/radiacion" style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 18px", borderRadius: "22px", color: "#D3DEF7", fontWeight: "500", textDecoration: "none" }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" style={{ flex: "0 0 auto", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round" }}><circle cx="12" cy="12" r="1.8"></circle><ellipse cx="12" cy="12" rx="9.5" ry="3.8"></ellipse><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(120 12 12)"></ellipse></svg>{v.t.navRad}</Link><Link to="/linea-base" style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 18px", borderRadius: "22px", border: "1px solid rgba(150, 185, 255, 0.5)", color: "#D3DEF7", fontWeight: "500", textDecoration: "none" }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }}><circle cx="12" cy="12" r="3"></circle><path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12 M4.9 4.9 L7 7 M17 17 L19.1 19.1 M4.9 19.1 L7 17 M17 7 L19.1 4.9"></path></svg>{v.navSetup}</Link></nav><div role="group" aria-label={v.t.langLabel} style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "26px", background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", border: "1px solid rgba(130, 175, 255, 0.24)" }}>{(v.langs || []).map((g, $index) => (<React.Fragment key={$index}><button type="button" onClick={g.pick} aria-pressed={g.pressed} style={{ minHeight: "44px", padding: "0 16px", borderRadius: "22px", border: "none", background: g.bg, color: g.fg, fontWeight: "600" }}>{g.label}</button></React.Fragment>))}</div><button type="button" onClick={v.toggleOnline} aria-pressed={v.offlinePressed} style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 16px", borderRadius: "22px", border: "1px solid rgba(130, 175, 255, 0.24)", background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", color: "#F1F4F9", fontWeight: "500" }}><span aria-hidden="true" style={{ width: "10px", height: "10px", borderRadius: "50%", background: v.connColor }}></span>{v.connLabel}</button><Link to="/emergencia" style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 20px", borderRadius: "22px", background: "#C4302B", color: "#FFFFFF", fontWeight: "600", textDecoration: "none" }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M12 3 L22 20 L2 20 Z"></path><path d="M12 10 L12 14"></path><path d="M12 17 L12 17.5"></path></svg>{" "}{v.t.emergency}</Link></header>{v.offline ? (<><div role="status" style={{ border: "1px solid #9B6BFF", borderRadius: "22px", padding: "14px 18px", background: "rgba(12, 26, 84, 0.6)" }}>{v.t.offlineBanner}</div></>) : null}<section aria-label={v.t.summaryLabel} style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "stretch" }}><div style={{ flex: "2 1 420px", minWidth: "0", display: "flex", flexDirection: "column", gap: "10px", justifyContent: "center" }}><h1 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "44px", lineHeight: "1.1", textWrap: "balance" }}>{v.t.heroTitle}</h1><p style={{ margin: "0", fontSize: "20px", color: "#D3DEF7", textWrap: "pretty" }}>{v.t.heroText}</p><p style={{ margin: "0", fontSize: "14px", color: "#7CC4F0" }}>{v.t.sourceNote}</p></div><div style={{ flex: "1 1 320px", minWidth: "0", background: "rgba(124, 196, 240, 0.16)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", border: "1px solid rgba(130, 175, 255, 0.24)", borderRadius: "22px", padding: "20px", display: "flex", flexDirection: "column", gap: "6px" }}><span style={{ fontSize: "14px", fontWeight: "600", color: "#A9BEEA" }}>{v.t.nextLabel}</span><span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "24px" }}>{v.t.nextTitle}</span><span style={{ color: "#A9BEEA" }}>{v.t.nextNote}</span><Link to="/chequeo" style={{ marginTop: "8px", alignSelf: "flex-start", display: "inline-flex", alignItems: "center", minHeight: "48px", padding: "0 24px", borderRadius: "24px", background: "#F1F4F9", color: "#040C33", fontWeight: "600", textDecoration: "none" }}>{v.t.nextBtn}</Link></div></section><section aria-label={v.t.whereLabel} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 24px", background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", border: "1px solid rgba(130, 175, 255, 0.24)", borderRadius: "22px", padding: "16px 20px" }}><span id="where-label" style={{ fontWeight: "600" }}>{v.t.whereLabel}</span><div role="group" aria-labelledby="where-label" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{(v.envs || []).map((e, $index) => (<React.Fragment key={$index}><button type="button" onClick={e.pick} aria-pressed={e.pressed} style={{ minHeight: "44px", padding: "0 18px", borderRadius: "22px", border: `1px solid ${e.border}`, background: e.bg, color: e.fg, fontWeight: "500" }}>{e.label}</button></React.Fragment>))}</div><span style={{ flex: "1 1 360px", color: "#D3DEF7" }}>{v.env.note}</span></section><main style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "stretch" }}><section aria-label={v.t.areasTitle} style={{ flex: "1 1 340px", minWidth: "0", display: "flex", flexDirection: "column", gap: "14px" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "24px" }}>{v.t.areasTitle}</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>{(v.systems || []).map((s, $index) => (<React.Fragment key={$index}><button type="button" className="astra-tile" onClick={s.pick} aria-pressed={s.pressed} style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: "8px", minHeight: "138px", padding: "14px", textAlign: "left", borderRadius: "22px", border: `1px solid ${s.tileBorder}`, background: s.tileBg, boxShadow: s.tileShadow, color: "#F1F4F9", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}><span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}><span aria-hidden="true" style={{ flex: "0 0 32px", height: "32px", borderRadius: "50%", background: s.color, boxShadow: `0 0 16px ${s.glow}`, color: "#040C33", fontSize: "15px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>{s.n}</span><span style={{ fontSize: "12px", fontWeight: "600", padding: "4px 10px", borderRadius: "12px", background: "rgba(4, 12, 51, 0.55)", color: s.color, textAlign: "right" }}>{s.levelLabel}</span></span><span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "18px", lineHeight: "1.2" }}>{s.name}</span><span style={{ fontSize: "14px", color: "#D3DEF7", marginTop: "auto" }}>{s.reading}</span></button></React.Fragment>))}</div></section><section aria-label={v.t.bodyTitle} style={{ flex: "1 1 360px", minWidth: "0", background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", border: "1px solid rgba(130, 175, 255, 0.24)", borderRadius: "22px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", overflow: "hidden" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "22px" }}>{v.t.bodyTitle}</h2><div onPointerDown={v.holo.down} onPointerMove={v.holo.move} onPointerUp={v.holo.up} onPointerCancel={v.holo.up} style={{ position: "relative", width: "100%", maxWidth: "340px", aspectRatio: "300 / 600", margin: "0 auto", touchAction: "none", cursor: v.holo.cursor, userSelect: "none", WebkitUserSelect: "none" }}><div aria-hidden="true" style={{ position: "absolute", left: "4%", right: "4%", top: "4%", bottom: "10%", borderRadius: "50%", background: "radial-gradient(closest-side, rgba(61, 140, 255, 0.32), rgba(61, 140, 255, 0))" }}></div><svg aria-hidden="true" viewBox="0 0 300 600" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", overflow: "visible" }}><defs><filter id="astra-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2" result="b"></feGaussianBlur><feMerge><feMergeNode in="b"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter><linearGradient id="astra-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FD3FF" stopOpacity="0.30"></stop><stop offset="1" stopColor="#3D6BFF" stopOpacity="0.16"></stop></linearGradient></defs><g className="astra-pulse" style={{ animation: "astra-pulse 3.2s ease-in-out infinite" }}><ellipse cx="150" cy="560" rx="112" ry="20" style={{ fill: "rgba(61, 140, 255, 0.12)", stroke: "rgba(124, 196, 240, 0.55)", strokeWidth: "1.5" }}></ellipse><ellipse cx="150" cy="560" rx="80" ry="13" style={{ fill: "none", stroke: "rgba(124, 196, 240, 0.4)", strokeWidth: "1", strokeDasharray: "4 6" }}></ellipse><ellipse cx="150" cy="560" rx="140" ry="26" style={{ fill: "none", stroke: "rgba(124, 196, 240, 0.18)", strokeWidth: "1" }}></ellipse></g><path d={v.holo.backLimbs} style={{ fill: "rgba(80, 150, 255, 0.10)", stroke: "rgba(124, 196, 240, 0.35)", strokeWidth: "1.2" }}></path><path d={v.holo.backBones} style={{ fill: "none", stroke: "rgba(225, 242, 255, 0.35)", strokeWidth: "2.4", strokeLinecap: "round" }}></path><path d={v.holo.body} filter="url(#astra-glow)" style={{ fill: "url(#astra-skin)", stroke: "#7CC4F0", strokeWidth: "1.6", strokeLinejoin: "round" }}></path><g style={{ opacity: v.holo.organOpacity }}><path d={v.holo.bones} style={{ fill: "none", stroke: "rgba(235, 246, 255, 0.75)", strokeWidth: "2.6", strokeLinecap: "round" }}></path><path d={v.holo.brain} style={{ fill: v.holo.brainFill, stroke: "rgba(255, 255, 255, 0.5)", strokeWidth: "1" }}></path><path d={v.holo.brainFolds} style={{ fill: "none", stroke: "rgba(4, 12, 51, 0.35)", strokeWidth: "1.2", strokeLinecap: "round" }}></path><path d={v.holo.lungs} style={{ fill: v.holo.lungFill, stroke: "rgba(255, 255, 255, 0.45)", strokeWidth: "1" }}></path><path d={v.holo.liver} style={{ fill: "rgba(150, 110, 255, 0.55)", stroke: "rgba(255, 255, 255, 0.4)", strokeWidth: "1" }}></path><path d={v.holo.stomach} style={{ fill: "rgba(110, 160, 255, 0.55)", stroke: "rgba(255, 255, 255, 0.4)", strokeWidth: "1" }}></path><path d={v.holo.gut} style={{ fill: v.holo.gutFill, stroke: "rgba(255, 255, 255, 0.4)", strokeWidth: "1" }}></path><path d={v.holo.gutFolds} style={{ fill: "none", stroke: "rgba(4, 12, 51, 0.3)", strokeWidth: "1.2", strokeLinecap: "round" }}></path><path d={v.holo.heart} filter="url(#astra-glow)" style={{ fill: v.holo.heartFill, stroke: "rgba(255, 255, 255, 0.6)", strokeWidth: "1" }}></path><path d={v.holo.eyes} style={{ fill: "#E6F6FF", opacity: v.holo.eyeOpacity }}></path></g><path d={v.holo.frontLimbs} filter="url(#astra-glow)" style={{ fill: "url(#astra-skin)", stroke: "#7CC4F0", strokeWidth: "1.6", strokeLinejoin: "round" }}></path><path d={v.holo.frontBones} style={{ fill: "none", stroke: "rgba(235, 246, 255, 0.7)", strokeWidth: "2.4", strokeLinecap: "round" }}></path></svg>{(v.systems || []).map((s, $index) => (<React.Fragment key={$index}>{s.alert ? (<><span aria-hidden="true" className="astra-beat" style={{ position: "absolute", left: s.x, top: s.y, zIndex: s.mZ, width: "70px", height: "70px", margin: "-35px 0 0 -35px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255, 70, 95, 0.85), rgba(255, 70, 95, 0.35) 40%, rgba(255, 70, 95, 0) 70%)", pointerEvents: "none" }}></span></>) : null}<button type="button" onClick={s.pick} aria-pressed={s.pressed} aria-label={`${s.n}. ${s.name}: ${s.levelLabel}`} style={{ position: "absolute", left: s.x, top: s.y, zIndex: s.mZ2, opacity: s.mOpacity, transform: `scale(${s.mScale})`, width: "34px", height: "34px", margin: "-17px 0 0 -17px", padding: "0", borderRadius: "50%", border: "2px solid #F1F4F9", background: s.markerBg, boxShadow: s.ring, color: "#040C33", fontSize: "15px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{s.n}</button></React.Fragment>))}</div><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}><button type="button" onClick={v.holo.left} aria-label={v.t.rotLeft} style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid rgba(150, 185, 255, 0.5)", background: "rgba(4, 12, 51, 0.5)", color: "#F1F4F9", display: "flex", alignItems: "center", justifyContent: "center" }}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M3 12 a9 9 0 1 0 3 -6.7"></path><path d="M3 3 L3 9 L9 9"></path></svg></button><span style={{ fontSize: "14px", fontWeight: "600", color: "#7CC4F0" }}>{v.t.dragHint}</span><button type="button" onClick={v.holo.right} aria-label={v.t.rotRight} style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid rgba(150, 185, 255, 0.5)", background: "rgba(4, 12, 51, 0.5)", color: "#F1F4F9", display: "flex", alignItems: "center", justifyContent: "center" }}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M21 12 a9 9 0 1 1 -3 -6.7"></path><path d="M21 3 L21 9 L15 9"></path></svg></button></div><p style={{ margin: "0", fontSize: "14px", color: "#A9BEEA", textAlign: "center" }}>{v.t.bodyHint}</p></section><section aria-label={v.sel.name} style={{ flex: "1.3 1 400px", minWidth: "0", background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", border: "1px solid rgba(130, 175, 255, 0.24)", borderRadius: "22px", padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}><div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 14px" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "28px" }}>{v.sel.name}</h2><span style={{ fontSize: "14px", fontWeight: "600", padding: "5px 14px", borderRadius: "22px", background: v.sel.color, color: "#040C33" }}>{v.sel.levelLabel}</span></div><p style={{ margin: "0", fontSize: "18px", textWrap: "pretty" }}>{v.sel.why}</p><div style={{ display: "flex", flexDirection: "column" }}><div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr)", gap: "12px", paddingBottom: "6px", fontSize: "14px", fontWeight: "600", color: "#A9BEEA" }}><span></span><span>{v.t.colToday}</span><span>{v.t.colUsual}</span></div>{(v.sel.rows || []).map((r, $index) => (<React.Fragment key={$index}><div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr)", gap: "12px", padding: "10px 0", borderTop: "1px solid rgba(130, 175, 255, 0.24)" }}><span>{r.label}</span><span style={{ fontWeight: "600" }}>{r.today}</span><span style={{ color: "#A9BEEA" }}>{r.usual}</span></div></React.Fragment>))}</div>{v.sel.hasFactors ? (<><div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><h3 style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#A9BEEA" }}>{v.t.factorsTitle}</h3><ul style={{ margin: "0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "4px" }}>{(v.sel.factors || []).map((f, $index) => (<React.Fragment key={$index}><li>{f.text}</li></React.Fragment>))}</ul></div></>) : null}<div style={{ background: "rgba(64, 120, 255, 0.18)", borderRadius: "18px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px" }}><div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><h3 style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#A9BEEA" }}>{v.t.doTitle}</h3><p style={{ margin: "0", fontSize: "17px" }}>{v.sel.action}</p></div><div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><h3 style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#A9BEEA" }}>{v.t.helpTitle}</h3><p style={{ margin: "0" }}>{v.sel.help}</p></div></div><div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}><Link to="/tendencias" style={{ display: "inline-flex", alignItems: "center", minHeight: "48px", padding: "0 22px", borderRadius: "24px", background: "#F1F4F9", color: "#040C33", fontWeight: "600", textDecoration: "none" }}>{v.t.btnTrend}</Link><Link to="/chequeo" style={{ display: "inline-flex", alignItems: "center", minHeight: "48px", padding: "0 22px", borderRadius: "24px", border: "1px solid rgba(150, 185, 255, 0.5)", color: "#F1F4F9", fontWeight: "500", textDecoration: "none" }}>{v.t.btnMeasure}</Link></div></section></main><section aria-label={v.t.moreLabel} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: "20px" }}><div className="astra-tile" style={{ background: "rgba(124, 196, 240, 0.16)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(124, 196, 240, 0.45)", borderRadius: "26px", padding: "22px", minHeight: "200px", boxSizing: "border-box", boxShadow: "0 12px 40px rgba(0, 8, 40, 0.35)", display: "flex", flexDirection: "column", gap: "6px" }}><div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#7CC4F0" }}><span aria-hidden="true" style={{ width: "44px", height: "44px", borderRadius: "14px", background: "rgba(4, 12, 51, 0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }}><circle cx="12" cy="12" r="2"></circle><ellipse cx="12" cy="12" rx="10" ry="4"></ellipse><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"></ellipse><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"></ellipse></svg></span><h2 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "22px", color: "#F1F4F9" }}>{v.t.radTitle}</h2></div><span style={{ alignSelf: "flex-start", fontSize: "16px", fontWeight: "600", padding: "6px 16px", borderRadius: "18px", background: v.radColor, color: "#040C33" }}>{v.t.radValue}</span><p style={{ margin: "0", color: "#A9BEEA" }}>{v.t.radNote}</p><Link to="/radiacion" style={{ marginTop: "4px", alignSelf: "flex-start", display: "inline-flex", alignItems: "center", minHeight: "48px", padding: "0 20px", borderRadius: "24px", border: "1px solid rgba(150, 185, 255, 0.5)", color: "#F1F4F9", fontWeight: "500", textDecoration: "none" }}>{v.t.radBtn}</Link></div><div className="astra-tile" style={{ background: "rgba(169, 155, 255, 0.17)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(169, 155, 255, 0.45)", borderRadius: "26px", padding: "22px", minHeight: "200px", boxSizing: "border-box", boxShadow: "0 12px 40px rgba(0, 8, 40, 0.35)", display: "flex", flexDirection: "column", gap: "6px" }}><div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#C3B8FF" }}><span aria-hidden="true" style={{ width: "44px", height: "44px", borderRadius: "14px", background: "rgba(4, 12, 51, 0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }}><rect x="3" y="5" width="18" height="16" rx="3"></rect><path d="M3 10 L21 10"></path><path d="M8 3 L8 7"></path><path d="M16 3 L16 7"></path><path d="M9 15.5 L11 17.5 L15 13.5"></path></svg></span><h2 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "22px", color: "#F1F4F9" }}>{v.t.streakTitle}</h2></div><span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "44px", fontWeight: "700", lineHeight: "1.1" }}>{v.t.streakValue}</span><p style={{ margin: "0", color: "#A9BEEA" }}>{v.t.streakNote}</p></div><div className="astra-tile" style={{ background: "rgba(96, 150, 255, 0.17)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(110, 160, 255, 0.45)", borderRadius: "26px", padding: "22px", minHeight: "200px", boxSizing: "border-box", boxShadow: "0 12px 40px rgba(0, 8, 40, 0.35)", display: "flex", flexDirection: "column", gap: "10px" }}><div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#9CC0FF" }}><span aria-hidden="true" style={{ width: "44px", height: "44px", borderRadius: "14px", background: "rgba(4, 12, 51, 0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }}><circle cx="18" cy="5" r="2.5"></circle><circle cx="6" cy="12" r="2.5"></circle><circle cx="18" cy="19" r="2.5"></circle><path d="M8.2 10.8 L15.8 6.2"></path><path d="M8.2 13.2 L15.8 17.8"></path></svg></span><h2 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "22px", color: "#F1F4F9" }}>{v.t.reportTitle}</h2></div><p style={{ margin: "0", color: "#A9BEEA" }}>{v.reportNote}</p><div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}><button type="button" style={{ minHeight: "48px", padding: "0 20px", borderRadius: "24px", border: "1px solid rgba(150, 185, 255, 0.5)", background: "transparent", color: "#F1F4F9", fontWeight: "500" }}>{v.t.btnReport}</button><button type="button" style={{ minHeight: "48px", padding: "0 20px", borderRadius: "24px", border: "1px solid rgba(150, 185, 255, 0.5)", background: "transparent", color: "#F1F4F9", fontWeight: "500" }}>{v.t.btnBackup}</button></div></div></section><footer style={{ fontSize: "14px", color: "#A9BEEA", borderTop: "1px solid rgba(130, 175, 255, 0.24)", paddingTop: "14px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 24px" }}><span style={{ flex: "1 1 480px" }}>{v.t.footer}</span><Link to="/linea-base" style={{ display: "inline-flex", alignItems: "center", minHeight: "44px", color: "#7CC4F0", fontWeight: "500" }}>{v.t.setupLink}</Link></footer></div></div><Stella /></>);
}
}

export default Inicio;
