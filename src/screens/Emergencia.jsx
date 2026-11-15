// Converted from the ASTRA prototype (Emergency.dc.html).
// Logic kept as in the prototype: renderVals() computes everything; render() draws it.
import React from 'react';
import { Link } from 'react-router-dom';
import SimBar from '../components/SimBar.jsx';
import Stella from '../components/Stella.jsx';

class Emergencia extends React.Component {
state = { lang: 'en', online: true, sit: 'unresponsive', step: 0 };
componentDidMount() {
let lang = /^es/i.test((typeof navigator !== 'undefined' && navigator.language) || '') ? 'es' : 'en';
let online = true;
let sit = this.state.sit;
try {
const s = window.localStorage.getItem('astra.lang');
if (s === 'en' || s === 'es') lang = s;
if (window.localStorage.getItem('astra.online') === '0') online = false;
const asked = window.localStorage.getItem('astra.sit');
if (asked) { sit = asked; window.localStorage.removeItem('astra.sit'); }
} catch (e) {}
this.setState({ lang: lang, online: online, sit: sit });
}
remember(key, value) { try { window.localStorage.setItem(key, value); } catch (e) {} }
shared(L) {
const lang = this.state.lang;
const online = this.state.online;
return {
langs: [{ id: 'en', label: 'English' }, { id: 'es', label: 'Español' }].map((g) => {
const on = g.id === lang;
return { label: g.label, pressed: on ? 'true' : 'false', bgRed: on ? '#FFFFFF' : 'transparent', fgRed: on ? '#8E1F1B' : '#FFFFFF',
pick: () => { this.remember('astra.lang', g.id); this.setState({ lang: g.id }); } };
}),
navSetup: L('Baseline setup', 'Línea base'),
connLabel: online ? L('Connected', 'Conectado') : L('No connection', 'Sin conexión'),
offlinePressed: online ? 'false' : 'true',
offline: !online,
toggleOnline: () => { this.remember('astra.online', online ? '0' : '1'); this.setState({ online: !online }); }
};
}
renderVals() {
const es = this.state.lang === 'es';
const L = (en, sp) => (es ? sp : en);
const online = this.state.online;
const S = (title, detail) => ({ title: title, detail: detail });
const tellBoth = L('Tell the medical officer and Earth', 'Avisa al oficial médico y a la Tierra');
const symptoms = L('Check for symptoms', 'Revisa si hay síntomas');
const PROTOCOLS = {
radiation: { label: L('Radiation event', 'Evento de radiación'), steps: [
S(L('Go to the radiation shelter when the mission protocol says so.', 'Ve al refugio contra radiación cuando el protocolo de la misión lo indique.'), ''),
S(L('Stay in the most protected areas of the spacecraft.', 'Quédate en las zonas más protegidas de la nave.'), ''),
S(L('Tell the medical team and the people who monitor radiation.', 'Avisa al equipo médico y a quienes monitorean la radiación.'), ''),
S(L('Stop work outside the spacecraft when the protocol says so.', 'Suspende el trabajo fuera de la nave cuando el protocolo lo indique.'), ''),
S(L('Keep logging your dosimeter during and after the event.', 'Sigue registrando tu dosímetro durante y después del evento.'), '')] },
unresponsive: { label: L('A crewmate is not responding', 'Un compañero no responde'), draft: true, steps: [
S(L('Call your crew', 'Llama a tu tripulación'), L('Say out loud: medical emergency, and where you are. Ask for the medical kit and the defibrillator.', 'Di en voz alta: emergencia médica, y dónde estás. Pide el botiquín y el desfibrilador.')),
S(L('Check if they respond', 'Revisa si responde'), L('Tap both shoulders and speak loudly. Look for any movement or answer.', 'Toca ambos hombros y habla fuerte. Busca cualquier movimiento o respuesta.')),
S(L('Check their breathing', 'Revisa si respira'), L('Watch the chest for up to 10 seconds. Gasping does not count as normal breathing.', 'Mira el pecho hasta por 10 segundos. Jadear no cuenta como respiración normal.')),
S(L('Strap in the patient and yourself', 'Sujeta al paciente y sujétate tú'), L('Use the restraints so you can push on the chest without floating away.', 'Usa las sujeciones para poder presionar el pecho sin salir flotando.')),
S(L('Start chest compressions', 'Empieza las compresiones en el pecho'), L('Push hard and fast on the centre of the chest. Do not stop until the defibrillator is ready.', 'Presiona fuerte y rápido en el centro del pecho. No pares hasta que el desfibrilador esté listo.')),
S(L('Use the defibrillator', 'Usa el desfibrilador'), L('Switch it on and follow its spoken instructions. Continue until the patient responds or the crew medical officer takes over.', 'Enciéndelo y sigue sus instrucciones habladas. Continúa hasta que el paciente responda o el oficial médico tome el control.'))] },
hr: { label: L('Heart rate is critical', 'Pulso en nivel crítico'), steps: [
S(L('Stop any exercise or activity', 'Detén cualquier ejercicio o actividad'), L('Sit down or strap yourself in.', 'Siéntate o sujétate.')),
S(L('Confirm with the ECG', 'Confirma con el ECG'), L('It is more reliable than the band or the PPG sensor.', 'Es más confiable que la banda o el sensor PPG.')),
S(symptoms, L('Chest pain, dizziness, fainting or shortness of breath.', 'Dolor en el pecho, mareo, desmayo o falta de aire.')),
S(tellBoth, L('Send the ECG trace with your message.', 'Envía el trazado del ECG con tu mensaje.')),
S(L('Rest and measure every 5 minutes', 'Reposa y mide cada 5 minutos'), L('Keep going until you get new instructions.', 'Continúa hasta recibir nuevas indicaciones.'))] },
spo2: { label: L('Oxygen is critical', 'Oxígeno en nivel crítico'), steps: [
S(L('Check the oximeter', 'Revisa el oxímetro'), L('Warm finger, no nail polish, no movement.', 'Dedo tibio, sin esmalte y sin movimiento.')),
S(L('Measure again', 'Mide otra vez'), L('Repeat with the pulse oximeter and compare with the PPG sensor.', 'Repite con el oxímetro de pulso y compara con el sensor PPG.')),
S(symptoms, L('Shortness of breath, bluish lips or fingers, or confusion.', 'Falta de aire, labios o dedos azulados, o confusión.')),
S(L('Check the cabin air', 'Revisa el aire de la cabina'), L('ASTRA alerts the medical officer to check the oxygen and CO₂ levels in the cabin.', 'ASTRA avisa al oficial médico para que verifique los niveles de oxígeno y CO₂ de la cabina.')),
S(L('Rest and breathe slowly and deeply', 'Reposa y respira lento y profundo'), L('Tell Earth and wait for medical instructions.', 'Avisa a la Tierra y espera indicaciones médicas.'))] },
bp: { label: L('Blood pressure is critical', 'Presión arterial en nivel crítico'), steps: [
S(L('Sit for 5 minutes and measure again', 'Siéntate 5 minutos y mide otra vez'), L('Keep your arm at the level of your heart.', 'Mantén el brazo a la altura del corazón.')),
S(L('Confirm with the digital monitor', 'Confirma con el tensiómetro digital'), L('Compare with the ABPM if you are wearing it.', 'Compara con el ABPM si lo llevas puesto.')),
S(symptoms, L('Strong headache, blurry vision, chest pain, weakness or trouble speaking.', 'Dolor de cabeza fuerte, visión borrosa, dolor en el pecho, debilidad o dificultad para hablar.')),
S(tellBoth, L('Send your recent blood pressure history.', 'Envía tu historial reciente de presión.')),
S(L('Avoid physical effort', 'Evita el esfuerzo físico'), L('Measure every 10 minutes until you get instructions.', 'Mide cada 10 minutos hasta recibir indicaciones.'))] },
temp: { label: L('Temperature is critical', 'Temperatura en nivel crítico'), steps: [
S(L('Measure again', 'Mide otra vez'), L('Repeat with the infrared thermometer and confirm with the skin sensor.', 'Repite con el termómetro infrarrojo y confirma con el sensor cutáneo.')),
S(symptoms, L('Chills, confusion, headache or vomiting.', 'Escalofríos, confusión, dolor de cabeza o vómito.')),
S(L('Check the cabin and your hydration', 'Revisa la cabina y tu hidratación'), L('Look at the cabin temperature and how much you have had to drink.', 'Mira la temperatura de la cabina y cuánto has tomado.')),
S(tellBoth, L('Use cooling measures only if the doctors tell you to.', 'Usa medidas de enfriamiento solo si los médicos lo indican.')),
S(L('Measure every 15 minutes', 'Mide cada 15 minutos'), L('Keep a record of how it changes.', 'Registra cómo va cambiando.'))] },
bone: { label: L('Bone test is critical', 'Prueba de huesos en nivel crítico'), steps: [
S(L('Tell the mission medical team right away', 'Avisa de inmediato al equipo médico de la misión'), L('Tell them the color of your strip.', 'Diles el color de tu tira.')),
S(L('Do a quick second test', 'Haz una contraprueba rápida'), L('This rules out a false result, contamination or a bad reading.', 'Sirve para descartar un resultado falso, contaminación o una mala lectura.')),
S(L('If the result repeats, follow your new training plan', 'Si el resultado se repite, sigue tu nuevo plan de entrenamiento'), L('The space physiologists will redesign your daily training with more load and more repetitions, so your skeleton holds on to its minerals.', 'Los fisiólogos espaciales rediseñarán tu entrenamiento diario con más carga y más repeticiones, para que tu esqueleto retenga sus minerales.')),
S(L('Medication only if the doctors decide', 'Medicamentos solo si los médicos lo deciden'), L('If needed, the doctors will decide whether to give fast-acting medication to slow bone loss.', 'Si hace falta, los médicos decidirán si administran medicamentos de acción rápida para frenar la pérdida de hueso.'))] }
};
const order = ['unresponsive', 'hr', 'spo2', 'bp', 'temp', 'bone', 'radiation'];
const sitId = PROTOCOLS[this.state.sit] ? this.state.sit : 'unresponsive';
const proto = PROTOCOLS[sitId];
const total = proto.steps.length;
const idx = Math.min(Math.max(this.state.step, 0), total - 1);
const steps = proto.steps.map((s, i) => {
const current = i === idx;
const done = i < idx;
return Object.assign({}, s, {
n: String(i + 1),
mark: done ? L('Done', 'Listo') : (current ? L('Now', 'Ahora') : ''),
bg: current ? 'rgba(64, 120, 255, 0.18)' : 'transparent',
fg: done ? '#A9BEEA' : '#F1F4F9',
weight: current ? '600' : '400'
});
});
const situations = order.map((id) => {
const on = id === sitId;
return { label: PROTOCOLS[id].label, pressed: on ? 'true' : 'false', bg: on ? '#F1F4F9' : 'rgba(12, 26, 84, 0.6)', fg: on ? '#040C33' : '#F1F4F9', border: on ? '#F1F4F9' : 'rgba(150, 185, 255, 0.5)',
pick: () => this.setState({ sit: id, step: 0 }) };
});
const status = [
{ label: L('Time since you started', 'Tiempo desde que empezaste'), value: '01:10' },
{ label: L('Your crew', 'Tu tripulación'), value: L('Alerted', 'Avisada') },
{ label: L('Message to Earth', 'Mensaje a la Tierra'), value: online ? L('Sent', 'Enviado') : L('Will go out when the connection is back', 'Saldrá cuando vuelva la conexión') },
{ label: L('Earliest answer', 'Respuesta más temprana'), value: online ? L('In about 11 minutes', 'En unos 11 minutos') : L('Unknown for now', 'Desconocida por ahora') }
];
const t = {
title: L('EMERGENCY', 'EMERGENCIA'), langLabel: L('Language', 'Idioma'), exit: L('Exit', 'Salir'),
context: online
? L('You are on the spacecraft. Messages to Earth take about 6 minutes each way, so act first. Earth will answer later.', 'Estás en la nave. Los mensajes a la Tierra tardan unos 6 minutos por trayecto, así que actúa primero. La Tierra responderá después.')
: L('There is no connection right now. These steps are saved on this device and work the same.', 'No hay conexión en este momento. Estos pasos están guardados en este dispositivo y funcionan igual.'),
question: L('What is happening?', '¿Qué está pasando?'),
back: L('Back', 'Atrás'),
aloneTitle: L('You are not alone', 'No estás solo'),
allSteps: L('All the steps', 'Todos los pasos')
};
const footer = proto.draft
? L('These steps are a draft to show the layout. The biomedical team will replace them with validated steps before the demo. Times and message status are demo data.', 'Estos pasos son un borrador para mostrar el diseño. El equipo biomédico los reemplazará por pasos validados antes de la demo. Los tiempos y el estado de los mensajes son datos de demostración.')
: L('These steps come from the biomedical team. ASTRA does not recommend medication or doses on its own. Times and message status are demo data.', 'Estos pasos vienen del equipo biomédico. ASTRA no recomienda medicamentos ni dosis por su cuenta. Los tiempos y el estado de los mensajes son datos de demostración.');
return Object.assign(this.shared(L), {
t: t, situations: situations, steps: steps, status: status, footer: footer,
step: steps[idx],
stepLabel: L('Step ' + (idx + 1) + ' of ' + total, 'Paso ' + (idx + 1) + ' de ' + total),
nextLabel: idx === total - 1 ? L('Done, keep going', 'Listo, sigue así') : L('Done, next step', 'Listo, siguiente paso'),
next: () => this.setState({ step: Math.min(idx + 1, total - 1) }),
back: () => this.setState({ step: Math.max(idx - 1, 0) })
});
}
render() {
const v = this.renderVals();
return (<><div className="astra-sky" aria-hidden="true"><span className="astra-stars"></span><span className="astra-stars s2"></span><span className="astra-stars s3"></span><span className="astra-spark" style={{ left: "12%", top: "9%", animationDelay: "-4s" }}></span><span className="astra-spark" style={{ left: "83%", top: "6%", animationDelay: "-1s" }}></span><span className="astra-spark" style={{ left: "64%", top: "30%", animationDelay: "-3s" }}></span><span className="astra-spark" style={{ left: "7%", top: "52%", animationDelay: "-4s" }}></span><span className="astra-spark" style={{ left: "91%", top: "61%", animationDelay: "-2s" }}></span><span className="astra-spark" style={{ left: "38%", top: "84%", animationDelay: "-1s" }}></span><span className="astra-shoot" style={{ top: "8%", left: "1100px", animationDelay: "0s", animationDuration: "11s" }}></span><span className="astra-shoot" style={{ top: "26%", left: "1420px", animationDelay: "-4s", animationDuration: "13s" }}></span><span className="astra-shoot" style={{ top: "46%", left: "900px", animationDelay: "-8s", animationDuration: "15s" }}></span><span className="astra-shoot" style={{ top: "64%", left: "1300px", animationDelay: "-2s", animationDuration: "17s" }}></span><span className="astra-shoot" style={{ top: "18%", left: "700px", animationDelay: "-11s", animationDuration: "19s" }}></span><span className="astra-shoot" style={{ top: "80%", left: "1000px", animationDelay: "-6s", animationDuration: "14s" }}></span></div><div style={{ minHeight: "100vh", boxSizing: "border-box", position: "relative", zIndex: "1", background: "transparent", color: "#F1F4F9", fontFamily: "Inter, system-ui, sans-serif", fontSize: "16px", lineHeight: "1.5" }}><SimBar /><header style={{ background: "#C4302B", color: "#FFFFFF", padding: "14px 24px" }}><div style={{ maxWidth: "1320px", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 20px" }}><img src="/assets/astra-logo.png" alt="" style={{ boxShadow: "0 0 0 1px rgba(124, 196, 240, 0.4), 0 0 24px rgba(61, 123, 255, 0.55)", width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }} /><svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M12 3 L22 20 L2 20 Z"></path><path d="M12 10 L12 14"></path><path d="M12 17 L12 17.5"></path></svg><span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "26px", letterSpacing: "0.06em", flex: "1 1 auto" }}>{v.t.title}</span><div role="group" aria-label={v.t.langLabel} style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "26px", border: "1px solid #FFFFFF" }}>{(v.langs || []).map((g, $index) => (<React.Fragment key={$index}><button type="button" onClick={g.pick} aria-pressed={g.pressed} style={{ minHeight: "44px", padding: "0 16px", borderRadius: "22px", border: "none", background: g.bgRed, color: g.fgRed, fontWeight: "600" }}>{g.label}</button></React.Fragment>))}</div><button type="button" onClick={v.toggleOnline} aria-pressed={v.offlinePressed} style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 16px", borderRadius: "22px", border: "1px solid #FFFFFF", background: "transparent", color: "#FFFFFF", fontWeight: "500" }}>{v.connLabel}</button><Link to="/" style={{ display: "inline-flex", alignItems: "center", minHeight: "44px", padding: "0 18px", borderRadius: "22px", border: "1px solid #FFFFFF", color: "#FFFFFF", fontWeight: "600", textDecoration: "none" }}>{v.t.exit}</Link></div></header><div style={{ maxWidth: "1320px", margin: "0 auto", boxSizing: "border-box", padding: "24px", display: "flex", flexDirection: "column", gap: "22px" }}><p style={{ margin: "0", fontSize: "18px", color: "#D3DEF7" }}>{v.t.context}</p><section aria-label={v.t.question} style={{ display: "flex", flexDirection: "column", gap: "10px" }}><span id="sit-label" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "24px" }}>{v.t.question}</span><div role="group" aria-labelledby="sit-label" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: "10px" }}>{(v.situations || []).map((s, $index) => (<React.Fragment key={$index}><button type="button" className="astra-tile" onClick={s.pick} aria-pressed={s.pressed} style={{ minHeight: "72px", padding: "10px 16px", textAlign: "left", borderRadius: "22px", border: `2px solid ${s.border}`, background: s.bg, color: s.fg, fontSize: "17px", fontWeight: "600" }}>{s.label}</button></React.Fragment>))}</div></section><main style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "stretch" }}><section aria-label={v.stepLabel} style={{ flex: "2 1 560px", minWidth: "0", background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", border: "1px solid rgba(130, 175, 255, 0.24)", borderRadius: "22px", padding: "30px", display: "flex", flexDirection: "column", gap: "18px" }}><span style={{ fontSize: "17px", fontWeight: "600", color: "#A9BEEA" }}>{v.stepLabel}</span><h1 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "46px", lineHeight: "1.1", textWrap: "balance" }}>{v.step.title}</h1><p style={{ margin: "0", fontSize: "24px", lineHeight: "1.4", textWrap: "pretty" }}>{v.step.detail}</p><div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "auto", paddingTop: "12px" }}><button type="button" onClick={v.next} style={{ minHeight: "68px", padding: "0 36px", borderRadius: "34px", border: "none", background: "#F1F4F9", color: "#040C33", fontSize: "21px", fontWeight: "600" }}>{v.nextLabel}</button><button type="button" onClick={v.back} style={{ minHeight: "68px", padding: "0 28px", borderRadius: "34px", border: "1px solid rgba(150, 185, 255, 0.5)", background: "transparent", color: "#F1F4F9", fontSize: "19px", fontWeight: "500" }}>{v.t.back}</button></div></section><aside aria-label={v.t.aloneTitle} style={{ flex: "1 1 320px", minWidth: "0", display: "flex", flexDirection: "column", gap: "20px" }}><div style={{ background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", border: "1px solid rgba(130, 175, 255, 0.24)", borderRadius: "22px", padding: "20px", display: "flex", flexDirection: "column" }}><h2 style={{ margin: "0 0 8px 0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "22px" }}>{v.t.aloneTitle}</h2>{(v.status || []).map((r, $index) => (<React.Fragment key={$index}><div style={{ display: "flex", justifyContent: "space-between", gap: "16px", padding: "10px 0", borderTop: "1px solid rgba(130, 175, 255, 0.24)" }}><span style={{ color: "#D3DEF7" }}>{r.label}</span><span style={{ fontWeight: "600", textAlign: "right" }}>{r.value}</span></div></React.Fragment>))}</div><div style={{ background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", border: "1px solid rgba(130, 175, 255, 0.24)", borderRadius: "22px", padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "22px" }}>{v.t.allSteps}</h2><ol style={{ margin: "0", padding: "0", listStyle: "none", display: "flex", flexDirection: "column", gap: "4px" }}>{(v.steps || []).map((p, $index) => (<React.Fragment key={$index}><li style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "44px", padding: "4px 12px", borderRadius: "12px", background: p.bg, color: p.fg }}><span style={{ fontWeight: "600" }}>{p.n}</span><span style={{ fontWeight: p.weight }}>{p.title}</span><span style={{ marginLeft: "auto", fontSize: "13px", fontWeight: "600" }}>{p.mark}</span></li></React.Fragment>))}</ol></div></aside></main><footer style={{ fontSize: "14px", color: "#A9BEEA", borderTop: "1px solid rgba(130, 175, 255, 0.24)", paddingTop: "14px" }}>{v.footer}</footer></div></div><Stella /></>);
}
}

export default Emergencia;
