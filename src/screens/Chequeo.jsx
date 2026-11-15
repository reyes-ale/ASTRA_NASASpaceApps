// Converted from the ASTRA prototype (Checkin.dc.html).
// Logic kept as in the prototype: renderVals() computes everything; render() draws it.
import React from 'react';
import { Link } from 'react-router-dom';
import SimBar from '../components/SimBar.jsx';
import Stella from '../components/Stella.jsx';

class Chequeo extends React.Component {
state = { lang: 'en', online: true, step: 0, ctx: 'rest', strip: '', flags: {}, answers: {}, vals: { hr: '', spo2: '', sys: '', dia: '', temp: '', exh: '', exm: '', sleeph: '' } };
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
const COLORS = { good: '#7CC4F0', watch: '#B9A5FF', care: '#9B6BFF', urgent: '#FF7A7A', info: '#A9BEEA' };
const NAMES = { good: L('All good', 'Todo bien'), watch: L('Keep an eye on it', 'Hay que vigilar'), care: L('Needs care', 'Necesita cuidado'), urgent: L('Urgent', 'Urgente') };
const vals = this.state.vals;
const num = (id) => parseFloat(vals[id]);
const input = (id, label, unit) => ({ id: 'f-' + id, label: label, unit: unit, value: vals[id],
set: (e) => this.setState({ vals: Object.assign({}, vals, { [id]: e.target.value }) }) });
const answers = this.state.answers;
const choice = (id, question, note, labels) => ({ id: 'q-' + id, question: question, note: note, options: labels.map((label, i) => {
const on = answers[id] === i + 1;
return { label: label, pressed: on ? 'true' : 'false', bg: on ? '#F1F4F9' : 'transparent', fg: on ? '#040C33' : '#F1F4F9', border: on ? '#F1F4F9' : 'rgba(150, 185, 255, 0.5)',
pick: () => this.setState({ answers: Object.assign({}, answers, { [id]: i + 1 }) }) };
}) });
const allDay = L('Asked in the morning, at midday and in the evening', 'Se pregunta en la mañana, al mediodía y en la noche');
const list = (items) => items.map((text, i) => ({ n: String(i + 1), text: text }));
const ranges = (rows) => rows.map((r) => ({ label: NAMES[r[0]], color: COLORS[r[0]], range: r[1] }));
const or = L(' or ', ' o ');
const more = L(' or more', ' o más');
const resting = this.state.ctx === 'rest';
const strip = this.state.strip;
const rawSwatches = [
{ id: 'yellow', label: L('Light yellow', 'Amarillo claro'), color: '#F6E58D', code: 'bone_good' },
{ id: 'pink', label: L('Soft pink', 'Rosa suave'), color: '#F7B6C8', code: 'bone_watch' },
{ id: 'orange', label: L('Light orange', 'Naranja claro'), color: '#F8C291', code: 'bone_watch' },
{ id: 'hotpink', label: L('Intense pink', 'Rosa intenso'), color: '#E84393', code: 'bone_urgent' },
{ id: 'red', label: L('Dark red', 'Rojo oscuro'), color: '#96281B', code: 'bone_urgent' },
{ id: 'purple', label: L('Purple', 'Morado'), color: '#7D3C98', code: 'bone_urgent' }
];
const measures = [
{ id: 'hr', sit: 'hr', label: L('Heart rate', 'Pulso'), question: L('How fast is your heart beating?', '¿Qué tan rápido late tu corazón?'), hasCtx: true,
how: list([
L('Choose your device. Monitoring band: fit it to your chest or wrist so it is not loose. PPG sensor: place it on the skin of your wrist or finger and hold still. ECG: connect the electrodes to your chest and record for 30 seconds.', 'Elige el dispositivo. Banda de monitoreo: ajústala al pecho o a la muñeca, sin que quede floja. Sensor PPG: colócalo sobre la piel, en la muñeca o el dedo, sin moverte. ECG: conecta los electrodos al pecho y registra durante 30 segundos.'),
L('Wait until the device shows a steady value.', 'Espera a que el dispositivo muestre un valor estable.'),
L('Type the beats per minute below.', 'Escribe abajo los latidos por minuto.')]),
inputs: [input('hr', L('Beats per minute', 'Latidos por minuto'), '')],
usual: L('Your usual while resting: 68 to 74', 'Lo habitual en ti en reposo: 68 a 74'),
why: L('Without gravity, the fluids in your body move toward your chest and head. Your heart and blood vessels have to adapt, and your heart rate shows how that is going.', 'Sin gravedad, los líquidos de tu cuerpo se mueven hacia el pecho y la cabeza. Tu corazón y tus vasos sanguíneos tienen que adaptarse, y tu pulso muestra cómo va eso.'),
ranges: ranges([['good', '60–100'], ['watch', '50–59' + or + '101–110'], ['care', '40–49' + or + '111–130'], ['urgent', L('under 40 or over 130', 'menos de 40 o más de 130')]]),
check: () => { const v = num('hr'); if (isNaN(v)) return null; if (!resting) return 'exercise';
if (v < 40 || v > 130) return 'urgent'; if (v < 50 || v > 110) return 'care'; if (v < 60 || v > 100) return 'watch'; return (v >= 68 && v <= 74) ? 'usual' : 'good'; } },
{ id: 'spo2', sit: 'spo2', label: L('Oxygen', 'Oxígeno'), question: L('How much oxygen is in your blood?', '¿Cuánto oxígeno hay en tu sangre?'), hasCtx: false,
how: list([
L('Keep your hands warm and still. Remove nail polish if you wear it.', 'Mantén las manos tibias y quietas. Quita el esmalte de uñas si lo usas.'),
L('Choose your device. Pulse oximeter: put it on your index or middle finger. PPG sensor: rest it on the skin and do not move it.', 'Elige el dispositivo. Oxímetro de pulso: colócalo en el dedo índice o medio. Sensor PPG: apóyalo sobre la piel y no lo muevas.'),
L('Wait 10 to 15 seconds until the value is steady.', 'Espera de 10 a 15 segundos hasta que el valor se estabilice.'),
L('Type the percentage below.', 'Escribe abajo el porcentaje.')]),
inputs: [input('spo2', L('Oxygen level', 'Nivel de oxígeno'), '%')],
usual: L('Your usual: 97 to 99%', 'Lo habitual en ti: 97 a 99%'),
why: L('It tells you whether your body is getting enough oxygen to keep your organs and tissues working well during the mission.', 'Te dice si tu cuerpo está recibiendo suficiente oxígeno para que tus órganos y tejidos funcionen bien durante la misión.'),
ranges: ranges([['good', '95–100%'], ['watch', '93–94%'], ['care', '90–92%'], ['urgent', L('under 90%', 'menos de 90%')]]),
check: () => { const v = num('spo2'); if (isNaN(v)) return null; if (v > 100) return 'invalid';
if (v < 90) return 'urgent'; if (v < 93) return 'care'; if (v < 95) return 'watch'; return (v >= 97) ? 'usual' : 'good'; } },
{ id: 'bp', sit: 'bp', label: L('Blood pressure', 'Presión arterial'), question: L('What is your blood pressure?', '¿Cuál es tu presión arterial?'), hasCtx: false,
how: list([
L('Sit with your back straight and your arm at the level of your heart. Rest for 5 minutes without talking.', 'Siéntate con la espalda recta y el brazo a la altura del corazón. Descansa 5 minutos sin hablar.'),
L('Choose your device. Digital monitor: put the cuff on your arm and press start. ABPM: keep the cuff on, it measures by itself every so often. Stay still when it inflates.', 'Elige el dispositivo. Tensiómetro digital: coloca el brazalete en el brazo y pulsa iniciar. ABPM: mantén el brazalete puesto, que mide solo cada cierto tiempo. Quédate quieto cuando infle.'),
L('Wait until the measurement ends.', 'Espera a que termine la medición.'),
L('Type the top number and the bottom number below.', 'Escribe abajo el número de arriba y el de abajo.')]),
inputs: [input('sys', L('Top number', 'Número de arriba'), ''), input('dia', L('Bottom number', 'Número de abajo'), 'mmHg')],
usual: L('Your usual: around 118 over 76', 'Lo habitual en ti: cerca de 118 sobre 76'),
why: L('It shows how your heart and blood vessels are responding to microgravity, and helps spot changes in your circulation.', 'Muestra cómo responden tu corazón y tus vasos sanguíneos a la microgravedad, y ayuda a notar cambios en tu circulación.'),
ranges: ranges([['good', L('under 120 over under 80', 'menos de 120 sobre menos de 80')], ['watch', L('120–129 over under 80', '120–129 sobre menos de 80')], ['care', L('130–179 over 80–119', '130–179 sobre 80–119')], ['urgent', L('180 or more over 120 or more', '180 o más sobre 120 o más')]]),
check: () => { const s = num('sys'); const d = num('dia'); if (isNaN(s) || isNaN(d)) return null;
if (s >= 180 || d >= 120) return 'urgent'; if (s >= 130 || d >= 80) return 'care'; if (s >= 120) return 'watch'; if (s < 90 || d < 60) return 'low';
return (s >= 110 && d >= 70) ? 'usual' : 'good'; } },
{ id: 'temp', sit: 'temp', label: L('Temperature', 'Temperatura'), question: L('What is your temperature?', '¿Cuál es tu temperatura?'), hasCtx: false,
how: list([
L('Wait 15 minutes after exercising or after being somewhere very hot.', 'Espera 15 minutos después de hacer ejercicio o de estar en un lugar muy caluroso.'),
L('Choose your device. Skin sensor: stick it on clean, dry skin and wait until it is steady. Infrared thermometer: point it at your forehead from about 3 cm and press the button.', 'Elige el dispositivo. Sensor cutáneo: pégalo sobre la piel limpia y seca, y espera a que se estabilice. Termómetro infrarrojo: apunta a la frente a unos 3 cm y presiona el botón.'),
L('Type the value in °C below.', 'Escribe abajo el valor en °C.')]),
inputs: [input('temp', L('Temperature', 'Temperatura'), '°C')],
usual: L('Your usual: 36.5 to 37.0 °C', 'Lo habitual en ti: 36.5 a 37.0 °C'),
why: L('It helps you notice overheating, which can affect your concentration and how your body works, and it can point to a possible illness.', 'Te ayuda a notar un sobrecalentamiento, que puede afectar tu concentración y el funcionamiento de tu cuerpo, y puede señalar una posible enfermedad.'),
ranges: ranges([['good', '36.1–37.2 °C'], ['watch', '37.5 °C' + more], ['care', '38.3 °C' + more], ['urgent', '39.5 °C' + more]]),
check: () => { const v = num('temp'); if (isNaN(v)) return null;
if (v >= 39.5) return 'urgent'; if (v >= 38.3) return 'care'; if (v >= 37.5) return 'watch'; if (v < 36.1) return 'low';
return (v >= 36.5 && v <= 37.0) ? 'usual' : 'good'; } },
{ id: 'urine', sit: 'bone', label: L('Bone test', 'Prueba de huesos'), question: L('Urine test for your bones', 'Prueba de orina para tus huesos'), hasCtx: false, hasSwatches: true,
how: list([
L('Use the spacecraft collection system to take a small amount of urine.', 'Usa el sistema colector de la nave para tomar una pequeña cantidad de orina.'),
L('Add the chemical preservative that comes in the kit.', 'Añade el conservante químico incluido en el kit.'),
L('Dip the test strip in the sample for the number of seconds the kit says.', 'Sumerge la tira reactiva en la muestra durante los segundos que indica el kit.'),
L('Below, choose the color that matches your strip.', 'Abajo, elige el color que coincide con tu tira.')]),
inputs: [], usual: '',
why: L('Bones break down quickly in microgravity. This test looks for markers that show collagen is breaking down, so you can act in time and prevent permanent damage.', 'Los huesos se degradan rápido en microgravedad. Esta prueba busca marcadores que indican que el colágeno se está rompiendo, para actuar a tiempo y prevenir un daño irreversible.'),
ranges: ranges([['good', L('Light yellow', 'Amarillo claro')], ['watch', L('Soft pink or light orange', 'Rosa suave o naranja claro')], ['urgent', L('Intense pink, dark red or purple', 'Rosa intenso, rojo oscuro o morado')]]),
check: () => { const w = rawSwatches.find((x) => x.id === strip); return w ? w.code : null; } },
{ id: 'mind', sit: '', label: L('Mind', 'Mente'), question: L('How is your mind right now?', '¿Cómo está tu mente ahora?'), hasCtx: false,
how: [], inputs: [], usual: '', ranges: [],
wait: L('Answer the questions above.', 'Responde las preguntas de arriba.'),
choices: [
choice('stress', L('How tense do you feel right now?', '¿Qué tanta tensión sientes ahora?'), allDay, [L('Very tense', 'Muy tenso'), L('Tense', 'Tenso'), L('Moderate', 'Moderado'), L('Calm', 'Tranquilo'), L('Very calm', 'Muy tranquilo')]),
choice('mood', L('How would you describe your mood?', '¿Cómo describirías tu ánimo?'), allDay, [L('Very low', 'Muy bajo'), L('Low', 'Bajo'), L('Neutral', 'Neutro'), L('Good', 'Bueno'), L('Very good', 'Muy bueno')]),
choice('focus', L('How easy is it to concentrate on your tasks?', '¿Qué tan fácil te resulta concentrarte en tus tareas?'), L('Asked at midday and in the evening', 'Se pregunta al mediodía y en la noche'), [L('Almost impossible', 'Casi imposible'), L('With a lot of effort', 'Con mucho esfuerzo'), L('With some effort', 'Con algo de esfuerzo'), L('Well', 'Bien'), L('Very well', 'Muy bien')])],
why: L('Isolation, confinement and a heavy workload can wear you down on a long mission. Answering these questions every day helps you notice changes early.', 'El aislamiento, el encierro y la carga de trabajo pueden desgastarte en una misión larga. Responder estas preguntas cada día te ayuda a notar cambios a tiempo.'),
check: () => { const a = [answers.stress, answers.mood, answers.focus]; if (a.some((x) => !x)) return null; return a.some((x) => x <= 2) ? 'mind_watch' : 'mind_good'; } },
{ id: 'exercise', sit: '', label: L('Exercise', 'Ejercicio'), question: L('How much did you exercise today?', '¿Cuánto ejercicio hiciste hoy?'), hasCtx: false,
how: [], ranges: [],
inputs: [input('exh', L('Hours', 'Horas'), 'h'), input('exm', L('Minutes', 'Minutos'), 'min')],
usual: L('Your usual: 45 minutes a day', 'Lo habitual en ti: 45 minutos al día'),
wait: L('Type the hours and minutes of exercise.', 'Escribe las horas y los minutos de ejercicio.'),
why: L('Without gravity, muscles and bones weaken quickly. Daily exercise is the main way to protect them.', 'Sin gravedad, los músculos y los huesos se debilitan rápido. El ejercicio diario es la principal forma de protegerlos.'),
check: () => { const h = num('exh'); const mi = num('exm'); if (isNaN(h) && isNaN(mi)) return null; const tot = (isNaN(h) ? 0 : h) * 60 + (isNaN(mi) ? 0 : mi);
if (tot >= 45) return 'ex_usual'; if (tot >= 30) return 'ex_good'; return 'ex_watch'; } },
{ id: 'sleep', sit: '', label: L('Sleep', 'Sueño'), question: L('How did you sleep?', '¿Cómo dormiste?'), hasCtx: false,
how: [],
choices: [choice('sleepq', L('How restful was your sleep?', '¿Qué tan reparador fue tu sueño?'), L('Asked only in the morning', 'Se pregunta solo por la mañana'), [L('Not at all', 'Nada'), L('A little', 'Poco'), L('So-so', 'Regular'), L('Good', 'Bueno'), L('Very restful', 'Muy reparador')])],
inputs: [input('sleeph', L('Hours of sleep', 'Horas de sueño'), 'h')],
usual: L('Optimal rest: 7 to 8 hours', 'Descanso óptimo: 7 a 8 horas'),
wait: L('Choose how restful it was and type the hours you slept.', 'Elige qué tan reparador fue y escribe las horas que dormiste.'),
why: L('Sleep is when your body and mind recover. On a mission, shifted schedules and workload make it easy to lose sleep, and that affects your focus and your mood.', 'Durante el sueño se recuperan tu cuerpo y tu mente. En una misión, los horarios cambiantes y la carga de trabajo hacen fácil perder sueño, y eso afecta tu concentración y tu ánimo.'),
ranges: ranges([['good', L('7 to 8 hours', '7 a 8 horas')], ['watch', L('5 to 7 hours, or more than 8', '5 a 7 horas, o más de 8')], ['care', L('under 5 hours', 'menos de 5 horas')]]),
check: () => { const h = num('sleeph'); const q = answers.sleepq; if (isNaN(h) || !q) return null;
if (h < 5) return 'sleep_care'; if (h < 7 || h > 8 || q <= 2) return 'sleep_watch'; return 'sleep_good'; } }
];
const LEVEL_OF = { usual: 'good', good: 'good', low: 'watch', watch: 'watch', care: 'care', urgent: 'urgent', bone_good: 'good', bone_watch: 'watch', bone_urgent: 'urgent', mind_good: 'good', mind_watch: 'watch', ex_usual: 'good', ex_good: 'good', ex_watch: 'watch', sleep_good: 'good', sleep_watch: 'watch', sleep_care: 'care' };
const total = measures.length;
const idx = Math.min(Math.max(this.state.step, 0), total - 1);
const cur = measures[idx];
const outcome = cur.check();
const mkText = (L) => ({
urgent: L('This number is very far from normal. Stop what you are doing and follow the steps.', 'Este número está muy lejos de lo normal. Detén lo que estás haciendo y sigue los pasos.'),
care: L('This is quite far from the healthy range. Tell the crew medical officer now.', 'Esto está bastante lejos del rango saludable. Avisa ahora al oficial médico de la tripulación.'),
watch: L('A little outside the healthy range. Rest for 10 minutes and measure again.', 'Un poco fuera del rango saludable. Descansa 10 minutos y mide otra vez.'),
low: L('Lower than the healthy range. Rest for 10 minutes and measure again.', 'Más bajo que el rango saludable. Descansa 10 minutos y mide otra vez.'),
good: L('Healthy, but a little different from your usual. We will keep watching it with you.', 'Saludable, pero un poco distinto de lo habitual en ti. Lo seguiremos vigilando contigo.'),
usual: L('Just like your usual. All good.', 'Igual a lo habitual en ti. Todo bien.'),
bone_good: L('Normal level. Your bones are holding up well.', 'Nivel normal. Tus huesos se mantienen bien.'),
bone_watch: L('Caution. The amount of collagen fragments has gone up.', 'Precaución. Aumentó la concentración de fragmentos de colágeno.'),
bone_urgent: L('Critical alert. Your bones are losing minerals fast. This needs attention: follow the steps.', 'Alerta crítica. Tus huesos se están desmineralizando rápido. Requiere atención: sigue los pasos.'),
mind_good: L('Your mind and your mood look good today.', 'Tu mente y tu ánimo se ven bien hoy.'),
mind_watch: L('You are having a hard moment. Take a short break if you can. If it stays like this, talk to the crew medical officer.', 'Estás pasando un momento difícil. Toma una pausa corta si puedes. Si sigue así, habla con el oficial médico de la tripulación.'),
ex_usual: L('You reached your usual amount of exercise. Well done.', 'Llegaste a tu cantidad habitual de ejercicio. Bien hecho.'),
ex_good: L('A little less than your usual today. One short day is fine.', 'Un poco menos de lo habitual hoy. Un día corto no es problema.'),
ex_watch: L('Much less exercise than your usual. Try to complete your session.', 'Mucho menos ejercicio de lo habitual. Intenta completar tu sesión.'),
sleep_good: L('Optimal rest: between 7 and 8 hours, and it felt restful.', 'Descanso óptimo: entre 7 y 8 horas, y fue reparador.'),
sleep_watch: L('Your rest was not optimal. Aim for 7 to 8 hours tonight and protect your sleep time.', 'Tu descanso no fue óptimo. Busca dormir de 7 a 8 horas esta noche y protege tu horario de sueño.'),
sleep_care: L('You slept much less than you need. Tell the crew medical officer if it happens again.', 'Dormiste mucho menos de lo que necesitas. Avisa al oficial médico de la tripulación si se repite.')
});
const TEXT = mkText(L);
const TEXT_EN = mkText((en, sp) => en);
const TEXT_ES = mkText((en, sp) => sp);
let result;
if (outcome === null) {
result = { level: 'info', label: L('Waiting', 'En espera'), text: cur.wait || (cur.hasSwatches ? L('Choose the color that matches your strip.', 'Elige el color que coincide con tu tira.') : L('Type the number you see on the device.', 'Escribe el número que ves en el aparato.')) };
} else if (outcome === 'exercise') {
result = { level: 'info', label: L('Saved', 'Guardado'), text: L('Saved as an exercise reading. We do not compare it with your resting numbers.', 'Guardado como lectura de ejercicio. No la comparamos con tus números en reposo.') };
} else if (outcome === 'invalid') {
result = { level: 'info', label: L('Check the number', 'Revisa el número'), text: L('Oxygen cannot be above 100%.', 'El oxígeno no puede pasar de 100%.') };
} else {
const level = LEVEL_OF[outcome];
result = { level: level, label: NAMES[level], text: TEXT[outcome] };
}
result.color = COLORS[result.level];
result.urgent = result.level === 'urgent';
const persist = () => {
if (this.sim) return;
let saved = {};
try { saved = JSON.parse(window.localStorage.getItem('astra.checkin') || '{}') || {}; } catch (e) {}
const results = Object.assign({}, saved.results || {});
measures.forEach((mm) => { const o = mm.check(); if (o && LEVEL_OF[o]) results[mm.id] = { level: LEVEL_OF[o], outcome: o, en: TEXT_EN[o], es: TEXT_ES[o] }; });
const keepVals = Object.assign({}, saved.vals || {});
Object.keys(this.state.vals).forEach((k) => { if (String(this.state.vals[k]).trim() !== '') keepVals[k] = this.state.vals[k]; });
const keepAns = Object.assign({}, saved.answers || {}, this.state.answers);
this.remember('astra.checkin', JSON.stringify({ results: results, vals: keepVals, answers: keepAns, flags: this.state.flags, strip: this.state.strip || saved.strip || '', at: Date.now() }));
};
const levelOf = (m) => { const o = m.check(); return LEVEL_OF[o] || 'info'; };
const steps = measures.map((m, i) => {
const on = i === idx;
return { label: m.label, pressed: on ? 'true' : 'false', bg: on ? '#F1F4F9' : 'transparent', fg: on ? '#040C33' : '#F1F4F9', border: on ? '#F1F4F9' : 'rgba(150, 185, 255, 0.5)',
dot: COLORS[levelOf(m)], pick: () => this.setState({ step: i }) };
});
const swatches = rawSwatches.map((w) => {
const on = w.id === strip;
return { label: w.label, color: w.color, pressed: on ? 'true' : 'false', bg: on ? 'rgba(64, 120, 255, 0.18)' : 'transparent', border: on ? '#F1F4F9' : 'rgba(150, 185, 255, 0.5)', pick: () => this.setState({ strip: w.id }) };
});
const ctxId = this.state.ctx;
const contexts = [{ id: 'rest', label: L('While resting', 'En reposo') }, { id: 'exercise', label: L('After exercise', 'Después de ejercicio') }].map((c) => {
const on = c.id === ctxId;
return Object.assign({}, c, { pressed: on ? 'true' : 'false', bg: on ? '#F1F4F9' : 'transparent', fg: on ? '#040C33' : '#F1F4F9', border: on ? '#F1F4F9' : 'rgba(150, 185, 255, 0.5)', pick: () => this.setState({ ctx: c.id }) });
});
const flags = this.state.flags;
const symptoms = [
{ id: 'pain', label: L('Pain', 'Dolor') }, { id: 'dizzy', label: L('Dizziness', 'Mareo') }, { id: 'nausea', label: L('Nausea', 'Náuseas') },
{ id: 'tired', label: L('Tiredness', 'Cansancio') }, { id: 'headache', label: L('Headache', 'Dolor de cabeza') }, { id: 'vision', label: L('Blurry vision', 'Visión borrosa') }
].map((y) => {
const on = !!flags[y.id];
return Object.assign({}, y, { pressed: on ? 'true' : 'false', bg: on ? '#B9A5FF' : 'transparent', fg: on ? '#040C33' : '#F1F4F9', border: on ? '#B9A5FF' : 'rgba(150, 185, 255, 0.5)',
toggle: () => this.setState({ flags: Object.assign({}, flags, { [y.id]: !on }) }) });
});
const m = Object.assign({}, cur, { hasHow: cur.how.length > 0, hasInputs: cur.inputs.length > 0, hasSwatches: !!cur.hasSwatches, choices: cur.choices || [], hasChoices: !!(cur.choices && cur.choices.length), hasRanges: cur.ranges.length > 0, ready: true, pending: false });
const t = {
day: L('Day 42 of the mission · demo data', 'Día 42 de la misión · datos de demostración'),
navLabel: L('Sections', 'Secciones'), navHome: L('Home', 'Inicio'), navCheckin: L('Check-in', 'Chequeo'), navTrends: L('My trends', 'Mis tendencias'), navRad: L('Radiation', 'Radiación'),
langLabel: L('Language', 'Idioma'), emergency: L('Emergency', 'Emergencia'),
offlineBanner: L('No connection right now. Your answers are saved on this device and nothing is lost.', 'No hay conexión en este momento. Tus respuestas se guardan en este dispositivo y no se pierde nada.'),
title: L('Daily check-in', 'Chequeo diario'),
stepsLabel: L('Steps', 'Pasos'),
howTitle: L('How to measure it', 'Cómo medirlo'),
whenLabel: L('When did you measure?', '¿Cuándo lo mediste?'),
swatchLabel: L('Which color is your strip?', '¿De qué color quedó tu tira?'),
seeSteps: L('See the steps to follow', 'Ver los pasos a seguir'),
pending: '',
symLabel: L('Is anything bothering you right now?', '¿Algo te molesta en este momento?'),
radNote: L('Radiation is at a normal level today, so this probably does not come from radiation. Space motion sickness, stress or tiredness are more likely.', 'La radiación está en un nivel normal hoy, así que esto probablemente no viene de la radiación. Es más probable que sea mareo espacial, estrés o cansancio.'),
next: L('Save and continue', 'Guardar y seguir'), finish: L('Save and finish', 'Guardar y terminar'), back: L('Back', 'Atrás'),
whyTitle: L('Why we ask', 'Por qué te lo preguntamos'),
rangesTitle: L('What the result means', 'Qué significa el resultado'),
footer: L('ASTRA helps you notice changes. It does not diagnose. The numbers are demo data. The measuring steps, the limits and the question scales come from the biomedical team. The levels for mind, exercise and sleep are drafts for them to confirm.', 'ASTRA te ayuda a notar cambios. No hace diagnósticos. Los números son datos de demostración. Los pasos para medir, los límites y las escalas de las preguntas vienen del equipo biomédico. Los niveles de mente, ejercicio y sueño son borradores que ellos deben confirmar.')
};
return Object.assign(this.shared(L), {
simOn: !!this.sim,
useSensor: () => { const d = this.sim && this.sim.today; if (!d) return; this.setState({ ctx: 'rest', vals: Object.assign({}, d.vals), answers: Object.assign({}, d.answers), flags: Object.assign({}, d.flags || {}), strip: d.strip || '' }); },
t: Object.assign(t, this.sim ? { sensorTitle: L('Your sensor already has today\'s numbers', 'Tu sensor ya tiene los números de hoy'), sensorText: L('Simulation mode, astronaut ' + this.sim.astro + ', day ' + this.sim.day + '. Tap the button and check each step. Nothing you see here is saved as your own data.', 'Modo simulación, astronauta ' + this.sim.astro + ', día ' + this.sim.day + '. Toca el botón y revisa cada paso. Nada de lo que ves aquí se guarda como tus datos.'), sensorBtn: L('Use my sensor data', 'Usar los datos de mi sensor') } : { sensorTitle: '', sensorText: '', sensorBtn: '' }), m: m, result: result, steps: steps, swatches: swatches, contexts: contexts, symptoms: symptoms,
progress: L('Step ' + (idx + 1) + ' of ' + total, 'Paso ' + (idx + 1) + ' de ' + total),
showRad: !!(flags.nausea || flags.dizzy),
notLast: idx < total - 1, isLast: idx === total - 1,
goEmergency: () => this.remember('astra.sit', cur.sit),
next: () => { persist(); this.setState({ step: Math.min(idx + 1, total - 1) }); },
finish: () => persist(),
back: () => this.setState({ step: Math.max(idx - 1, 0) })
});
}
render() {
const v = this.renderVals();
return (<><div className="astra-sky" aria-hidden="true"><span className="astra-stars"></span><span className="astra-stars s2"></span><span className="astra-stars s3"></span><span className="astra-spark" style={{ left: "12%", top: "9%", animationDelay: "-4s" }}></span><span className="astra-spark" style={{ left: "83%", top: "6%", animationDelay: "-1s" }}></span><span className="astra-spark" style={{ left: "64%", top: "30%", animationDelay: "-3s" }}></span><span className="astra-spark" style={{ left: "7%", top: "52%", animationDelay: "-4s" }}></span><span className="astra-spark" style={{ left: "91%", top: "61%", animationDelay: "-2s" }}></span><span className="astra-spark" style={{ left: "38%", top: "84%", animationDelay: "-1s" }}></span><span className="astra-shoot" style={{ top: "8%", left: "1100px", animationDelay: "0s", animationDuration: "11s" }}></span><span className="astra-shoot" style={{ top: "26%", left: "1420px", animationDelay: "-4s", animationDuration: "13s" }}></span><span className="astra-shoot" style={{ top: "46%", left: "900px", animationDelay: "-8s", animationDuration: "15s" }}></span><span className="astra-shoot" style={{ top: "64%", left: "1300px", animationDelay: "-2s", animationDuration: "17s" }}></span><span className="astra-shoot" style={{ top: "18%", left: "700px", animationDelay: "-11s", animationDuration: "19s" }}></span><span className="astra-shoot" style={{ top: "80%", left: "1000px", animationDelay: "-6s", animationDuration: "14s" }}></span></div><div style={{ minHeight: "100vh", boxSizing: "border-box", padding: "24px", position: "relative", zIndex: "1", background: "transparent", color: "#F1F4F9", fontFamily: "Inter, system-ui, sans-serif", fontSize: "16px", lineHeight: "1.5" }}><div style={{ maxWidth: "1320px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}><SimBar /><header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 20px" }}><img src="/assets/astra-logo.png" alt="" style={{ boxShadow: "0 0 0 1px rgba(124, 196, 240, 0.4), 0 0 24px rgba(61, 123, 255, 0.55)", width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }} /><div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}><span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "26px", letterSpacing: "0.1em" }}>{"ASTRA"}</span><span style={{ fontSize: "13px", color: "#A9BEEA" }}>{v.t.day}</span></div><nav aria-label={v.t.navLabel} style={{ display: "flex", flexWrap: "wrap", gap: "6px", flex: "1 1 auto" }}><Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 18px", borderRadius: "22px", color: "#D3DEF7", fontWeight: "500", textDecoration: "none" }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" style={{ flex: "0 0 auto", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M3 11 L12 4 L21 11"></path><path d="M5.5 9.5 V20 H18.5 V9.5"></path><path d="M10 20 V14 H14 V20"></path></svg>{v.t.navHome}</Link><Link to="/chequeo" aria-current="page" style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 18px", borderRadius: "22px", background: "rgba(64, 120, 255, 0.18)", color: "#F1F4F9", fontWeight: "600", textDecoration: "none" }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" style={{ flex: "0 0 auto", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round" }}><rect x="5" y="4" width="14" height="17" rx="2.5"></rect><path d="M9 4 V2.8 H15 V4"></path><path d="M8.5 12.5 L11 15 L15.5 10"></path></svg>{v.t.navCheckin}</Link><Link to="/tendencias" style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 18px", borderRadius: "22px", color: "#D3DEF7", fontWeight: "500", textDecoration: "none" }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" style={{ flex: "0 0 auto", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M3 20 H21"></path><path d="M4 16 L9 11 L13 14 L20 6"></path><path d="M15.5 6 H20 V10.5"></path></svg>{v.t.navTrends}</Link><Link to="/radiacion" style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 18px", borderRadius: "22px", color: "#D3DEF7", fontWeight: "500", textDecoration: "none" }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" style={{ flex: "0 0 auto", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round" }}><circle cx="12" cy="12" r="1.8"></circle><ellipse cx="12" cy="12" rx="9.5" ry="3.8"></ellipse><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(120 12 12)"></ellipse></svg>{v.t.navRad}</Link><Link to="/linea-base" style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 18px", borderRadius: "22px", border: "1px solid rgba(150, 185, 255, 0.5)", color: "#D3DEF7", fontWeight: "500", textDecoration: "none" }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }}><circle cx="12" cy="12" r="3"></circle><path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12 M4.9 4.9 L7 7 M17 17 L19.1 19.1 M4.9 19.1 L7 17 M17 7 L19.1 4.9"></path></svg>{v.navSetup}</Link></nav><div role="group" aria-label={v.t.langLabel} style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "26px", background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", border: "1px solid rgba(130, 175, 255, 0.24)" }}>{(v.langs || []).map((g, $index) => (<React.Fragment key={$index}><button type="button" onClick={g.pick} aria-pressed={g.pressed} style={{ minHeight: "44px", padding: "0 16px", borderRadius: "22px", border: "none", background: g.bg, color: g.fg, fontWeight: "600" }}>{g.label}</button></React.Fragment>))}</div><button type="button" onClick={v.toggleOnline} aria-pressed={v.offlinePressed} style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 16px", borderRadius: "22px", border: "1px solid rgba(130, 175, 255, 0.24)", background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", color: "#F1F4F9", fontWeight: "500" }}><span aria-hidden="true" style={{ width: "10px", height: "10px", borderRadius: "50%", background: v.connColor }}></span>{v.connLabel}</button><Link to="/emergencia" style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 20px", borderRadius: "22px", background: "#C4302B", color: "#FFFFFF", fontWeight: "600", textDecoration: "none" }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M12 3 L22 20 L2 20 Z"></path><path d="M12 10 L12 14"></path><path d="M12 17 L12 17.5"></path></svg>{" "}{v.t.emergency}</Link></header>{v.offline ? (<><div role="status" style={{ border: "1px solid #9B6BFF", borderRadius: "22px", padding: "14px 18px", background: "rgba(12, 26, 84, 0.6)" }}>{v.t.offlineBanner}</div></>) : null}<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}><div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "6px 16px" }}><h1 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "34px" }}>{v.t.title}</h1><span style={{ color: "#A9BEEA" }}>{v.progress}</span></div><div role="group" aria-label={v.t.stepsLabel} style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{(v.steps || []).map((p, $index) => (<React.Fragment key={$index}><button type="button" onClick={p.pick} aria-pressed={p.pressed} style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "48px", padding: "0 18px", borderRadius: "24px", border: `1px solid ${p.border}`, background: p.bg, color: p.fg, fontWeight: "600" }}><span aria-hidden="true" style={{ width: "12px", height: "12px", borderRadius: "50%", background: p.dot }}></span>{p.label}</button></React.Fragment>))}</div></div>{v.simOn ? (<><section aria-label={v.t.sensorTitle} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 20px", padding: "18px 20px", borderRadius: "22px", background: "rgba(155, 107, 255, 0.16)", border: "1px solid rgba(185, 165, 255, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}><span aria-hidden="true" style={{ width: "46px", height: "46px", borderRadius: "14px", background: "rgba(4, 12, 51, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C3B8FF" }}><svg width="24" height="24" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }}><rect x="7" y="6" width="10" height="12" rx="3"></rect><path d="M9 6 L9.5 2.5 L14.5 2.5 L15 6 M9 18 L9.5 21.5 L14.5 21.5 L15 18"></path><path d="M9.5 12 L11 12 L12 10 L13 14 L14 12 L14.5 12"></path></svg></span><div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: "2px" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "19px" }}>{v.t.sensorTitle}</h2><p style={{ margin: "0", fontSize: "15px", color: "#D3DEF7" }}>{v.t.sensorText}</p></div><button type="button" onClick={v.useSensor} style={{ minHeight: "48px", padding: "0 22px", borderRadius: "24px", border: "none", background: "#F1F4F9", color: "#040C33", fontWeight: "600", fontSize: "16px", cursor: "pointer" }}>{v.t.sensorBtn}</button></section></>) : null}<main style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "flex-start" }}><section aria-label={v.m.question} style={{ flex: "1.5 1 460px", minWidth: "0", background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", border: "1px solid rgba(130, 175, 255, 0.24)", borderRadius: "22px", padding: "24px", display: "flex", flexDirection: "column", gap: "22px" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "30px", textWrap: "balance" }}>{v.m.question}</h2>{v.m.hasHow ? (<><div style={{ display: "flex", flexDirection: "column", gap: "8px" }}><h3 style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#A9BEEA" }}>{v.t.howTitle}</h3><ol style={{ margin: "0", padding: "0", listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>{(v.m.how || []).map((h, $index) => (<React.Fragment key={$index}><li style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}><span aria-hidden="true" style={{ flex: "0 0 30px", height: "30px", borderRadius: "50%", background: "rgba(64, 120, 255, 0.18)", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>{h.n}</span><span style={{ paddingTop: "3px" }}>{h.text}</span></li></React.Fragment>))}</ol></div></>) : null}{v.m.hasCtx ? (<><div style={{ display: "flex", flexDirection: "column", gap: "8px" }}><span id="ctx-label" style={{ fontSize: "14px", fontWeight: "600", color: "#A9BEEA" }}>{v.t.whenLabel}</span><div role="group" aria-labelledby="ctx-label" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{(v.contexts || []).map((c, $index) => (<React.Fragment key={$index}><button type="button" onClick={c.pick} aria-pressed={c.pressed} style={{ minHeight: "48px", padding: "0 20px", borderRadius: "24px", border: `1px solid ${c.border}`, background: c.bg, color: c.fg, fontWeight: "500" }}>{c.label}</button></React.Fragment>))}</div></div></>) : null}{v.m.hasChoices ? (<><div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>{(v.m.choices || []).map((q, $index) => (<React.Fragment key={$index}><div style={{ display: "flex", flexDirection: "column", gap: "8px" }}><span id={q.id} style={{ fontSize: "18px", fontWeight: "600" }}>{q.question}</span><div role="group" aria-labelledby={q.id} style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{(q.options || []).map((o, $index) => (<React.Fragment key={$index}><button type="button" onClick={o.pick} aria-pressed={o.pressed} style={{ minHeight: "48px", padding: "0 18px", borderRadius: "24px", border: `1px solid ${o.border}`, background: o.bg, color: o.fg, fontWeight: "500" }}>{o.label}</button></React.Fragment>))}</div><span style={{ fontSize: "14px", color: "#A9BEEA" }}>{q.note}</span></div></React.Fragment>))}</div></>) : null}{v.m.hasInputs ? (<><div style={{ display: "flex", flexWrap: "wrap", gap: "16px 24px" }}>{(v.m.inputs || []).map((f, $index) => (<React.Fragment key={$index}><div style={{ display: "flex", flexDirection: "column", gap: "8px" }}><label htmlFor={f.id} style={{ fontSize: "14px", fontWeight: "600", color: "#A9BEEA" }}>{f.label}</label><div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}><input id={f.id} type="number" value={f.value} onChange={f.set} style={{ width: "170px", boxSizing: "border-box", padding: "8px 16px", borderRadius: "22px", border: "1px solid rgba(150, 185, 255, 0.5)", background: "rgba(3, 10, 42, 0.7)", color: "#F1F4F9", fontFamily: "'Space Grotesk', sans-serif", fontSize: "48px", fontWeight: "700" }} /><span style={{ color: "#A9BEEA" }}>{f.unit}</span></div></div></React.Fragment>))}</div></>) : null}{v.m.hasSwatches ? (<><div style={{ display: "flex", flexDirection: "column", gap: "8px" }}><span id="sw-label" style={{ fontSize: "14px", fontWeight: "600", color: "#A9BEEA" }}>{v.t.swatchLabel}</span><div role="group" aria-labelledby="sw-label" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(170px, 100%), 1fr))", gap: "8px" }}>{(v.swatches || []).map((w, $index) => (<React.Fragment key={$index}><button type="button" onClick={w.pick} aria-pressed={w.pressed} style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "64px", padding: "8px 12px", textAlign: "left", borderRadius: "22px", border: `2px solid ${w.border}`, background: w.bg, color: "#F1F4F9", fontWeight: "500" }}><span aria-hidden="true" style={{ flex: "0 0 40px", height: "40px", borderRadius: "10px", background: w.color }}></span>{w.label}</button></React.Fragment>))}</div></div></>) : null}{v.m.ready ? (<><div role="status" style={{ border: `2px solid ${v.result.color}`, borderRadius: "22px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "6px" }}><span style={{ alignSelf: "flex-start", fontSize: "14px", fontWeight: "600", padding: "5px 14px", borderRadius: "22px", background: v.result.color, color: "#040C33" }}>{v.result.label}</span><p style={{ margin: "0", fontSize: "19px", textWrap: "pretty" }}>{v.result.text}</p><span style={{ fontSize: "14px", color: "#A9BEEA" }}>{v.m.usual}</span>{v.result.urgent ? (<><Link to="/emergencia" onClick={v.goEmergency} style={{ alignSelf: "flex-start", marginTop: "6px", display: "inline-flex", alignItems: "center", minHeight: "52px", padding: "0 26px", borderRadius: "26px", background: "#C4302B", color: "#FFFFFF", fontSize: "17px", fontWeight: "600", textDecoration: "none" }}>{v.t.seeSteps}</Link></>) : null}</div></>) : null}{v.m.pending ? (<><div style={{ border: "2px dashed rgba(150, 185, 255, 0.5)", borderRadius: "22px", padding: "16px 18px", fontSize: "17px" }}>{v.t.pending}</div></>) : null}<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}><span id="sym-label" style={{ fontSize: "14px", fontWeight: "600", color: "#A9BEEA" }}>{v.t.symLabel}</span><div role="group" aria-labelledby="sym-label" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{(v.symptoms || []).map((y, $index) => (<React.Fragment key={$index}><button type="button" onClick={y.toggle} aria-pressed={y.pressed} style={{ minHeight: "48px", padding: "0 18px", borderRadius: "24px", border: `1px solid ${y.border}`, background: y.bg, color: y.fg, fontWeight: "500" }}>{y.label}</button></React.Fragment>))}</div></div>{v.showRad ? (<><p role="status" style={{ margin: "0", background: "rgba(64, 120, 255, 0.18)", borderRadius: "18px", padding: "14px 18px" }}>{v.t.radNote}</p></>) : null}<div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>{v.notLast ? (<><button type="button" onClick={v.next} style={{ minHeight: "52px", padding: "0 28px", borderRadius: "26px", border: "none", background: "#F1F4F9", color: "#040C33", fontSize: "17px", fontWeight: "600" }}>{v.t.next}</button></>) : null}{v.isLast ? (<><Link to="/" onClick={v.finish} style={{ display: "inline-flex", alignItems: "center", minHeight: "52px", padding: "0 28px", borderRadius: "26px", background: "#F1F4F9", color: "#040C33", fontSize: "17px", fontWeight: "600", textDecoration: "none" }}>{v.t.finish}</Link></>) : null}<button type="button" onClick={v.back} style={{ minHeight: "52px", padding: "0 22px", borderRadius: "26px", border: "1px solid rgba(150, 185, 255, 0.5)", background: "transparent", color: "#F1F4F9", fontWeight: "500" }}>{v.t.back}</button></div></section><aside aria-label={v.t.whyTitle} style={{ flex: "1 1 340px", minWidth: "0", display: "flex", flexDirection: "column", gap: "20px" }}><div style={{ background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", border: "1px solid rgba(130, 175, 255, 0.24)", borderRadius: "22px", padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "22px" }}>{v.t.whyTitle}</h2><p style={{ margin: "0", textWrap: "pretty" }}>{v.m.why}</p></div>{v.m.hasRanges ? (<><div style={{ background: "rgba(12, 26, 84, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 10px 40px rgba(0, 8, 40, 0.35)", border: "1px solid rgba(130, 175, 255, 0.24)", borderRadius: "22px", padding: "20px", display: "flex", flexDirection: "column" }}><h2 style={{ margin: "0 0 8px 0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: "22px" }}>{v.t.rangesTitle}</h2>{(v.m.ranges || []).map((r, $index) => (<React.Fragment key={$index}><div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 12px", padding: "11px 0", borderTop: "1px solid rgba(130, 175, 255, 0.24)" }}><span aria-hidden="true" style={{ flex: "0 0 14px", height: "14px", borderRadius: "50%", background: r.color }}></span><span style={{ flex: "1 1 130px", fontWeight: "600", color: r.color }}>{r.label}</span><span>{r.range}</span></div></React.Fragment>))}</div></>) : null}</aside></main><footer style={{ fontSize: "14px", color: "#A9BEEA", borderTop: "1px solid rgba(130, 175, 255, 0.24)", paddingTop: "14px" }}>{v.t.footer}</footer></div></div><Stella /></>);
}
}

export default Chequeo;
