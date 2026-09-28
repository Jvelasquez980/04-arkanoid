# SPEC 01 — MVP jugable de Arkanoid

> **Status:** Aprobado
> **Depends on:** ninguno
> **Date:** 2026-09-28
> **Objective:** Un Arkanoid de una sola pantalla, jugable con mouse y teclado, con 3 vidas, puntaje básico y overlay de victoria/game over.

## Alcance

**Dentro:**

- Una pantalla de juego en `<canvas>` 2D de 800x600 (coordenadas lógicas fijas, centrado por CSS).
- Layout fijo de 10 columnas x 6 filas de bloques (60), un color por fila, 1 golpe por bloque.
- Paleta controlada simultáneamente por mouse y teclado (←/→ y A/D). Gana el último input usado.
- Bola pegada a la paleta al inicio y tras perder una vida; se lanza con Espacio o clic.
- Rebote simple (reflejo) en paredes, techo, paleta y bloques.
- 3 vidas. La bola cae por abajo = -1 vida.
- Puntaje: 10 puntos por bloque destruido.
- HUD dibujado en canvas: `Score` a la izquierda, `Vidas` a la derecha.
- Overlay de victoria (0 bloques) y de game over (0 vidas). Espacio o clic reinicia.
- Uso de `assets/spritesheet.js` y `assets/spritesheet-breakout.png` para paleta, bola y bloques.

**Fuera de alcance (specs futuros):**

- Sonidos (`ball-bounce.mp3`, `break-sound.mp3`).
- Animación de explosión de bloques (`EXPLOSION_FRAMES`).
- Ángulo de rebote según punto de impacto en la paleta.
- Múltiples niveles, bloques gray/resistentes.
- Power-ups, high score persistente.
- Pausa, menú de inicio, touch/móvil, canvas responsive.
- Aceleración de la bola.

## Modelo de datos

```js
// Constantes
const W = 800, H = 600;
const BALL_SPEED = 300;      // px/s, constante
const PADDLE_SPEED = 500;    // px/s, teclado
const POINTS_PER_BLOCK = 10;
const INITIAL_LIVES = 3;
const ROW_COLORS = ['red', 'yellow', 'cyan', 'green', 'magenta', 'hotpink'];

// Estado del juego
const game = {
  state: 'ready',   // 'ready' | 'playing' | 'won' | 'lost'
  score: 0,
  lives: INITIAL_LIVES,
  paddle: { x, y: 560, w: 162, h: 14 },
  ball: { x, y, w: 16, h: 16, vx, vy },   // px/s
  blocks: [/* { x, y, w: 64, h: 32, color, alive } */],
};
```

Convenciones:

- Origen arriba-izquierda; `x`,`y` = esquina superior izquierda.
- Velocidades en px/s; el loop usa `dt` de `requestAnimationFrame` (limitado a ~50 ms).
- Bloques 64x32 (sprites 32x16 a escala 2x), grilla centrada horizontalmente (10 x 64 = 640, margen 80).
- Bola y paleta a escala 1x.
- Estados: `ready` = bola pegada a la paleta; `won`/`lost` = overlay visible.

## Plan de implementación

1. Crear `index.html` (canvas 800x600, carga `assets/spritesheet.js` y luego `game.js`) y `style.css` (fondo oscuro, canvas centrado). Prueba: abrir el HTML, ver el canvas vacío sin errores.
2. Crear `game.js` con el loop (`requestAnimationFrame`, `dt`), `loadSpritesheet` y dibujo de paleta y bola en estado `ready` (bola pegada a la paleta).
3. Input: mouse mueve la paleta (clamp a 0..W-w); teclado ←/→/A/D mueve la paleta a `PADDLE_SPEED`. La bola pegada sigue la paleta.
4. Lanzamiento con Espacio o clic (`ready` → `playing`) y movimiento de la bola con `BALL_SPEED`, ángulo inicial hacia arriba con leve aleatoriedad. Rebote en paredes izquierda/derecha y techo.
5. Rebote en la paleta (reflejo de `vy`, sin pegarse) y pérdida de vida por el borde inferior (`lives--`, vuelve a `ready`; con 0 vidas pasa a `lost`).
6. Crear la grilla de bloques y dibujarla; colisión bola-bloque (reflejo según eje de menor penetración), `alive = false`, `score += 10`.
7. HUD (`Score`, `Vidas`) y overlays `won`/`lost` con texto y reinicio por Espacio o clic (resetea `game`).

## Criterios de aceptación

- [ ] Abrir `index.html` con `file://` carga el juego sin errores en consola.
- [ ] Se dibujan 60 bloques en 6 filas de colores distintos, 10 por fila.
- [ ] El mouse mueve la paleta y nunca sale del canvas.
- [ ] ←/→ y A/D mueven la paleta y nunca sale del canvas.
- [ ] Mouse y teclado funcionan en la misma partida sin conflicto (el último input usado controla).
- [ ] Al inicio y tras perder una vida, la bola está pegada a la paleta y la sigue.
- [ ] Espacio o clic lanza la bola; en `ready` la bola no se mueve por sí sola.
- [ ] La bola rebota en paredes laterales, techo y paleta.
- [ ] La bola se mueve a velocidad constante (300 px/s) durante toda la partida.
- [ ] Romper un bloque lo elimina y suma exactamente 10 puntos.
- [ ] La bola que cae por abajo resta 1 vida y vuelve a `ready`.
- [ ] El HUD muestra puntaje y vidas actualizados en tiempo real; vidas inicia en 3.
- [ ] Con 0 vidas aparece el overlay de game over; con 0 bloques, el de victoria.
- [ ] Espacio o clic en el overlay reinicia: score 0, vidas 3, 60 bloques, estado `ready`.
- [ ] No se reproduce ningún sonido ni animación de explosión.

## Decisiones

- **Sí:** un solo `game.js` global, sin módulos ES. Coherente con `spritesheet.js` global y permite abrir por `file://`.
- **No:** módulos ES. Requieren servidor estático.
- **Sí:** mouse y teclado simultáneos, último input gana. Evita modos y configuración.
- **Sí:** rebote simple (reflejo). Decisión del usuario para mantener el MVP mínimo.
- **No:** ángulo según impacto en paleta. Queda para otro spec; mejora el control del jugador.
- **Sí:** velocidad de bola constante 300 px/s. Simplifica el tuning.
- **No:** sonidos ni explosiones en el MVP. Assets existen pero se dejan para un spec de pulido.
- **Sí:** overlays dibujados en canvas, no en DOM. Un único sistema de render.
- **No:** pausa. No pedida para el MVP.
- **Sí:** puntaje fijo de 10 por bloque, sin multiplicadores.
- **Sí:** 3 vidas y una sola pantalla; sin niveles.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Bola atraviesa bloques/paleta por `dt` grande (tunneling) | Limitar `dt` a ~50 ms; a 300 px/s el desplazamiento máximo por frame es 15 px, menor que la bola (16 px). |
| Bola se queda pegada o rebota varias veces en la paleta | Tras el rebote, reposicionar la bola justo encima de la paleta y forzar `vy < 0`. |
| Bola en trayectoria casi horizontal (bucle sin fin) | Ángulo inicial acotado; el reflejo simple no cambia el ángulo, así que no se degrada. |
| Spritesheet no carga (`file://` o ruta) | `loadSpritesheet` ya usa canvas offscreen vía `Image`; iniciar el loop solo tras el callback y loguear el error existente. |

## Qué **no** está en este spec

- Sonidos, explosiones, ángulo de rebote por impacto.
- Niveles, power-ups, high score persistente.
- Pausa, menús, touch, canvas responsive.
