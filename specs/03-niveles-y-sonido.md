# SPEC 03 — Niveles y sonido

> **Status:** Aprobado
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-09-28
> **Objective:** Añadir 3 niveles con layout y velocidad de bola propios, más sonidos de rebote y rotura de bloque con mute por tecla M.

## Alcance

**Dentro:**

- Array `LEVELS` en `game.js` con 3 niveles: layout como grid de strings + velocidad de bola.
- Velocidad de bola por nivel: 300 / 340 / 380 px/s.
- Movimiento de bola en substeps (≤ 8 px por paso) para evitar tunneling a mayor velocidad.
- Nuevo estado `cleared`: nivel completado, no es el último.
- Overlay `Nivel N completado` tras terminar las explosiones; Espacio o clic carga el siguiente nivel en `ready`.
- Score y vidas se conservan entre niveles.
- Tras el nivel 3, overlay de victoria actual (`won`).
- Game Over y Victoria reinician todo: nivel 1, score 0, 3 vidas.
- HUD: `Nivel N` centrado arriba.
- Sonido `ball-bounce.mp3` al rebotar en paleta, paredes laterales y techo.
- Sonido `break-sound.mp3` al romper un bloque (sin bounce en ese rebote).
- Tecla M alterna mute; indicador `Silencio (M)` en HUD bajo el score cuando está activo. No persiste.
- Selector de niveles (para pruebas): teclas `1`, `2`, `3` en estado `ready` cargan ese nivel con la bola pegada. Score y vidas se conservan.

**Fuera de alcance (specs futuros):**

- Bloques gray/resistentes (varios golpes).
- Más de 3 niveles, niveles procedurales, editor de niveles.
- Música de fondo, control de volumen, persistencia del mute.
- Sonidos de perder vida, lanzar bola, victoria o game over.
- Continuar desde el nivel perdido tras Game Over.
- Menú visual de selección de nivel, high score persistente, power-ups.
- Ángulo de rebote según impacto en la paleta.

## Modelo de datos

```js
// Constantes
const MAX_STEP = 8;   // px máximos por substep de la bola
const BLOCK_CHARS = { R: 'red', Y: 'yellow', C: 'cyan', G: 'green', M: 'magenta', P: 'hotpink' };   // '.' = vacío

const LEVELS = [
  { speed: 300, rows: [
    'RRRRRRRRRR',
    'YYYYYYYYYY',
    'CCCCCCCCCC',
    'GGGGGGGGGG',
    'MMMMMMMMMM',
    'PPPPPPPPPP',
  ] },
  { speed: 340, rows: [
    '....RR....',
    '...YYYY...',
    '..CCCCCC..',
    '.GGGGGGGG.',
    'MMMMMMMMMM',
    'PPPPPPPPPP',
  ] },
  { speed: 380, rows: [
    'RR.RR.RR.R',
    'YY.YY.YY.Y',
    'CCCCCCCCCC',
    'G.G.G.G.G.',
    '.M.M.M.M.M',
    'PPPPPPPPPP',
  ] },
];

// Sonidos (fuera de game: no se resetean)
const SOUNDS = {
  bounce: new Audio('assets/sounds/ball-bounce.mp3'),
  break: new Audio('assets/sounds/break-sound.mp3'),
};
let muted = false;

// Cambios en game
game.state = 'ready';   // 'ready' | 'playing' | 'cleared' | 'won' | 'lost'
game.level = 1;         // 1-based; LEVELS[game.level - 1]
```

Convenciones:

- Cada string de `rows` tiene exactamente 10 caracteres (10 columnas de SPEC 01); filas desde `TOP = 60`.
- `createBlocks(level)` lee `LEVELS[level - 1].rows`; `'.'` no crea bloque.
- `ROW_COLORS` se elimina; `BLOCK_CHARS` lo reemplaza.
- `BALL_SPEED` se elimina; `launchBall` usa `LEVELS[game.level - 1].speed`.
- Substeps: `n = Math.ceil(speed * dt / MAX_STEP)`, cada paso avanza `dt / n`.
- `playSound(name)`: si `muted`, nada; si no, `SOUNDS[name].cloneNode().play()` con `.catch(() => {})`. Clonar permite solapar sonidos.
- `muted` vive fuera de `game`: reiniciar partida no lo cambia.

## Plan de implementación

1. Añadir `LEVELS`, `BLOCK_CHARS`, `game.level = 1`; `createBlocks(level)` parsea el grid; eliminar `ROW_COLORS`. `resetGame` pone `level = 1`. Prueba: nivel 1 se ve igual que en SPEC 01 (60 bloques).
2. Velocidad por nivel en `launchBall` (eliminar `BALL_SPEED`) y substeps en `updateBall` (cortar el loop si cambia el estado). Prueba: en consola `game.level = 3; game.blocks = createBlocks(3)` en `ready`, lanzar → bola a 380 px/s sin atravesar bloques.
3. Estado `cleared`: al quedar 0 bloques, `cleared` si `level < LEVELS.length`, si no `won`. Overlay `Nivel N completado` (espera explosiones, igual que `won`). `primaryAction` en `cleared` → `nextLevel()`: `level++`, nuevos bloques, `explosions = []`, `ready`, bola pegada. Prueba: completar nivel 1 → overlay → clic → nivel 2 con score y vidas intactos.
4. HUD `Nivel N` centrado arriba. Prueba: se actualiza al pasar de nivel y vuelve a 1 al reiniciar.
5. `SOUNDS`, `playSound` y llamadas: `bounce` en paleta, paredes y techo; `break` en `collideBlocks`. Prueba: se oyen ambos sonidos; romper bloque no suena bounce.
6. Tecla M alterna `muted`; indicador `Silencio (M)` bajo el score. Prueba: M silencia y reactiva; reiniciar no cambia el mute.
7. Selector de niveles: extraer `loadLevel(n)` (`level = n`, bloques nuevos, `explosions = []`, `ready`, bola pegada) y usarla en `nextLevel()`. En `keydown`, `1`..`LEVELS.length` en `ready` llama `loadLevel(n)`; ignorado en otros estados. Prueba: en `ready`, pulsar 2 → layout y velocidad del nivel 2; pulsar 3 → nivel 3; durante `playing` no hace nada.

