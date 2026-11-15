# ASTRA · Astronaut Self-health Tracking & Risk Assessment

Prototipo para el reto **Health Monitoring Software** de NASA Space Apps 2026.
Creado con Claude Code.

Stack: **React 18 + Vite 5 + Tailwind CSS 3 + React Router 6**.

## Cómo correrlo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # versión para publicar, en dist/
```

Para publicarlo en Vercel o Netlify: comando de build `npm run build`, carpeta `dist`. Como usa rutas del navegador (`/chequeo`, `/radiacion`…), configura la redirección de todas las rutas a `index.html`. En Netlify es un archivo `public/_redirects` con `/* /index.html 200`.

## Estructura

```
astra-app/
├── data/                         CSV para el equipo (se pueden abrir en Excel)
│   ├── linea_base.csv            línea base de los 4 astronautas simulados
│   ├── vitales_simulados.csv     signos diarios, días 29 a 42
│   ├── radiacion_simulada.csv    lecturas del dosímetro cada 2 h, días 1 a 42
│   └── radiacion_mediciones.csv  plantilla vacía para las mediciones que se registren
├── public/assets/astra-logo.png
└── src/
    ├── App.jsx                   rutas
    ├── data/sim.json             los mismos datos simulados, listos para la app
    ├── data/rad_data.json        datos de radiación para la app
    ├── screens/                  Inicio, Chequeo, Tendencias, Emergencia, LineaBase, Radiacion
    ├── components/               Stella (asistente + marca de agua) y SimBar (barra de simulación)
    ├── index.css                 Tailwind
    └── prototype.css             cielo con estrellas, animaciones y efectos del prototipo
```

| Ruta | Pantalla |
|---|---|
| `/` | Inicio: cuerpo que gira, áreas del cuerpo, entorno |
| `/chequeo` | Chequeo diario guiado |
| `/tendencias` | Gráficas de todos los parámetros |
| `/radiacion` | Radiación actual, aguda y acumulada |
| `/emergencia` | Protocolos de emergencia (incluye evento de radiación) |
| `/linea-base` | Modo manual o modo simulación, y línea base |

## Cómo está hecho el código

Cada pantalla es un componente de clase de React con dos partes:

- `renderVals()` calcula todo lo que se muestra: textos en inglés y español, niveles, gráficas y manejadores.
- `render()` dibuja el JSX con esos valores (`v.*`).

El código se convirtió automáticamente desde el prototipo, así que la lógica es la misma que se probó ahí. Los estilos vienen del prototipo como estilos en línea (`style={{…}}`). Tailwind ya está configurado, con los colores y tipografías de ASTRA en `tailwind.config.js` (`bg-space-900`, `text-ice`, `text-lilac`, `font-display`…), para lo nuevo que construyan y para ir pasando los estilos a clases poco a poco.

## Datos y almacenamiento

Todo se guarda en el navegador (`localStorage`), así que funciona sin conexión:

| Clave | Qué guarda |
|---|---|
| `astra.lang` | idioma |
| `astra.env` | entorno elegido en Inicio (`ship`, `station`, `moon`) |
| `astra.baseline` | línea base del modo manual |
| `astra.checkin` | último chequeo del modo manual |
| `astra.sim`, `astra.simdata` | modo simulación: astronauta y día |
| `astra.radrec.<astronauta>` | mediciones de radiación registradas (C001–C004 o `individual`) |
| `astra.radev.<astronauta>` | eventos solares registrados a mano |

En **Radiación → Registrar una medición**, el botón **Copiar mediciones en CSV** copia las filas con las mismas columnas de `data/radiacion_mediciones.csv`, para pegarlas ahí. Si quieren que se descargue el archivo directo, se puede agregar una descarga con `Blob` en esta versión de React; el visor del prototipo no lo permitía.

## Qué es real y qué es simulado

- **Simulado:** todos los valores de los 4 astronautas (C001–C004), la misión previa de C001 y las dosis efectivas semanales. La app lo marca como SIMULADO.
- **Referencias y límites:** vienen del documento del equipo: referencias de tasa (ISS 0.16, Mir 0.37, tránsito a Marte 0.3–0.6, misión lunar 0.33 mGy/día), límite de carrera de NASA-STD-3001 (menos de 600 mSv), límite SPE de 250 mSv y tabla del CDC.
- **Datos NASA reales:** todavía no están conectados. El siguiente paso es la pestaña "Datos NASA" con OSD-575 (Inspiration4). Cita obligatoria: "Data are courtesy of the NASA Open Science Data Repository (https://osdr.nasa.gov/bio/repo)".

## Notas

- Stella responde con reglas y palabras clave, usando textos de la propia app. No es un modelo de IA conectado.
- ASTRA ayuda a notar cambios. No hace diagnósticos.
