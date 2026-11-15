// Check-in: choose between typing a value or reading it from an automatic device.
// There is no real device in this demo: the link and the measurement are simulated,
// and the panel says so. If the device sends nothing within 15 seconds, the check-in
// falls back to manual entry.
import React from 'react';

const LINK_MS = 2200;      // "linking" phase when the device answers
const MEASURE_MS = 5600;   // live measurement
const TIMEOUT_MS = 15000;  // no data after this: go manual

const DEVICES = {
  hr: { en: 'Monitoring band (ECG)', es: 'Banda de monitoreo (ECG)', unit: { en: 'beats per minute', es: 'latidos por minuto' } },
  spo2: { en: 'Pulse oximeter', es: 'Oxímetro de pulso', unit: { en: '% oxygen', es: '% de oxígeno' } },
  bp: { en: 'Digital blood pressure monitor', es: 'Tensiómetro digital', unit: { en: 'mmHg', es: 'mmHg' } },
  temp: { en: 'Skin temperature sensor', es: 'Sensor de temperatura cutánea', unit: { en: '°C', es: '°C' } },
};

const gauss = (x, mu, s) => Math.exp(-((x - mu) * (x - mu)) / (2 * s * s));
// One heartbeat of an ECG trace, phase 0..1
const ecg = (ph) => 0.22 * gauss(ph, 0.18, 0.028) - 0.14 * gauss(ph, 0.355, 0.009) + 1.0 * gauss(ph, 0.385, 0.011) - 0.26 * gauss(ph, 0.415, 0.01) + 0.34 * gauss(ph, 0.63, 0.045);
// One pulse of an oximeter wave, phase 0..1
const pleth = (ph) => 0.95 * gauss(ph, 0.22, 0.075) + 0.36 * gauss(ph, 0.5, 0.09);

function drawGrid(c, W, H) {
  c.clearRect(0, 0, W, H);
  c.strokeStyle = 'rgba(130, 175, 255, 0.14)';
  c.lineWidth = 1;
  c.beginPath();
  for (let x = 0; x <= W; x += 28) { c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, H); }
  for (let y = 0; y <= H; y += 28) { c.moveTo(0, y + 0.5); c.lineTo(W, y + 0.5); }
  c.stroke();
}

