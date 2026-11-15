import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Inicio from './screens/Inicio.jsx';
import Chequeo from './screens/Chequeo.jsx';
import Tendencias from './screens/Tendencias.jsx';
import Emergencia from './screens/Emergencia.jsx';
import LineaBase from './screens/LineaBase.jsx';
import Radiacion from './screens/Radiacion.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Al abrir la app (carga inicial o recarga) siempre se muestra Línea Base primero.
function StartOnLineaBase() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/linea-base', { replace: true }); }, []);
  return null;
}

export default function App() {
  return (
    <>
      <StartOnLineaBase />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/chequeo" element={<Chequeo />} />
        <Route path="/tendencias" element={<Tendencias />} />
        <Route path="/emergencia" element={<Emergencia />} />
        <Route path="/linea-base" element={<LineaBase />} />
        <Route path="/radiacion" element={<Radiacion />} />
        <Route path="*" element={<Inicio />} />
      </Routes>
    </>
  );
}
