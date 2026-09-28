# Arkanoid

Juego de Arkanoid en HTML, CSS y JavaScript vanilla. Cero dependencias: sin npm, bundler ni build.

## Jugar

Abre `index.html` en el navegador, o sirve la carpeta con cualquier servidor estático:

```bash
python3 -m http.server 8000
```

## Controles

| Acción | Input |
| --- | --- |
| Mover paleta | Mouse, `←`/`→` o `A`/`D` (gana el último usado) |
| Lanzar bola / continuar / reiniciar | `Espacio` o clic |
| Silenciar / activar sonido | `M` |
| Ir a nivel 1, 2 o 3 (solo con la bola pegada) | `1`, `2`, `3` |

## Características

- Canvas 2D de 800x600 con sprites (`assets/spritesheet-breakout.png`).
- 3 niveles con layout y velocidad de bola propios (300 / 340 / 380 px/s).
- 3 vidas, 10 puntos por bloque; score y vidas se conservan entre niveles.
- Animación de explosión al romper bloques.
- Sonidos de rebote y rotura de bloque, con mute.
- Overlays de nivel completado, victoria y game over.

## Estructura

```
index.html          canvas y carga de scripts
style.css           estilos
game.js             lógica del juego
assets/             spritesheet, coordenadas de sprites y sonidos
specs/              specs del proyecto (spec-driven)
.agents/skills/     skills /spec y /spec-impl
```

## Desarrollo spec-driven

Cada funcionalidad se diseña en un spec (`specs/NN-nombre.md`) con `/spec`, se aprueba y se implementa con `/spec-impl`.

| Spec | Descripción | Estado |
| --- | --- | --- |
| 01 | MVP jugable | Implementado |
| 02 | Animación de destrucción de bloques | Implementado |
| 03 | Niveles y sonido | Implementado |

Más detalles en `CLAUDE.md`.
