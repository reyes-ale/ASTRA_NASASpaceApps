// Converted from the ASTRA prototype (Setup.dc.html).
// Logic kept as in the prototype: renderVals() computes everything; render() draws it.
import React from 'react';
import { Link } from 'react-router-dom';
import SimBar from '../components/SimBar.jsx';
import Stella from '../components/Stella.jsx';
import simData from '../data/sim.json';

class LineaBase extends React.Component {
SIM = simData;
state = { lang: 'en', online: true, simOn: false, astro: 'C001', vals: { height: '165', weight: '60', hr: '70', spo2: '98', sys: '118', dia: '76', temp: '36.7' } };
componentDidMount() {
let lang = /^es/i.test((typeof navigator !== 'undefined' && navigator.language) || '') ? 'es' : 'en';
let online = true;
try {
const s = window.localStorage.getItem('astra.lang');
if (s === 'en' || s === 'es') lang = s;
if (window.localStorage.getItem('astra.online') === '0') online = false;
const saved = JSON.parse(window.localStorage.getItem('astra.baseline') || 'null');
if (saved && saved.vals) this.setState({ vals: Object.assign({}, this.state.vals, saved.vals) });
const sm = JSON.parse(window.localStorage.getItem('astra.sim') || 'null');
if (sm && sm.on && this.SIM[sm.astro]) this.setState({ simOn: true, astro: sm.astro });
} catch (e) {}
this.setState({ lang: lang, online: online });
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
const simOn = this.state.simOn;
const SA = this.SIM[this.state.astro] || this.SIM.C001;
const vals = simOn ? SA.baseline : this.state.vals;
const startSim = (id) => {
this.remember('astra.simdata', JSON.stringify(this.SIM));
let day = 42;
try { const cur = JSON.parse(window.localStorage.getItem('astra.sim') || 'null'); if (cur && cur.on && cur.astro === id && cur.day) day = cur.day; } catch (e) {}
this.remember('astra.sim', JSON.stringify({ on: true, astro: id, day: day }));
this.setState({ simOn: true, astro: id });
};
const modes = [
{ id: 'manual', title: L('Enter my own numbers', 'Ingresar mis números'), text: L('You measure yourself and type your values. Your check-ins are saved on this device.', 'Te mides y escribes tus valores. Tus chequeos se guardan en este dispositivo.') },
{ id: 'sim', title: L('Simulation mode', 'Modo simulación'), text: L('Pick a simulated astronaut and watch a whole mission, day by day.', 'Elige un astronauta simulado y mira una misión completa, día por día.') }
].map((m) => { const on = (m.id === 'sim') === simOn; return Object.assign({}, m, { pressed: on ? 'true' : 'false', bg: on ? 'rgba(124, 196, 240, 0.18)' : 'rgba(4, 12, 51, 0.4)', border: on ? '#7CC4F0' : 'rgba(150, 185, 255, 0.35)',
pick: () => { if (m.id === 'sim') startSim(this.state.astro); else { this.remember('astra.sim', JSON.stringify({ on: false })); this.setState({ simOn: false }); } } }); });
const DOT = { C001: '#7CC4F0', C002: '#B9A5FF', C003: '#9B6BFF', C004: '#9CC0FF' };
const astros = Object.keys(this.SIM).map((id) => { const on = id === this.state.astro; return { id: id, name: L('Astronaut ', 'Astronauta ') + id, story: es ? this.SIM[id].story_es : this.SIM[id].story_en, dot: DOT[id] || '#7CC4F0',
pressed: on ? 'true' : 'false', bg: on ? 'rgba(185, 165, 255, 0.2)' : 'rgba(4, 12, 51, 0.4)', border: on ? '#B9A5FF' : 'rgba(150, 185, 255, 0.35)', pick: () => startSim(id) }; });
const field = (id, label, unit) => ({ id: 'f-' + id, label: label, unit: unit, value: vals[id],
set: (e) => { if (simOn) return; const next = Object.assign({}, vals, { [id]: e.target.value }); this.remember('astra.baseline', JSON.stringify({ vals: next, at: Date.now() })); this.setState({ vals: next }); } });
const aboutFields = [
field('height', L('Height', 'Estatura'), 'cm'),
field('weight', L('Weight', 'Peso'), 'kg')
];
const normalFields = [
field('hr', L('Heart rate while resting', 'Pulso en reposo'), L('beats/min', 'lat/min')),
field('spo2', L('Oxygen in your blood', 'Oxígeno en la sangre'), '%'),
field('sys', L('Blood pressure, top number', 'Presión arterial, número de arriba'), 'mmHg'),
field('dia', L('Blood pressure, bottom number', 'Presión arterial, número de abajo'), 'mmHg'),
field('temp', L('Temperature', 'Temperatura'), '°C')
];
const rangeHint = L('Healthy range: [FROM THE BIOMEDICAL TEAM]', 'Rango saludable: [DEL EQUIPO BIOMÉDICO]');
const tSim = {

modeTitle: L('How do you want to use ASTRA?', '¿Cómo quieres usar ASTRA?'),
pickAstro: L('Choose an astronaut', 'Elige un astronauta'),
simNote: L('These starting numbers belong to the simulated astronaut. All values in simulation mode are simulated.', 'Estos números de partida son del astronauta simulado. Todos los valores del modo simulación son simulados.')
};
const t = {
day: L('Day 1 of the mission · demo data', 'Día 1 de la misión · datos de demostración'),
langLabel: L('Language', 'Idioma'),
offlineBanner: L('No connection right now. Your answers are saved on this device and nothing is lost.', 'No hay conexión en este momento. Tus respuestas se guardan en este dispositivo y no se pierde nada.'),
title: L('Welcome. Let us record your starting point.', 'Te damos la bienvenida. Registremos tu punto de partida.'),
intro: L('You have just left Earth and you are at your best. Measure yourself now so ASTRA knows your starting point. You only do this once, and it takes about 5 minutes.', 'Acabas de salir de la Tierra y estás en tu mejor estado. Mídete ahora para que ASTRA conozca tu punto de partida. Solo se hace una vez y toma unos 5 minutos.'),
aboutTitle: L('About you', 'Sobre ti'),
normalTitle: L('Your normal numbers', 'Tus números normales'),
normalNote: L('Measure each one while resting and type what the device shows.', 'Mide cada uno en reposo y escribe lo que muestra el aparato.'),
doneTitle: L('This is your baseline', 'Esta es tu línea base'),
doneText: L('ASTRA keeps these numbers as your starting point and compares them with the healthy ranges.', 'ASTRA guarda estos números como tu punto de partida y los compara con los rangos saludables.'),
save: L('Save and start', 'Guardar y empezar'),
footer: L('ASTRA helps you notice changes. It does not diagnose. The values shown are demo data, and the healthy ranges will come from the biomedical team.', 'ASTRA te ayuda a notar cambios. No hace diagnósticos. Los valores mostrados son datos de demostración, y los rangos saludables vendrán del equipo biomédico.')
};
Object.assign(t, tSim);
if (simOn) { t.save = L('Start the simulation', 'Empezar la simulación'); t.normalNote = L('Simulated numbers of astronaut ', 'Números simulados del astronauta ') + this.state.astro + '.'; }
return Object.assign(this.shared(L), { simOn: simOn, modes: modes, astros: astros, saveBaseline: () => { if (!simOn) this.remember('astra.baseline', JSON.stringify({ vals: this.state.vals, at: Date.now() })); }, t: t, aboutFields: aboutFields, normalFields: normalFields, rangeHint: rangeHint });
}
render() {
const v = this.renderVals();
return (<><div className="astra-sky" aria-hidden="true"><span className="astra-stars"></span><span className="astra-stars s2"></span><span className="astra-stars s3"></span><span className="astra-spark" style={{ left: "12%", top: "9%", animationDelay: "-4s" }}></span><span className="astra-spark" style={{ left: "83%", top: "6%", animationDelay: "-1s" }}></span><span className="astra-spark" style={{ left: "64%", top: "30%", animationDelay: "-3s" }}></span><span className="astra-spark" style={{ left: "7%", top: "52%", animationDelay: "-4s" }}></span><span className="astra-spark" style={{ left: "91%", top: "61%", animationDelay: "-2s" }}></span><span className="astra-spark" style={{ left: "38%", top: "84%", animationDelay: "-1s" }}></span><span className="astra-shoot" style={{ top: "8%", left: "1100px", animationDelay: "0s", animationDuration: "11s" }}></span><span className="astra-shoot" style={{ top: "26%", left: "1420px", animationDelay: "-4s", animationDuration: "13s" }}></span><span className="astra-shoot" style={{ top: "46%", left: "900px", animationDelay: "-8s", animationDuration: "15s" }}></span><span className="astra-shoot" style={{ top: "64%", left: "1300px", animationDelay: "-2s", animationDuration: "17s" }}></span><span className="astra-shoot" style={{ top: "18%", left: "700px", animationDelay: "-11s", animationDuration: "19s" }}></span><span className="astra-shoot" style={{ top: "80%", left: "1000px", animationDelay: "-6s", animationDuration: "14s" }}></span></div><div style={{ minHeight: "100vh", boxSizing: "border-box", padding: "24px", position: "relative", zIndex: "1", background: "transparent", color: "#F1F4F9", fontFamily: "Inter, system-ui, sans-serif", fontSize: "16px", lineHeight: "1.5" }}><div style={{ maxWidth: "1080px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}><SimBar /><header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 20px" }}><img src="/assets/astra-logo.png" alt="" style={{ boxShadow: "0 0 0 1px rgba(124, 196, 240, 0.4), 0 0 24px rgba(61, 123, 255, 0.55)", width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }} /><div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2", flex: "1 1 auto" }}><span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "26px", letterSpacing: "0.1em" }}>{"ASTRA"}</span><span style={{ fontSize: "13px", color: "#A9BEEA" }}>{v.t.day}</span></div><div role="group" aria-label={v.t.langLabel} style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "26px", background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", border: "1px solid rgba(130, 175, 255, 0.24)" }}>{(v.langs || []).map((g, $index) => (<React.Fragment key={$index}><button type="button" onClick={g.pick} aria-pressed={g.pressed} style={{ minHeight: "44px", padding: "0 16px", borderRadius: "22px", border: "none", background: g.bg, color: g.fg, fontWeight: "600" }}>{g.label}</button></React.Fragment>))}</div><button type="button" onClick={v.toggleOnline} aria-pressed={v.offlinePressed} style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 16px", borderRadius: "22px", border: "1px solid rgba(130, 175, 255, 0.24)", background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", color: "#F1F4F9", fontWeight: "500" }}><span aria-hidden="true" style={{ width: "10px", height: "10px", borderRadius: "50%", background: v.connColor }}></span>{v.connLabel}</button></header>{v.offline ? (<><div role="status" style={{ border: "1px solid #9B6BFF", borderRadius: "22px", padding: "14px 18px", background: "rgba(12, 26, 84, 0.6)" }}>{v.t.offlineBanner}</div></>) : null}<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}><h1 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "44px", lineHeight: "1.1", textWrap: "balance" }}>{v.t.title}</h1><p style={{ margin: "0", fontSize: "20px", color: "#D3DEF7", maxWidth: "820px", textWrap: "pretty" }}>{v.t.intro}</p></div><section aria-label={v.t.modeTitle} style={{ background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", border: "1px solid rgba(130, 175, 255, 0.24)", borderRadius: "22px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "22px" }}>{v.t.modeTitle}</h2><div role="group" aria-label={v.t.modeTitle} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: "12px" }}>{(v.modes || []).map((m, $index) => (<React.Fragment key={$index}><button type="button" className="astra-tile" onClick={m.pick} aria-pressed={m.pressed} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px", minHeight: "96px", padding: "16px 18px", borderRadius: "20px", border: `2px solid ${m.border}`, background: m.bg, color: "#F1F4F9", textAlign: "left", cursor: "pointer" }}><span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "18px" }}>{m.title}</span><span style={{ fontSize: "14px", color: "#D3DEF7" }}>{m.text}</span></button></React.Fragment>))}</div>{v.simOn ? (<><h3 style={{ margin: "6px 0 0 0", fontSize: "16px", fontWeight: "600", color: "#D3DEF7" }}>{v.t.pickAstro}</h3><div role="group" aria-label={v.t.pickAstro} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(220px, 100%), 1fr))", gap: "12px" }}>{(v.astros || []).map((a, $index) => (<React.Fragment key={$index}><button type="button" className="astra-tile" onClick={a.pick} aria-pressed={a.pressed} style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "80px", padding: "14px", borderRadius: "20px", border: `2px solid ${a.border}`, background: a.bg, color: "#F1F4F9", textAlign: "left", cursor: "pointer" }}><span aria-hidden="true" style={{ flex: "0 0 46px", height: "46px", borderRadius: "50%", background: a.dot, color: "#040C33", fontWeight: "700", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" }}>{a.id}</span><span style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontWeight: "700", fontSize: "16px" }}>{a.name}</span><span style={{ fontSize: "13px", color: "#D3DEF7" }}>{a.story}</span></span></button></React.Fragment>))}</div><p style={{ margin: "0", fontSize: "14px", color: "#B9A5FF" }}>{v.t.simNote}</p></>) : null}</section><main style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "flex-start" }}><section aria-label={v.t.aboutTitle} style={{ flex: "1 1 360px", minWidth: "0", background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", border: "1px solid rgba(130, 175, 255, 0.24)", borderRadius: "22px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "24px" }}>{v.t.aboutTitle}</h2>{(v.aboutFields || []).map((f, $index) => (<React.Fragment key={$index}><div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><label htmlFor={f.id} style={{ fontSize: "14px", fontWeight: "600", color: "#A9BEEA" }}>{f.label}</label><div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}><input id={f.id} type="number" value={f.value} onChange={f.set} readOnly={v.simOn} style={{ width: "140px", boxSizing: "border-box", padding: "8px 14px", borderRadius: "18px", border: "1px solid rgba(150, 185, 255, 0.5)", background: "rgba(3, 10, 42, 0.7)", color: "#F1F4F9", fontFamily: "'Space Grotesk', sans-serif", fontSize: "28px", fontWeight: "700" }} /><span style={{ color: "#A9BEEA" }}>{f.unit}</span></div></div></React.Fragment>))}</section><section aria-label={v.t.normalTitle} style={{ flex: "1.5 1 460px", minWidth: "0", background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", border: "1px solid rgba(130, 175, 255, 0.24)", borderRadius: "22px", padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}><div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "24px" }}>{v.t.normalTitle}</h2><p style={{ margin: "0", color: "#A9BEEA" }}>{v.t.normalNote}</p></div>{(v.normalFields || []).map((f, $index) => (<React.Fragment key={$index}><div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 18px", paddingTop: "14px", borderTop: "1px solid rgba(130, 175, 255, 0.24)" }}><label htmlFor={f.id} style={{ flex: "1 1 200px", fontWeight: "600", fontSize: "17px" }}>{f.label}</label><div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}><input id={f.id} type="number" value={f.value} onChange={f.set} readOnly={v.simOn} style={{ width: "130px", boxSizing: "border-box", padding: "8px 14px", borderRadius: "18px", border: "1px solid rgba(150, 185, 255, 0.5)", background: "rgba(3, 10, 42, 0.7)", color: "#F1F4F9", fontFamily: "'Space Grotesk', sans-serif", fontSize: "28px", fontWeight: "700" }} /><span style={{ flex: "0 0 56px", color: "#A9BEEA" }}>{f.unit}</span></div><span style={{ flex: "1 1 100%", fontSize: "14px", color: "#A9BEEA" }}>{v.rangeHint}</span></div></React.Fragment>))}</section></main><section aria-label={v.t.doneTitle} style={{ background: "rgba(64, 120, 255, 0.18)", borderRadius: "22px", padding: "22px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px 24px" }}><div style={{ flex: "1 1 420px", minWidth: "0", display: "flex", flexDirection: "column", gap: "4px" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "22px" }}>{v.t.doneTitle}</h2><p style={{ margin: "0", color: "#D3DEF7" }}>{v.t.doneText}</p></div><Link to="/" onClick={v.saveBaseline} style={{ display: "inline-flex", alignItems: "center", minHeight: "56px", padding: "0 32px", borderRadius: "28px", background: "#F1F4F9", color: "#040C33", fontSize: "18px", fontWeight: "600", textDecoration: "none" }}>{v.t.save}</Link></section><footer style={{ fontSize: "14px", color: "#A9BEEA", borderTop: "1px solid rgba(130, 175, 255, 0.24)", paddingTop: "14px" }}>{v.t.footer}</footer></div></div><Stella /></>);
}
}

export default LineaBase;
