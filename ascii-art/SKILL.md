---
name: ascii-art
description: >-
  Design ASCII-style stills and animations that explain any concept through
  monospace text, symbols, spacing, and stepped motion. Use for text-art visual
  concepts, diagrams, storyboards, and animated explanations. Show a text
  preview in chat, build editable Figma stills, and animate after the user
  confirms the visual direction.
license: MIT
metadata:
  author: MildTomato
  version: '1.0.0'
---

# ASCII art

Turn an idea into a readable visual made from characters. Treat the look,
composition, and explanation as one design problem. This skill applies to any
subject or brand; the reference subjects do not constrain what you can depict.
Stills are complete deliverables. Motion is a separate, approved next stage.

## Preview, build stills, then animate

Use this workflow when the skill runs in a conversational harness. Honor an
explicit request for a different medium or workflow.

1. Identify what the viewer needs to understand. Choose a visual metaphor that
   preserves that meaning: arrangement, hierarchy, containment, change,
   comparison, flow, density, or another relationship suited to the subject.
2. Show an actual text-art preview **in the chat**, inside a fenced `text`
   block. A description, file link, or promise to preview is not a substitute.
   For a still, show the composition. For an animation, show its meaningful
   poses with short explanations outside the art. Preserve spaces and line
   breaks. Keep the preview narrow enough to read in chat without wrapping.
3. Build editable stills in the intended Figma file. Refine the chat rough at
   the real canvas size, inspect the native rendering, and share the frame
   links and images. If the destination is unknown, ask for it after showing
   the text direction; do not create an arbitrary file.
4. Stop for the user's confirmation of the Figma stills before creating
   animation tracks or rendering a video. State which still or sequence is
   ready for approval. A request to animate a concept does not, by itself,
   approve a visual direction the user has not seen.
5. Once the user approves the stills and asks to proceed, animate that approved
   direction. Carry forward prior approval in the conversation; do not ask
   again for an already approved direction. An explicit instruction to skip
   the preview or approval stage takes precedence.

If the user requests only stills, deliver them without requiring an animation
step. In a non-chat harness, save the text rough beside the stills and expose
it through the available review surface. A request to create or test this skill
is not authorization to modify one of its reference Figma files.

A text preview must express the current concept, not repeat a canned diagram.
For example, a direction about grouping could start like this:

```text
  .  +  .  +           ..      ++
  +  .  +  .     >     ..      ++
  .  +  .  +           ..      ++
```

The useful information is the change from mixed marks to distinct groups.
Boxes, arrows, labels, and motion are choices; use them only when they clarify
this particular idea. The chat sketch approximates composition, not the final
font metrics, color, or timing.

## Use the reference library

Start with [the reference index](references/library.md). Inspect the relevant
PNG images, then read the associated full JSON payload for construction or
motion details. The files are bundled with the skill and can be read offline.
Access to the original Figma file is not a prerequisite.

The JSON files contain complete captured frame subtrees and all captured text
ranges and keyframes, including hidden layers. They are source artifacts, not
snippets. Source URLs provide provenance and optional live inspection. The
capture format and its explicit boundaries are documented in the index.

Extract transferable decisions: character vocabulary, hierarchy, spacing,
contrast, visual continuity, and pacing. Do not copy a reference's product
names, service topology, logos, labels, or technical claims into a new concept
unless they belong to the user's request. Use the user's newer reference when
it overrides these examples. Do not fetch every payload by default.

## Compose the visual

Build a character system that remains readable at the final viewing size.

- Use a monospace font with a stable character advance and explicit line
  height. Preserve these metrics across related stills and animation poses.
  Measure the actual font; a font size is not a character width.
- Use whitespace as geometry. Keep baselines, borders, junctions, and repeated
  objects aligned. Avoid tabs and proportional spacing inside text art.
- Select a small vocabulary of glyphs with distinct visual roles. Plain ASCII
  is the portable base. Unicode arrows or box characters are acceptable when
  the chosen font renders them consistently; do not claim strict ASCII if the
  artwork uses other glyphs.
- Establish clear foreground, supporting structure, and background contrast.
  Reserve accents for meaningful distinctions. The reference palette is one
  style profile, not a mandatory brand palette.
- Make the concept readable before adding detail. Use labels when the subject
  needs them, and keep explanatory prose outside the illustration unless the
  user requests it. Do not force every idea into a terminal or a box-and-arrow
  system.
- Let the composition fit the destination. Preserve text metrics when moving
  elements or making room for captions. Do not silently shrink a related
  composition's type to solve an overlap.

A still must communicate on its own. Select a meaningful state, or show a
spatial comparison if change is the idea. Do not deliver an empty opening
frame merely because it is time zero in a possible animation.

## Make motion explain the idea

After approval, choose a sequence that makes the intended relationship visible.

- Keep recognizable objects stable through changes. A transformation preserves
  identity; a duplication visibly creates another object; a replacement has a
  clear handoff. Do not accidentally imply a different causal relationship.
- Use discrete state changes and held positions for the reference style.
  Character reveals, row reveals, substitution, expansion, travel, and focus
  changes are useful operations. Use actual stepped keyframes, not a smooth
  tween exported at a low frame rate.
- Keep enough of the scene still that the eye knows what to follow. Give
  important states reading time. Use fast steps for travel or assembly and
  longer holds for the meaning. Do not apply one cadence to every action.
- Use color changes and dimming to reinforce a state the geometry already
  expresses. Avoid decorative flicker, glow, and motion that competes with the
  explanation. Keep status labels consistent with the visible action.
- Choose the ending deliberately: a seamless loop, a held final state, or a
  continuation into another shot. Do not add a reset to a narrative sequence
  that needs to finish on its result.
- Treat illustrative counts, speeds, and durations as illustrative. Preserve
  supplied technical facts and ask about missing facts only when they change
  the visual explanation.

For Figma work, read [the Figma workflow](references/figma-workflow.md) for page,
section, and frame naming, editable construction, and verification. For another
requested medium, carry over the same composition and motion principles using
that medium's native tools.

## Deliver and retain the source

Give the user the requested still or animation, its editable frame link, and a
preview they can inspect. Store task-specific scene data and node ownership
receipts beside the output, outside the installed skill.

For stills, verify typography, glyph rendering, clipping, hierarchy, and
spacing at the intended size. For animation, also inspect meaningful phases,
state transitions, and the ending. Report what was actually inspected; a
resting screenshot does not verify timeline playback.