export default function AutoMeasure({ kind, target, es, fail, onDone, onTimeout }) {
  const L = (en, sp) => (es ? sp : en);
  const canvasRef = React.useRef(null);
  const [phase, setPhase] = React.useState('link'); // link | measure | done | timeout
  const [live, setLive] = React.useState('');
  const [left, setLeft] = React.useState(15);
  const cb = React.useRef({ onDone, onTimeout });
  cb.current = { onDone, onTimeout };

  React.useEffect(() => {
    let raf = 0;
    let stopped = false;
    let lastPhase = 'link';
    let lastText = '';
    const t0 = performance.now();
    const hr = parseFloat(target.hr) || 72;
    const spo2 = parseFloat(target.spo2) || 98;
    const sys = parseFloat(target.sys) || 118;
    const dia = parseFloat(target.dia) || 76;
    const temp = parseFloat(target.temp) || 36.7;
    const bpm = kind === 'spo2' ? 72 : hr;

    const tick = (now) => {
      if (stopped) return;
      const el = now - t0;
      let ph = 'link';
      if (fail) ph = el >= TIMEOUT_MS ? 'timeout' : 'link';
      else ph = el < LINK_MS ? 'link' : (el < LINK_MS + MEASURE_MS ? 'measure' : 'done');
      const tm = Math.max(0, el - LINK_MS) / 1000;           // seconds into the measurement
      const prog = Math.min(1, Math.max(0, el - LINK_MS) / MEASURE_MS);

      const cv = canvasRef.current;
      if (cv) {
        const W = cv.clientWidth || 600, H = cv.clientHeight || 150;
        const dpr = window.devicePixelRatio || 1;
        if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
        const c = cv.getContext('2d');
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawGrid(c, W, H);
        c.lineWidth = 2.4; c.lineJoin = 'round'; c.lineCap = 'round';
        c.strokeStyle = ph === 'link' || ph === 'timeout' ? 'rgba(169, 190, 234, 0.55)' : '#7CC4F0';
        c.shadowColor = '#3D7BFF'; c.shadowBlur = ph === 'link' || ph === 'timeout' ? 0 : 10;
        c.beginPath();
        if (ph === 'link' || ph === 'timeout') {
          // no signal yet: flat line
          c.moveTo(0, H * 0.62); c.lineTo(W, H * 0.62);
        } else if (kind === 'hr' || kind === 'spo2') {
          const speed = 120; // px per second
          const wave = kind === 'hr' ? ecg : pleth;
          const base = kind === 'hr' ? H * 0.72 : H * 0.82;
          const amp = kind === 'hr' ? H * 0.58 : H * 0.62;
          for (let x = 0; x <= W; x += 2) {
            const ts = tm - (W - x) / speed;
            const y = ts < 0 ? base : base - amp * wave((((ts * bpm) / 60) % 1 + 1) % 1);
            if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
          }
        } else if (kind === 'bp') {
          // cuff pressure: inflate, then deflate slowly with the pulse on top
          const top = sys + 30, low = Math.max(40, dia - 16);
          const total = MEASURE_MS / 1000, tUp = 1.6;
          const pAt = (s) => {
            if (s <= tUp) return top * (1 - Math.pow(1 - s / tUp, 2));
            const k = (s - tUp) / (total - tUp);
            const p = top - (top - low) * k;
            const map = dia + (sys - dia) / 3;
            return p + 2.6 * gauss(p, map, 16) * Math.sin(s * bpm / 60 * Math.PI * 2) * 2;
          };
          const yOf = (p) => H - 12 - (p / (top + 10)) * (H - 24);
          const end = Math.min(total, tm);
          for (let s = 0; s <= end; s += 0.02) { const x = (s / total) * W, y = yOf(pAt(s)); if (s === 0) c.moveTo(x, y); else c.lineTo(x, y); }
        } else {
          // temperature settles toward the reading
          const total = MEASURE_MS / 1000, start = temp - 1.8;
          const vAt = (s) => start + (temp - start) * (1 - Math.exp(-s / 1.05));
          const yOf = (v) => H - 14 - ((v - (start - 0.2)) / (temp - start + 0.5)) * (H - 28);
          const end = Math.min(total, tm);
          for (let s = 0; s <= end; s += 0.02) { const x = (s / total) * W, y = yOf(vAt(s)); if (s === 0) c.moveTo(x, y); else c.lineTo(x, y); }
        }
        c.stroke();
        c.shadowBlur = 0;
      }

      // live number
      let text = '';
      if (ph === 'measure' || ph === 'done') {
        const wob = ph === 'done' ? 0 : Math.round(Math.sin(tm * 2.1) * 2 * (1 - prog));
        if (kind === 'hr') text = String(Math.round(hr) + wob);
        else if (kind === 'spo2') text = String(Math.min(100, Math.round(spo2) + (ph === 'done' ? 0 : Math.round(Math.sin(tm * 1.7) * (1 - prog)))));
        else if (kind === 'bp') text = ph === 'done' ? Math.round(sys) + ' / ' + Math.round(dia) : String(Math.round(tm <= 1.6 ? (sys + 30) * (1 - Math.pow(1 - tm / 1.6, 2)) : (sys + 30) - ((sys + 30) - Math.max(40, dia - 16)) * ((tm - 1.6) / (MEASURE_MS / 1000 - 1.6))));
        else text = (ph === 'done' ? temp : (temp - 1.8) + 1.8 * (1 - Math.exp(-tm / 1.05))).toFixed(1);
      }
      if (text !== lastText) { lastText = text; setLive(text); }
      if (ph === 'link') { const rem = Math.max(0, Math.ceil((TIMEOUT_MS - el) / 1000)); setLeft((v) => (v === rem ? v : rem)); }

      if (ph !== lastPhase) {
        lastPhase = ph;
        setPhase(ph);
        if (ph === 'done') {
          const got = kind === 'hr' ? { hr: String(Math.round(hr)) } : kind === 'spo2' ? { spo2: String(Math.round(spo2)) } : kind === 'bp' ? { sys: String(Math.round(sys)), dia: String(Math.round(dia)) } : { temp: temp.toFixed(1) };
          cb.current.onDone && cb.current.onDone(got);
        }
        if (ph === 'timeout') { cb.current.onTimeout && cb.current.onTimeout(); return; }
      }
      // keep the heart and oxygen traces moving after the reading; freeze the others
      if (ph === 'done' && (kind === 'bp' || kind === 'temp')) return;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { stopped = true; cancelAnimationFrame(raf); };
  }, [kind, fail, target.hr, target.spo2, target.sys, target.dia, target.temp]);

  const dev = DEVICES[kind] || DEVICES.hr;
  const status = phase === 'link'
    ? L('Linking with the device… waiting for data, ' + left + ' s left', 'Vinculando con el dispositivo… esperando datos, quedan ' + left + ' s')
    : phase === 'measure' ? L('Measuring. Stay still.', 'Midiendo. Quédate quieto.')
    : phase === 'done' ? L('Reading received and filled in for you.', 'Lectura recibida y cargada por ti.')
    : L('The device did not send data.', 'El dispositivo no envió datos.');
  const dot = phase === 'done' ? '#5FD3A0' : phase === 'measure' ? '#7CC4F0' : '#B9A5FF';

  return (
    <div style={{ background: 'rgba(4, 12, 51, 0.5)', border: '1px solid rgba(130, 175, 255, 0.3)', borderRadius: '18px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 12px' }}>
        <span aria-hidden="true" className={phase === 'link' || phase === 'measure' ? 'astra-pulse' : ''} style={{ width: '12px', height: '12px', borderRadius: '50%', background: dot, animation: phase === 'link' || phase === 'measure' ? 'astra-pulse 1.1s ease-in-out infinite' : 'none' }}></span>
        <span style={{ fontWeight: '600', fontSize: '17px' }}>{es ? dev.es : dev.en}</span>
        <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em', padding: '3px 10px', borderRadius: '10px', background: '#B9A5FF', color: '#040C33' }}>{L('SIMULATED', 'SIMULADO')}</span>
      </div>
      <p role="status" style={{ margin: '0', color: '#D3DEF7' }}>{status}</p>
      <canvas ref={canvasRef} role="img" aria-label={L('Live trace from the device', 'Trazo en vivo del dispositivo')} style={{ width: '100%', height: '150px', display: 'block', borderRadius: '12px', background: 'rgba(3, 10, 42, 0.7)' }}></canvas>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '10px', minHeight: '58px' }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: '700', fontSize: '48px', lineHeight: '1' }}>{live || '—'}</span>
        <span style={{ color: '#A9BEEA' }}>{es ? dev.unit.es : dev.unit.en}</span>
      </div>
    </div>
  );
}

