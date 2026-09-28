# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado

Juego Arkanoid en HTML, CSS y JavaScript vanilla, **cero dependencias** (sin npm/bundler/build/test/lint). Se ejecuta abriendo `index.html` en el navegador (o servidor estático simple). Repo git, rama principal `main`.

Specs 01–03 **Implementados**: MVP jugable, animación de explosión, 3 niveles + sonido/mute.

## Estructura

- `index.html`: canvas 800x600 `#game`; carga `assets/spritesheet.js` y luego `game.js` (scripts globales, sin módulos; el orden importa).
- `style.css`: centrado del canvas.
- `game.js` (único archivo de lógica): constantes, `LEVELS` (layout como grid de strings + velocidad de bola), `SOUNDS`/`muted`, objeto `game` (`state`: `ready | playing | cleared | won | lost`, `level`, `score`, `lives`, `paddle`, `ball`, `blocks`, `explosions`), input (mouse + teclado, gana el último usado), `update(dt)`/`draw()`/`loop`.
- Controles: mouse o ←/→ y A/D, Espacio/clic lanza/continúa/reinicia, `M` mute, `1`/`2`/`3` selector de nivel (solo en `ready`).

## Assets (`assets/`)

- `spritesheet-breakout.png`: spritesheet único.
- `spritesheet.js`: coordenadas `{sx, sy, sw, sh}` para `drawImage`: `SPRITES` (`paddle`, `ball`, `blocks` por color), `EXPLOSION_FRAMES` (4 frames por color; `gray` reutiliza `red`), `EXPLOSION_DURATION` (150 ms).
- `sounds/ball-bounce.mp3`, `sounds/break-sound.mp3`.

## Workflow spec-driven

**Todo cambio de funcionalidad pasa por un spec.** Flujo: `/spec` → aprobación humana → `/spec-impl`. No escribir código de features sin spec aprobado.

Skills en `.agents/skills/` (vía `skills-lock.json`, fuente Klerith/fernando-skills):
- `/spec`: diseña specs por secciones con preguntas al usuario; plantilla en `.agents/skills/spec/template.md`; guarda en `specs/NN-nombre.md`. No escribe código.
- `/spec-impl <NN|slug|NN-slug>`: implementa un spec. Ver reglas abajo.

Config: `specs/.spec-config.yml` → `AutoCreateBranch: true` (crea rama `spec-NN-slug` sin preguntar; `false` pregunta [y/N]).

### Formato de spec (`specs/NN-slug-kebab.md`, en español)

Header en blockquote: `# SPEC NN — Título`, `**Status:**`, `**Depends on:**`, `**Date:**`, `**Objective:**` (una sola frase). Estados: `Borrador`, `En revisión`, `Aprobado`, `Implementado`, `Obsoleto`.

Secciones, en orden: (opcional) Por qué → **Alcance** (Dentro / Fuera de alcance, ambos obligatorios) → **Modelo de datos** (código real corto; si no hay, decirlo) → **Plan de implementación** (pasos numerados, cada uno ejecutable y commiteable, ≤30–50 líneas) → **Criterios de aceptación** (checklist booleano verificable) → **Decisiones** (Sí/No con razón) → Riesgos (opcional) → **Qué NO entra** (refuerzo).

Reglas: una idea por frase, nombres concretos (archivos, teclas, strings exactos), sin TODOs, sin funciones completas en el spec.

### Reglas de `/spec-impl`

- Solo implementa specs en estado **Aprobado**; el cambio de estado lo hace el humano. Cualquier otro estado → parar.
- Working tree debe estar limpio (si no, avisar; no hacer stash/commit por el usuario).
- Rama `spec-NN-slug`; mostrar objetivo, alcance, plan y criterios antes de empezar; pedir confirmación.
- Un paso del plan a la vez; pausar tras cada uno para revisar diff.
- **Nunca commitear automáticamente**; solo si el usuario lo pide.
- Implementar lo que dice el spec. Ambigüedad → parar y ofrecer 2–3 opciones. Fuera de alcance → recordarlo y anotarlo para otro spec. Cambios de diseño van al spec, no al código.
- Al terminar y cumplir criterios, marcar checklist y pasar `Status` a `Implementado`.

### Convenciones de código

- Seguir el estilo de `game.js`: constantes en MAYÚSCULAS arriba, comentarios breves en español, estado en el objeto `game`.
- Specs posteriores pueden superar exclusiones de specs previos; el spec nuevo lo declara en su Alcance.

`.claude/skills/tsundere`: skill de estilo de respuesta, no afecta el código.
