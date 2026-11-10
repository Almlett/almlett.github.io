# michelandrade.com

Índice personal con accesos a mis apps (OmniStory, Core, MyHub, LifeOS, Comidonga, Flow, Brain y HomeLab).

Usa el tema "Electric Glass" de las apps (Plus Jakarta Sans + Hanken Grotesk, fondo `#0b1326`, un acento por app). El fondo es una constelación en `<canvas>` con una estrella del color de cada app; en escritorio las apps orbitan el logo. Atajos: `1`–`8` abren una app y `/` enfoca la búsqueda (Enter abre la primera coincidencia).

## Agregar una app

Copia una `<article class="app">` en `index.html`, ajusta `--accent`, `--i` (posición), `data-search`, icono, textos, versión y enlace, y agrega su icono a `.orbit` y su color a `appColors` en `script.js`.

## Iconos y versión

- `icons/michelandrade.svg` es el icono de este sitio; `icons/<app>.svg` son copias del `icon.svg` de cada app (mismo motivo que su login) para las tarjetas del menú.
- La versión del sitio se muestra en el pie de `index.html` (`vX.Y.Z`) y sube con cada cambio visible, según `docs/ESTANDARES.md` de las apps.
