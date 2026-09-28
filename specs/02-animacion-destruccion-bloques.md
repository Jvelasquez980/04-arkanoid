# SPEC 02 — Animación de destrucción de bloques

> **Status:** Implementado
> **Depends on:** SPEC 01
> **Date:** 2026-09-28
> **Objective:** Al romperse un bloque, reproducir en su posición la animación de explosión de 4 frames (`EXPLOSION_FRAMES`) durante 150 ms, sin afectar colisión ni puntaje.

## Alcance

**Dentro:**

- Lista `game.explosions` con una explosión por bloque destruido.
- Animación de 4 frames del color del bloque, usando `EXPLOSION_FRAMES` y `EXPLOSION_DURATION` (150 ms **total**, ~37.5 ms por frame).
- Dibujo con `drawFrame` a la misma posición y tamaño del bloque (64x32).
- Las explosiones avanzan en cada frame del loop, sea cual sea `game.state` (incluye `won`/`lost`).
- Overlay de victoria se dibuja solo cuando no quedan explosiones activas.
- `resetGame` vacía `game.explosions`.
- Actualizar SPEC 01 no es necesario; su exclusión de explosiones queda superada por este spec.

**Fuera de alcance (specs futuros):**

- Sonidos (`break-sound.mp3`, `ball-bounce.mp3`).
- Partículas, screen shake u otros efectos.
- Bloques gray/resistentes con estados de daño.
- Animaciones de otros objetos (bola, paleta, pérdida de vida).
- Cambiar puntaje, colisión o física de la bola.

## Modelo de datos

```js
// Constantes (EXPLOSION_FRAMES y EXPLOSION_DURATION ya existen en assets/spritesheet.js)
const EXPLOSION_FRAME_COUNT = 4;

// Nuevo campo en game
game.explosions = [/* { x, y, w, h, color, elapsed } */];   // elapsed en ms
```

Convenciones:

- `x`,`y`,`w`,`h` copiados del bloque al romperse; `color` = `b.color`.
- Frame actual = `Math.min(3, Math.floor(elapsed / (EXPLOSION_DURATION / EXPLOSION_FRAME_COUNT)))`.
- Una explosión se elimina cuando `elapsed >= EXPLOSION_DURATION`.
- `dt` del loop está en segundos; `elapsed += dt * 1000`.
- La explosión es solo visual: el bloque ya tiene `alive = false` y la bola lo atraviesa.

## Plan de implementación

1. Añadir `game.explosions = []` y vaciarlo en `resetGame`. Prueba: el juego corre igual que en SPEC 01, sin errores.
2. En `collideBlocks`, al poner `b.alive = false`, hacer `push` de `{ x, y, w, h, color, elapsed: 0 }` a `game.explosions`. Prueba: en consola, `game.explosions.length` sube al romper un bloque.
3. Crear `updateExplosions(dt)`: suma `dt * 1000` a `elapsed` y filtra las terminadas. Llamarla desde `update(dt)` fuera de los ramales por estado. Prueba: `game.explosions` vuelve a 0 ~150 ms después, también en `won`/`lost`.
4. Dibujar explosiones en `draw()` con `drawFrame` (después de bloques, antes de paleta/bola). Prueba: se ve la animación de 4 frames al romper cada bloque.
5. Condicionar el overlay `won` a `game.explosions.length === 0`. Prueba: romper el último bloque muestra su explosión y luego el overlay.

## Criterios de aceptación

- [X] Al romper un bloque aparece en su posición una animación de 4 frames del color del bloque.
- [X] La animación dura 150 ms en total (`EXPLOSION_DURATION`).
- [X] El bloque original deja de dibujarse en el instante del impacto (sin superposición con la explosión).
- [X] Puntaje sigue sumando exactamente 10 por bloque, al instante del impacto.
- [X] La bola atraviesa la explosión sin rebotar.
- [X] Al terminar la animación, `game.explosions` queda sin ese elemento.
- [X] Al perder una vida, las explosiones activas terminan su animación.
- [X] Al romper el último bloque, primero se ve la explosión y después aparece el overlay de victoria.
- [X] Al reiniciar (Espacio o clic), `game.explosions` queda vacío.
- [X] Explosiones de varios bloques rotos en frames cercanos se animan de forma independiente.
- [X] No hay errores en consola y no se reproduce ningún sonido.

## Decisiones

- **Sí:** 150 ms totales con `EXPLOSION_DURATION`. Es la constante del spritesheet y no estorba el ritmo del juego.
- **No:** 150 ms por frame (600 ms) ni constante nueva. Se ve demasiado lento y duplica la fuente de verdad.
- **Sí:** explosión solo visual; `alive = false` y puntaje al instante. Mantiene intacta la lógica de SPEC 01.
- **No:** bloque sólido hasta terminar la animación. Complica reflejos y puntaje sin beneficio.
- **Sí:** lista separada `game.explosions` y no un estado dentro del bloque. Desacopla animación de `alive`.
- **Sí:** overlay `won` espera a que terminen las explosiones. Permite ver romperse el último bloque.
- **Sí:** al perder vida las explosiones continúan; al reiniciar se limpian. Son independientes de `ready`.
- **Sí:** el timer se actualiza en cualquier estado. Necesario para que la última explosión termine en `won`.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Explosión congelada en `won` si `update` solo actualiza en `playing` | `updateExplosions` se llama fuera de los ramales por estado. |
| `dt` limitado (50 ms) salta frames de animación | Aceptable; el frame se calcula por `elapsed`, no por contador. |
| Color sin frames (p. ej. color nuevo) | Todos los colores de `ROW_COLORS` existen en `EXPLOSION_FRAMES`; `gray` reutiliza `red`. |

## Qué **no** está en este spec

- Sonidos.
- Partículas, shake u otros efectos.
- Bloques resistentes.
- Cambios de puntaje, colisión o física.
