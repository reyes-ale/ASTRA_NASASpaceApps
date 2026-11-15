// Converted from the ASTRA prototype (SimBar.dc.html).
// Logic kept as in the prototype: renderVals() computes everything; render() draws it.
import React from 'react';
import { Link } from 'react-router-dom';

class SimBar extends React.Component {
state = { raw: '', lang: 'es', playing: false };
componentDidMount() { this.read(); this.poll = setInterval(() => this.read(), 600); }
componentWillUnmount() { clearInterval(this.poll); clearInterval(this.player); }
get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
read() {
const raw = (this.get('astra.sim') || '') + '|' + (this.get('astra.env') || '') + '|' + (this.get('astra.lang') || '');
if (raw === this.state.raw) return;
let sim = null, astro = null;
try { sim = JSON.parse(this.get('astra.sim') || 'null'); const all = JSON.parse(this.get('astra.simdata') || 'null'); astro = sim && all ? all[sim.astro] : null; } catch (e) {}
const l = this.get('astra.lang');
this.sim = sim; this.astro = astro;
this.setState({ raw: raw, lang: l === 'en' || l === 'es' ? l : this.state.lang });
if (!(sim && sim.on) && this.state.playing) this.stop();
}
setDay(d) { const s = Object.assign({}, this.sim, { day: d }); this.set('astra.sim', JSON.stringify(s)); this.read(); }
stop() { clearInterval(this.player); this.player = null; this.setState({ playing: false }); }
renderVals() {
const es = this.state.lang === 'es';
const L = (en, sp) => (es ? sp : en);
const sim = this.sim, a = this.astro;
const on = !!(sim && sim.on && a);
const days = on ? a.days.map((d) => d.day) : [29, 42];
const first = days[0], last = days[days.length - 1];
const day = on ? sim.day : last;
const env = this.get('astra.env') || 'ship';
const ENV = { ship: L('spacecraft in transit', 'nave en tránsito'), station: L('orbital station', 'estación orbital'), moon: L('lunar base', 'base lunar') };
const today = on ? (a.days.find((d) => d.day === day) || a.days[a.days.length - 1]) : null;
const dose = today && today.dose ? today.dose[env] : null;
return {
on: on,
playing: this.state.playing, notPlaying: !this.state.playing, playingPressed: this.state.playing ? 'true' : 'false',
t: {
label: L('Simulation mode', 'Modo simulación'), mode: L('SIMULATION', 'SIMULACIÓN'),
astro: on ? L('Astronaut ', 'Astronauta ') + sim.astro + ' · ' + (es ? a.story_es : a.story_en) : '',
envLine: dose !== null ? L('Where: ', 'Dónde: ') + ENV[env] + L(' · radiation today: ', ' · radiación hoy: ') + dose.toFixed(2) + ' mGy' + L(' (simulated)', ' (simulada)') : '',
dayGroup: L('Mission day', 'Día de la misión'),
day: L('Day ', 'Día ') + day + L(' of ', ' de ') + last,
prev: L('Previous day', 'Día anterior'), next: L('Next day', 'Día siguiente'),
play: this.state.playing ? L('Pause', 'Pausar') : L('Play mission', 'Reproducir misión'),
change: L('Change astronaut', 'Cambiar astronauta'), exit: L('Exit simulation', 'Salir de la simulación')
},
prev: () => { this.stop(); if (day > first) this.setDay(day - 1); },
next: () => { this.stop(); if (day < last) this.setDay(day + 1); },
play: () => {
if (this.state.playing) { this.stop(); return; }
if (day >= last) this.setDay(first);
this.setState({ playing: true });
this.player = setInterval(() => {
const cur = this.sim ? this.sim.day : last;
if (cur >= last) { this.stop(); return; }
this.setDay(cur + 1);
}, 2200);
},
exit: () => { this.stop(); this.set('astra.sim', JSON.stringify({ on: false })); this.read(); }
};
}
render() {
const v = this.renderVals();
return (<><div style={{ fontFamily: "Inter, system-ui, sans-serif", color: "#F1F4F9" }}>{v.on ? (<><section aria-label={v.t.label} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 16px", padding: "12px 16px", borderRadius: "20px", background: "rgba(155, 107, 255, 0.18)", border: "1px solid rgba(185, 165, 255, 0.6)", boxShadow: "0 0 24px rgba(155, 107, 255, 0.25)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 12px", borderRadius: "14px", background: "#B9A5FF", color: "#040C33", fontSize: "13px", fontWeight: "700", letterSpacing: "0.04em" }}><svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"></path></svg>{v.t.mode}</span><span style={{ display: "flex", flexDirection: "column", gap: "2px", flex: "1 1 220px", minWidth: "0" }}><span style={{ fontWeight: "700", fontSize: "16px" }}>{v.t.astro}</span><span style={{ fontSize: "13px", color: "#D3DEF7" }}>{v.t.envLine}</span></span><div role="group" aria-label={v.t.dayGroup} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}><button type="button" onClick={v.prev} aria-label={v.t.prev} style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid rgba(185, 165, 255, 0.6)", background: "rgba(4, 12, 51, 0.5)", color: "#F1F4F9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M15 5 L8 12 L15 19"></path></svg></button><span aria-live="polite" style={{ minWidth: "118px", textAlign: "center", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "18px" }}>{v.t.day}</span><button type="button" onClick={v.next} aria-label={v.t.next} style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid rgba(185, 165, 255, 0.6)", background: "rgba(4, 12, 51, 0.5)", color: "#F1F4F9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M9 5 L16 12 L9 19"></path></svg></button><button type="button" onClick={v.play} aria-pressed={v.playingPressed} style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 18px", borderRadius: "22px", border: "none", background: "#F1F4F9", color: "#040C33", fontWeight: "600", fontSize: "15px", cursor: "pointer" }}>{v.playing ? (<><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" style={{ fill: "currentColor" }}><rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect></svg></>) : null}{v.notPlaying ? (<><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" style={{ fill: "currentColor" }}><path d="M7 4 L20 12 L7 20 Z"></path></svg></>) : null}{" "}{v.t.play}</button></div><Link to="/linea-base" style={{ display: "inline-flex", alignItems: "center", minHeight: "44px", padding: "0 14px", borderRadius: "22px", border: "1px solid rgba(150, 185, 255, 0.5)", color: "#D3DEF7", fontSize: "14px", fontWeight: "500", textDecoration: "none" }}>{v.t.change}</Link><button type="button" onClick={v.exit} style={{ minHeight: "44px", padding: "0 14px", borderRadius: "22px", border: "1px solid rgba(150, 185, 255, 0.5)", background: "transparent", color: "#D3DEF7", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>{v.t.exit}</button></section></>) : null}</div></>);
}
}

export default SimBar;