// Everything the check-in shows about "manual or automatic" for the current measurement.
export function MeasureMode({ a }) {
  if (!a || !a.kind) return null;
  const L = (en, sp) => (a.es ? sp : en);
  const big = { flex: '1 1 220px', minHeight: '84px', padding: '12px 18px', borderRadius: '18px', border: '1px solid rgba(150, 185, 255, 0.5)', background: 'rgba(4, 12, 51, 0.45)', color: '#F1F4F9', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2px', cursor: 'pointer' };
  const small = { minHeight: '44px', padding: '0 16px', borderRadius: '22px', border: '1px solid rgba(150, 185, 255, 0.5)', background: 'transparent', color: '#D3DEF7', fontSize: '14px', fontWeight: '500', cursor: 'pointer' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {a.ask ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span id="mode-label" style={{ fontSize: '14px', fontWeight: '600', color: '#A9BEEA' }}>{L('How do you want to measure?', '¿Cómo quieres medirlo?')}</span>
          <div role="group" aria-labelledby="mode-label" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button type="button" onClick={a.pickAuto} style={big}>
              <span style={{ fontWeight: '600', fontSize: '18px' }}>{L('With an automatic device', 'Con un dispositivo automático')}</span>
              <span style={{ fontSize: '14px', color: '#A9BEEA' }}>{L('ASTRA links with your sensor and fills in the number.', 'ASTRA se vincula con tu sensor y carga el número.')}</span>
            </button>
            <button type="button" onClick={a.pickManual} style={big}>
              <span style={{ fontWeight: '600', fontSize: '18px' }}>{L('By hand', 'A mano')}</span>
              <span style={{ fontSize: '14px', color: '#A9BEEA' }}>{L('You measure and type the number.', 'Te mides y escribes el número.')}</span>
            </button>
          </div>
        </div>
      ) : null}
      {a.on ? (<AutoMeasure key={a.key} kind={a.kind} target={a.target} es={a.es} fail={a.fail} onDone={a.done} onTimeout={a.timeout} />) : null}
      {a.timedOut ? (
        <p role="alert" style={{ margin: '0', border: '1px solid #B9A5FF', borderRadius: '14px', padding: '12px 16px', background: 'rgba(155, 107, 255, 0.14)' }}>
          {L('The device did not send data after 15 seconds. Measure by hand and type the number below.', 'El dispositivo no envió datos después de 15 segundos. Mídete a mano y escribe el número abajo.')}
        </p>
      ) : null}
      {a.canSwitch ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button type="button" onClick={a.reset} style={small}>{L('Change how I measure', 'Cambiar la forma de medir')}</button>
          {a.on ? (<button type="button" onClick={a.tryFail} style={small}>{L('Demo: device does not answer', 'Demo: el dispositivo no responde')}</button>) : null}
        </div>
      ) : null}
    </div>
  );
}
