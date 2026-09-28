# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado

Juego Arkanoid en HTML, CSS y JavaScript vanilla, **cero dependencias** (sin npm/bundler/build). Aún no implementado: solo existen assets y skills. No hay git repo, comandos de build/test/lint ni código de juego todavía. Se ejecuta abriendo el HTML en el navegador (o servidor estático simple).

## Assets (`assets/`)

- `spritesheet-breakout.png`: spritesheet único.
- `spritesheet.js`: script global (sin módulos) con coordenadas de recorte `{sx, sy, sw, sh}` para `drawImage`:
  - `SPRITES` (`paddle`, `ball`, `blocks` por color: gray, red, yellow, cyan, ...).
  - `EXPLOSION_FRAMES` (4 frames por color; `gray` reutiliza los frames de `red`) y `EXPLOSION_DURATION` (150 ms).
  - Debe cargarse con `<script>` antes del código del juego (define `const` globales).
- `sounds/ball-bounce.mp3`, `sounds/break-sound.mp3`: rebote de bola y rotura de bloque.

## Workflow spec-driven

Skills en `.agents/skills/` (instaladas vía `skills-lock.json`, fuente Klerith/fernando-skills):
- `/spec`: diseña specs por secciones (plantilla en `.agents/skills/spec/template.md`), guarda en `specs/NN-nombre.md`. No escribe código.
- `/spec-impl <NN-spec-name>`: implementa un spec aprobado; crea rama git con el nombre del spec y pausa para revisar diffs. Requiere repo git (actualmente no hay: `git init` primero).

`.claude/skills/tsundere`: skill de estilo de respuesta, no afecta el código.
