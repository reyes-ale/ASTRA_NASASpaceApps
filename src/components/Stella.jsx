// Converted from the ASTRA prototype (Stella.dc.html).
// Logic kept as in the prototype: renderVals() computes everything; render() draws it.
import React from 'react';

class Stella extends React.Component {
state = { lang: 'es', open: false, msgs: [], typed: 0, blink: true, draft: '', pos: null, level: '', areas: [], teaser: '', w: 420, h: 600 };
componentDidMount() {
let lang = /^es/i.test((typeof navigator !== 'undefined' && navigator.language) || '') ? 'es' : 'en';
try { const s = window.localStorage.getItem('astra.lang'); if (s === 'en' || s === 'es') lang = s; } catch (e) {}
try { this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { this.reduce = false; }
this.setState({ lang: lang, w: window.innerWidth, h: window.innerHeight });
this.readSigns(true);
this.poll = setInterval(() => { this.readSigns(false); if (window.innerWidth !== this.state.w || window.innerHeight !== this.state.h) this.setState({ w: window.innerWidth, h: window.innerHeight }); }, 1000);
this.tick = 0;
this.typer = setInterval(() => {
this.tick++;
const last = this.state.msgs[this.state.msgs.length - 1];
if (last && last.who === 'stella' && this.state.typed < last.text.length) this.setState({ typed: this.state.typed + 2 });
else if (this.tick % 16 === 0 && this.state.open) this.setState({ blink: !this.state.blink });
}, 28);
try { const sp = JSON.parse(window.localStorage.getItem('astra.stellaPos') || 'null'); if (sp && typeof sp.x === 'number') this.setState({ pos: sp }); } catch (e) {}
}
componentWillUnmount() { clearInterval(this.poll); clearInterval(this.typer); clearTimeout(this.teaseT); }
remember(pos) { try { window.localStorage.setItem('astra.stellaPos', JSON.stringify(pos)); } catch (e) {} }
L(en, sp) { return this.state.lang === 'es' ? sp : en; }
readSigns(first) {
let lang = this.state.lang;
let ck = null;
try { const s = window.localStorage.getItem('astra.lang'); if (s === 'en' || s === 'es') lang = s; ck = JSON.parse(window.localStorage.getItem('astra.checkin') || 'null');
const sm = JSON.parse(window.localStorage.getItem('astra.sim') || 'null');
if (sm && sm.on) { const all = JSON.parse(window.localStorage.getItem('astra.simdata') || 'null'); const a = all && all[sm.astro]; const d = a && (a.days.find((x) => x.day === sm.day) || a.days[a.days.length - 1]); if (d) ck = d; }
} catch (e) {}
const RANK = { good: 0, watch: 1, care: 2, urgent: 3 };
let level = '';
const areas = [];
if (ck && ck.results) {
Object.keys(ck.results).forEach((k) => { const lv = ck.results[k].level; if (!level || RANK[lv] > RANK[level]) level = lv; if (lv !== 'good') areas.push(k); });
}
const changed = level !== this.state.level;
if (lang !== this.state.lang || changed || first) this.setState({ lang: lang, level: level, areas: areas });
if (first) this.tease(lang === 'es' ? 'hola, soy stella. tócame si tienes una pregunta.' : 'hi, i am stella. tap me if you have a question.');
else if (changed && level && level !== 'good') this.tease(lang === 'es' ? 'noté un cambio en tus signos. ¿hablamos?' : 'i noticed a change in your signs. want to talk?');
}
tease(text) { this.setState({ teaser: text }); clearTimeout(this.teaseT); this.teaseT = setTimeout(() => this.setState({ teaser: '' }), 7000); }
home() { return { x: Math.max(8, this.state.w - 128), y: Math.max(8, this.state.h - 128) }; }
clampPos(x, y) { return { x: Math.min(Math.max(4, x), Math.max(4, this.state.w - 108)), y: Math.min(Math.max(4, y), Math.max(4, this.state.h - 108)) }; }
say(text) { const msgs = this.state.msgs.concat([{ who: 'stella', text: text }]).slice(-7); this.setState({ msgs: msgs, typed: 0 }); }
answer(q) {
const L = (en, sp) => this.L(en, sp);
const n = (q || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const has = (...ws) => ws.some((w) => n.indexOf(w) >= 0);
const NAMES = { hr: L('heart rate', 'pulso'), spo2: L('oxygen', 'oxígeno'), bp: L('blood pressure', 'presión arterial'), temp: L('temperature', 'temperatura'), urine: L('bone test', 'prueba de huesos'), mind: L('mind', 'mente'), exercise: L('exercise', 'ejercicio'), sleep: L('sleep', 'sueño') };
if (has('hola', 'hello', 'hi ', 'hey') || n.trim() === 'hi') return L('Hi! I am Stella, the ASTRA assistant. Ask me something quick about your health or how to use ASTRA.', '¡Hola! Soy Stella, la asistente de ASTRA. Pregúntame algo rápido sobre tu salud o sobre cómo usar ASTRA.');
if (has('estoy', 'como voy', 'resumen', 'how am i', 'status', 'today', 'hoy')) {
if (!this.state.level) return L('I do not have a saved check-in yet. Do your daily check-in and I will tell you how you are doing.', 'Todavía no tengo un chequeo guardado. Haz tu chequeo diario y te digo cómo vas.');
if (this.state.level === 'good') return L('Everything you measured in your last check-in is in the healthy range. Keep your routine.', 'Todo lo que mediste en tu último chequeo está en el rango saludable. Sigue tu rutina.');
return L('In your last check-in these need attention: ', 'En tu último chequeo esto necesita atención: ') + this.state.areas.map((a) => NAMES[a] || a).join(', ') + L('. Open Home to see what you can do now.', '. Abre Inicio para ver qué puedes hacer ahora.');
}
if (has('emergen', 'auxilio', 'socorro', 'help me')) return L('Tap the red Emergency button at the top. It guides you step by step and alerts your crew.', 'Toca el botón rojo de Emergencia arriba. Te guía paso a paso y avisa a tu tripulación.');
if (has('radia', 'solar', 'refugio', 'shelter')) {
if (has('limite', 'limit', 'msv')) return L('The NASA protection limit for one solar event is 250 mSv.', 'El límite de protección de NASA para un evento solar es de 250 mSv.');
return L('During a radiation event: 1) go to the radiation shelter when the mission protocol says so. 2) stay in the most protected areas of the spacecraft. 3) tell the medical team and the people who monitor radiation. 4) stop work outside the spacecraft when the protocol says so. 5) keep logging your dosimeter during and after the event.', 'Durante un evento de radiación: 1) ve al refugio contra radiación cuando el protocolo de la misión lo indique. 2) quédate en las zonas más protegidas de la nave. 3) avisa al equipo médico y a quienes monitorean la radiación. 4) suspende el trabajo fuera de la nave cuando el protocolo lo indique. 5) sigue registrando tu dosímetro durante y después del evento.');
}
if (has('pulso', 'corazon', 'latid', 'heart', 'pulse')) return L('Healthy resting heart rate: 60 to 100. If it is high: rest for 10 minutes, measure again and drink some water. Under 40 or over 130 is urgent: open Emergency.', 'Pulso saludable en reposo: 60 a 100. Si está alto: descansa 10 minutos, mide otra vez y toma agua. Menos de 40 o más de 130 es urgente: abre Emergencia.');
if (has('oxig', 'oxygen', 'spo2', 'saturac')) return L('Keep your hands warm and still, put the oximeter on your index or middle finger and wait 10 to 15 seconds. Healthy: 95 to 100%. Under 90% is urgent.', 'Mantén las manos tibias y quietas, coloca el oxímetro en el dedo índice o medio y espera de 10 a 15 segundos. Saludable: 95 a 100%. Menos de 90% es urgente.');
if (has('presion', 'pressure', 'tension arterial')) return L('Sit with your back straight and your arm at the level of your heart, and rest 5 minutes first. Healthy: under 120 over under 80. 180 or more over 120 or more is urgent.', 'Siéntate con la espalda recta y el brazo a la altura del corazón, y descansa 5 minutos antes. Saludable: menos de 120 sobre menos de 80. 180 o más sobre 120 o más es urgente.');
if (has('temperatura', 'fiebre', 'fever', 'temperature', 'temp')) return L('Healthy: 36.1 to 37.2 °C. 37.5 °C or more, keep an eye on it. 38.3 °C or more needs care. 39.5 °C or more is urgent.', 'Saludable: 36.1 a 37.2 °C. 37.5 °C o más, hay que vigilar. 38.3 °C o más necesita cuidado. 39.5 °C o más es urgente.');
if (has('dorm', 'sueno', 'sleep', 'descans')) return L('Optimal rest: 7 to 8 hours. Under 5 hours, tell the crew medical officer if it happens again.', 'Descanso óptimo: 7 a 8 horas. Si duermes menos de 5 horas, avisa al oficial médico de la tripulación si se repite.');
if (has('ejercic', 'exercise', 'entren', 'musculo', 'hueso')) return L('Your usual: 45 minutes a day. Without gravity, muscles and bones weaken quickly, and daily exercise is the main way to protect them.', 'Lo habitual en ti: 45 minutos al día. Sin gravedad, los músculos y los huesos se debilitan rápido, y el ejercicio diario es la principal forma de protegerlos.');
if (has('linea base', 'baseline', 'configur')) return L('Tap Baseline setup in the top menu to update your starting numbers.', 'Toca Línea base en el menú de arriba para actualizar tus números de partida.');
if (has('chequeo', 'check')) return L('Open Check-in in the top menu. It takes about 4 minutes and saves everything on this device.', 'Abre Chequeo en el menú de arriba. Toma unos 4 minutos y guarda todo en este dispositivo.');
return L('I do not know how to answer that yet. Try one of the quick questions, or ask the crew medical officer.', 'Todavía no sé responder eso. Prueba una de las preguntas rápidas o pregúntale al oficial médico de la tripulación.');
}
ask(q) {
const msgs = this.state.msgs.concat([{ who: 'you', text: q }]).slice(-7);
this.setState({ msgs: msgs, draft: '' });
setTimeout(() => this.say(this.answer(q)), 350);
}
renderVals() {
const L = (en, sp) => this.L(en, sp);
const COLORS = { '': ['#FFFFFF', '#EAF4FF', '#BFD9FF', 'rgba(220, 238, 255, 0.85)'], good: ['#FFFFFF', '#EAF4FF', '#BFD9FF', 'rgba(220, 238, 255, 0.85)'], watch: ['#B9A5FF', '#CDBFFF', '#9C86F5', 'rgba(185, 165, 255, 0.9)'], care: ['#9B6BFF', '#B48DFF', '#7A4DE8', 'rgba(155, 107, 255, 0.95)'], urgent: ['#FF6B81', '#FF9AAA', '#E8445E', 'rgba(255, 107, 129, 0.95)'] };
const col = COLORS[this.state.level] || COLORS[''];
const pts = [];
for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const r = i % 2 === 0 ? 42 : 21; pts.push((60 + Math.cos(a) * r).toFixed(1) + ' ' + (64 + Math.sin(a) * r).toFixed(1)); }
const starPath = 'M ' + pts.join(' L ') + ' Z';
const p = this.state.pos ? this.clampPos(this.state.pos.x, this.state.pos.y) : this.home();
const below = p.y < this.state.h / 2;
const boxLeft = Math.min(Math.max(8, p.x + 52 - 200), Math.max(8, this.state.w - 408)) + 'px';
const msgs = this.state.msgs;
const lines = msgs.map((m, i) => {
const lastStella = i === msgs.length - 1 && m.who === 'stella';
const text = lastStella ? m.text.slice(0, this.state.typed) : m.text;
return { prompt: m.who === 'stella' ? 'stella> ' : L('you> ', 'tú> '), promptColor: m.who === 'stella' ? '#7CC4F0' : '#C3B8FF', color: m.who === 'stella' ? '#CFEFFF' : '#E4DEFF', text: text, cursor: lastStella && (this.state.typed < m.text.length || this.state.blink) ? 1 : 0 };
});
const qs = [L('How am I today?', '¿Cómo estoy hoy?'), L('My heart rate is high', 'Mi pulso está alto'), L('How much should I sleep?', '¿Cuánto debo dormir?'), L('Radiation event', 'Evento de radiación'), L('How do I measure oxygen?', '¿Cómo mido mi oxígeno?')];
const chips = qs.map((q) => ({ label: q, ask: () => this.ask(q) }));
const teaserX = (p.x > 270 ? p.x - 258 : p.x + 112) + 'px';
return {
t: { open: L('Stella, the ASTRA assistant. Open the chat', 'Stella, la asistente de ASTRA. Abrir el chat'), close: L('Close the chat', 'Cerrar el chat'), title: L('Chat with Stella', 'Chat con Stella'),
inputLabel: L('Ask Stella a question', 'Hazle una pregunta a Stella'), placeholder: L('type a question…', 'escribe una pregunta…'), send: L('send', 'enviar'),
disclaimer: L('Stella gives quick answers from ASTRA. She does not diagnose.', 'Stella da respuestas rápidas de ASTRA. No hace diagnósticos.'), watermark: L('Made with Claude Code', 'Creado con Claude Code') },
starPath: starPath, tint: col[1], tintDeep: col[2], glow: col[3],
starX: p.x + 'px', starY: p.y + 'px',
teaser: this.state.teaser, showTeaser: !!this.state.teaser && !this.state.open,
teaserX: teaserX, teaserY: (p.y + 18) + 'px',
boxLeft: boxLeft, boxTop: below ? (p.y + 110) + 'px' : 'auto', boxBottom: below ? 'auto' : (this.state.h - p.y + 6) + 'px',
cursor: this.drag && this.drag.moved ? 'grabbing' : 'grab',
dragDown: (e) => { try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) {} this.drag = { sx: e.clientX, sy: e.clientY, px: p.x, py: p.y, moved: false }; },
dragMove: (e) => {
if (!this.drag) return;
const dx = e.clientX - this.drag.sx, dy = e.clientY - this.drag.sy;
if (!this.drag.moved && Math.abs(dx) + Math.abs(dy) < 6) return;
this.drag.moved = true;
this.setState({ pos: this.clampPos(this.drag.px + dx, this.drag.py + dy), teaser: '' });
},
dragUp: () => {
if (!this.drag) return;
if (this.drag.moved) { this.skipClick = true; this.remember(this.state.pos); }
this.drag = null; this.forceUpdate();
},
open: this.state.open, expanded: this.state.open ? 'true' : 'false',
lines: lines, chips: chips, draft: this.state.draft,
typeDraft: (e) => this.setState({ draft: e.target.value }),
submit: (e) => { if (e && e.preventDefault) e.preventDefault(); const q = this.state.draft.trim(); if (q) this.ask(q); },
toggle: () => {
if (this.skipClick) { this.skipClick = false; return; }
const open = !this.state.open;
this.setState({ open: open, teaser: '' });
if (open && this.state.msgs.length === 0) this.say(this.state.level && this.state.level !== 'good'
? L('Hi, I am Stella. I noticed some of your signs need attention. Ask me "how am I today?" to see which ones.', 'Hola, soy Stella. Noté que algunos de tus signos necesitan atención. Pregúntame "¿cómo estoy hoy?" para ver cuáles.')
: L('Hi, I am Stella. Ask me something quick, or pick one of the questions below.', 'Hola, soy Stella. Pregúntame algo rápido o elige una de las preguntas de abajo.'));
}
};
}
render() {
const v = this.renderVals();
return (<><div style={{ fontFamily: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace", color: "#CFEFFF" }}><div aria-label={v.t.watermark} style={{ position: "fixed", left: "16px", bottom: "14px", zIndex: "40", display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 12px", borderRadius: "14px", background: "rgba(4, 12, 51, 0.55)", border: "1px solid rgba(150, 185, 255, 0.3)", fontFamily: "Inter, system-ui, sans-serif", fontSize: "12px", fontWeight: "500", color: "rgba(211, 222, 247, 0.85)", pointerEvents: "none", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}><svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M8 7 L3 12 L8 17"></path><path d="M16 7 L21 12 L16 17"></path><path d="M13.5 5 L10.5 19"></path></svg><span>{v.t.watermark}</span></div>{v.showTeaser ? (<><div role="status" style={{ position: "fixed", left: v.teaserX, top: v.teaserY, zIndex: "61", maxWidth: "250px", padding: "8px 12px", borderRadius: "10px", background: "#070B16", border: "1px solid #3D7BFF", boxShadow: "0 0 18px rgba(61, 123, 255, 0.45)", fontSize: "13px", lineHeight: "1.45", color: "#9FE8FF" }}><span style={{ color: "#7CC4F0" }}>{"stella> "}</span>{v.teaser}</div></>) : null}<button type="button" onClick={v.toggle} onPointerDown={v.dragDown} onPointerMove={v.dragMove} onPointerUp={v.dragUp} onPointerCancel={v.dragUp} aria-label={v.t.open} aria-expanded={v.expanded} style={{ position: "fixed", left: v.starX, top: v.starY, zIndex: "62", width: "104px", height: "104px", padding: "0", border: "none", background: "transparent", cursor: v.cursor, touchAction: "none", userSelect: "none", WebkitUserSelect: "none", filter: `drop-shadow(0 0 10px ${v.glow}) drop-shadow(0 0 22px ${v.glow})` }}><svg aria-hidden="true" viewBox="0 0 120 120" width="104" height="104" style={{ overflow: "visible" }}><defs><radialGradient id="stella-fill" cx="0.42" cy="0.34" r="0.75"><stop offset="0" stopColor="#FFFFFF"></stop><stop offset="0.55" stopColor={v.tint}></stop><stop offset="1" stopColor={v.tintDeep}></stop></radialGradient></defs><g><animateTransform attributeName="transform" type="translate" values="0 0; 0 -6; 0 0" dur="3.2s" repeatCount="indefinite"></animateTransform><path d="M 14 66 A 50 13 -14 0 1 106 44" style={{ fill: "none", stroke: "rgba(159, 232, 255, 0.45)", strokeWidth: "2.5", strokeLinecap: "round" }}></path><path d={v.starPath} style={{ fill: "url(#stella-fill)", stroke: v.tint, strokeWidth: "12", strokeLinejoin: "round" }}></path><path d={v.starPath} style={{ fill: "url(#stella-fill)", stroke: "none" }}></path><path d="M 47 50 Q 52 44 56 47" style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: "3", strokeLinecap: "round", opacity: "0.9" }}></path><path d="M 45 66 Q 49.5 61 54 66" style={{ fill: "none", stroke: "#1B2350", strokeWidth: "3.2", strokeLinecap: "round" }}></path><path d="M 66 66 Q 70.5 61 75 66" style={{ fill: "none", stroke: "#1B2350", strokeWidth: "3.2", strokeLinecap: "round" }}></path><ellipse cx="44" cy="74" rx="5" ry="3" style={{ fill: "#FF9BC0", opacity: "0.65" }}></ellipse><ellipse cx="76" cy="74" rx="5" ry="3" style={{ fill: "#FF9BC0", opacity: "0.65" }}></ellipse><path d="M 56 73 Q 60 77.5 64 73" style={{ fill: "none", stroke: "#1B2350", strokeWidth: "2.6", strokeLinecap: "round" }}></path><path d="M 106 44 A 50 13 -14 0 1 14 66" style={{ fill: "none", stroke: "#9FE8FF", strokeWidth: "2.5", strokeLinecap: "round" }}></path><circle r="3.5" style={{ fill: "#FFFFFF" }}><animateMotion dur="5s" repeatCount="indefinite" path="M 14 66 A 50 13 -14 0 1 106 44 A 50 13 -14 0 1 14 66"></animateMotion></circle></g><g style={{ fill: "#FFFFFF" }}><path d="M 100 14 L 102 21 L 109 23 L 102 25 L 100 32 L 98 25 L 91 23 L 98 21 Z"><animate attributeName="opacity" values="1;0.1;1" dur="1.8s" repeatCount="indefinite"></animate></path><path d="M 16 22 L 17.5 27 L 22.5 28.5 L 17.5 30 L 16 35 L 14.5 30 L 9.5 28.5 L 14.5 27 Z"><animate attributeName="opacity" values="0.15;1;0.15" dur="2.4s" repeatCount="indefinite"></animate></path><path d="M 104 92 L 105.2 96 L 109 97.2 L 105.2 98.4 L 104 102.4 L 102.8 98.4 L 99 97.2 L 102.8 96 Z"><animate attributeName="opacity" values="0.6;0;0.6" dur="1.3s" repeatCount="indefinite"></animate></path><circle cx="60" cy="16" r="2.5"><animate attributeName="opacity" values="0;1;0" dur="2.1s" repeatCount="indefinite"></animate></circle></g></svg></button>{v.open ? (<><section aria-label={v.t.title} style={{ position: "fixed", left: v.boxLeft, top: v.boxTop, bottom: v.boxBottom, zIndex: "63", width: "400px", maxWidth: "calc(100vw - 48px)", background: "#070B16", border: "1px solid #3D7BFF", borderRadius: "12px", boxShadow: "0 0 0 1px rgba(124, 196, 240, 0.15), 0 0 34px rgba(61, 123, 255, 0.5)", overflow: "hidden" }}><div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 6px 6px 12px", background: "#0F1630", borderBottom: "1px solid rgba(61, 123, 255, 0.5)" }}><span aria-hidden="true" style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FF6B81" }}></span><span aria-hidden="true" style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#B9A5FF" }}></span><span aria-hidden="true" style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#7CC4F0" }}></span><span style={{ flex: "1 1 auto", fontSize: "13px", color: "#A9BEEA", textAlign: "center" }}>{"stella@astra:~"}</span><button type="button" onClick={v.toggle} aria-label={v.t.close} style={{ width: "44px", height: "36px", border: "none", borderRadius: "8px", background: "transparent", color: "#A9BEEA", fontFamily: "inherit", fontSize: "18px", cursor: "pointer" }}>{"\u00d7"}</button></div><div aria-live="polite" style={{ padding: "14px 14px 6px 14px", display: "flex", flexDirection: "column", gap: "10px", maxHeight: "280px", overflowY: "auto", fontSize: "13.5px", lineHeight: "1.55" }}>{(v.lines || []).map((m, $index) => (<React.Fragment key={$index}><div style={{ whiteSpace: "pre-wrap", color: m.color }}><span style={{ color: m.promptColor, fontWeight: "600" }}>{m.prompt}</span>{m.text}<span style={{ color: "#7CC4F0", opacity: m.cursor }}>{"\u258c"}</span></div></React.Fragment>))}</div><div style={{ padding: "6px 14px 4px 14px", display: "flex", flexWrap: "wrap", gap: "6px" }}>{(v.chips || []).map((c, $index) => (<React.Fragment key={$index}><button type="button" onClick={c.ask} style={{ minHeight: "36px", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(124, 196, 240, 0.45)", background: "rgba(61, 123, 255, 0.12)", color: "#CFEFFF", fontFamily: "inherit", fontSize: "12.5px", textAlign: "left", cursor: "pointer" }}>{"$ "}{c.label}</button></React.Fragment>))}</div><form onSubmit={v.submit} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px 14px 14px" }}><label htmlFor="stella-q" style={{ color: "#7CC4F0", fontWeight: "600", fontSize: "14px" }}>{">"}<span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>{v.t.inputLabel}</span></label><input id="stella-q" type="text" value={v.draft} onChange={v.typeDraft} placeholder={v.t.placeholder} autoComplete="off" style={{ flex: "1 1 auto", minWidth: "0", minHeight: "40px", padding: "0 10px", borderRadius: "8px", border: "1px solid rgba(124, 196, 240, 0.35)", background: "#0B1022", color: "#F1F4F9", fontFamily: "inherit", fontSize: "13.5px" }} /><button type="submit" style={{ minHeight: "40px", padding: "0 14px", borderRadius: "8px", border: "none", background: "#7CC4F0", color: "#040C33", fontFamily: "inherit", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>{v.t.send}</button></form><p style={{ margin: "0", padding: "0 14px 12px 14px", fontSize: "11.5px", color: "#8EA3CC" }}>{v.t.disclaimer}</p></section></>) : null}</div></>);
}
}

export default Stella;