## Criterios de aceptación

- [ ] Abrir `index.html` con `file://` carga el juego sin errores en consola.
- [ ] Nivel 1 tiene 60 bloques en el layout de SPEC 01.
- [ ] Niveles 2 y 3 muestran exactamente los layouts de `LEVELS`.
- [ ] La bola va a 300 px/s en nivel 1, 340 en nivel 2 y 380 en nivel 3.
- [ ] En nivel 3 la bola no atraviesa bloques ni la paleta.
- [ ] Al romper el último bloque de nivel 1 o 2, tras la explosión aparece `Nivel N completado`.
- [ ] Espacio o clic en ese overlay carga el siguiente nivel con la bola pegada a la paleta.
- [ ] Score y vidas se conservan al pasar de nivel.
- [ ] Al romper el último bloque del nivel 3 aparece el overlay de victoria.
- [ ] Reiniciar desde Victoria o Game Over deja nivel 1, score 0, 3 vidas.
- [ ] El HUD muestra `Nivel N` centrado y actualizado.
- [ ] Rebotar en paleta, pared lateral o techo reproduce `ball-bounce.mp3`.
- [ ] Romper un bloque reproduce `break-sound.mp3` y no `ball-bounce.mp3`.
- [ ] Varios sonidos seguidos se solapan sin cortarse.
- [ ] La bola pegada a la paleta (`ready`) no reproduce sonidos.
- [ ] M silencia todos los sonidos y muestra `Silencio (M)`; M de nuevo los reactiva.
- [ ] Reiniciar la partida no cambia el estado de mute; recargar la página lo desactiva.
- [ ] Si el audio falla (bloqueado o ausente), el juego sigue sin errores no capturados.
- [ ] En `ready`, las teclas 1, 2 y 3 cargan el nivel correspondiente (layout y velocidad propios) con la bola pegada.
- [ ] Las teclas 1-3 no hacen nada en `playing`, `cleared`, `won` ni `lost`.
- [ ] Cambiar de nivel con 1-3 conserva score y vidas.

## Decisiones

- **Sí:** niveles y sonido en un spec. El sonido es pequeño (2 archivos, 2 eventos).
- **Sí:** 3 niveles como grids de strings en `game.js`. Legibles y fáciles de editar sin herramientas.
- **No:** niveles procedurales. Menos control del diseño.
- **Sí:** velocidad creciente 300/340/380 px/s. Única progresión de dificultad además del layout.
- **Sí:** substeps de ≤ 8 px. A 380 px/s y `dt` 50 ms la bola movería 19 px (> 16 px de su tamaño).
- **No:** reducir `MAX_DT`. Menos robusto ante lag.
- **Sí:** estado `cleared` con overlay y confirmación del jugador. Pausa clara entre niveles.
- **No:** transición automática o instantánea. El jugador pierde el control del ritmo.
- **Sí:** Game Over reinicia en nivel 1. Coherente con el arcade clásico.
- **Sí:** `HTMLAudioElement` + `cloneNode`. Funciona en `file://`; Web Audio con `fetch` falla ahí.
- **Sí:** bounce en paleta/paredes/techo; en bloque solo break. Evita doble sonido.
- **Sí:** mute con M, sin persistencia. Suficiente; persistir va en otro spec.
- **Sí:** selector por teclas 1-3 solo en `ready`. Herramienta de prueba mínima; sin UI ni riesgo de cambiar nivel a mitad de partida.
- **No:** menú visual de niveles. No hace falta para probar.
- **No:** bloques gray resistentes. Requieren estados de daño; spec propio.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Autoplay bloqueado antes de interacción | El primer sonido ocurre tras lanzar la bola (Espacio/clic ya es interacción). `play()` con `.catch`. |
| `play()` rechaza la promesa (archivo ausente) | `.catch(() => {})`; el juego sigue. |
| Substeps procesan eventos tras cambiar estado (`won`/`cleared`/`lost`) | Cortar el loop de substeps si `game.state !== 'playing'`. |
| Explosiones de nivel anterior visibles en el siguiente | `nextLevel` vacía `game.explosions`; el overlay ya espera a que terminen. |
| String de fila con longitud distinta de 10 | Convención documentada; los 3 layouts se revisan a mano (10 chars por fila). |

## Qué **no** está en este spec

- Bloques resistentes.
- Más niveles, procedurales o editor.
- Música, volumen, mute persistente.
- Sonidos de vida, lanzamiento, victoria o game over.
- High score, power-ups, menú visual de selección de nivel.
