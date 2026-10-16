---
name: ascii-diagrams-with-figma-motion
description: >-
  Create reusable ASCII diagram assets and motion in the bundled references'
  visual language: monospace character geometry, sparse layouts, quiet
  structures, semantic accents, and discrete state changes. Use for concept
  diagrams, charts, trees, timelines, process or system explanations, and
  their stills, storyboards, and animations. Preview in chat, build Figma stills,
  and animate after confirmation. A parent skill owns slide or page layout and
  presentation copy.
license: MIT
metadata:
  author: MildTomato
  version: '1.0.0'
---

# ASCII diagrams with Figma motion

Explain a concept through the specific diagram and motion language captured
in the bundled Figma references. Build precise monospace structures, leave
generous space around them, and make relationships and changes easy to follow.
The subject, product, and brand can change while this visual language stays
recognizable. Stills are complete deliverables. Motion is a separate, approved
next stage.

## Own the diagram asset

Produce the diagram and its internal composition as a reusable asset. A parent
skill or the caller handles the surrounding slide, page, or presentation.

- Include text that identifies objects, routes, values, or states within the
  diagram, such as `queue`, `5 waiting`, or `running`.
- Leave slide titles, section headings, introductory copy, explanatory
  captions, footnotes, branding, and page numbers to the parent skill. Keep
  review explanations and illustrative assumptions in chat or task notes.
  Describing an explanation as being "outside the diagram" does not authorize
  adding it elsewhere inside the exported frame.
- Accept bounds, background, palette, or typography supplied by the caller.
  Otherwise fit a frame around the diagram with breathing room. Use consistent
  bounds across related poses, including the full extent of intended motion.
  A reference's 1920 × 1080 canvas does not imply a slide layout or reserve
  space for a headline and footer.
- Keep the diagram in a self-contained editable container so a parent can
  place it. Return its node ID, dimensions, link, and preview. Page, section,
  and frame names organize the Figma file; do not render them as headings.

## Preserve the reference language

Inspect the relevant bundled PNGs before proposing a direction. Use the full
payloads to understand construction and motion; a still image cannot explain
the sequence. Carry these decisions into new subjects:

- **Character geometry:** Align repeated marks, borders, junctions, and paths
  to a measured monospace grid. Use character-built containers and dashed
  connections where they express containment, routes, or relationships.
- **Sparse composition:** Give each object and its label room. Keep related
  rows or branches aligned so the viewer can compare them immediately.
- **Quiet structure, clear focus:** Subdue supporting borders and paths. Use
  brighter content and restrained accent colors to identify activity or state.
- **Visible explanation:** Show the relationship or change in the diagram
  itself. Labels reinforce the action rather than carrying the whole story.
- **Discrete motion:** Preserve a recognizable structure while characters,
  objects, reveals, or focus change in deliberate steps with reading holds.

The Compute examples use a character-built processing core and a branching
composition. The Runtime examples use repeated rows, state changes, and an
expansion into detail followed by a return to context. Other references use
character plots, shaded areas, nested tree rows, and milestone timelines.
Choose the visual structure that explains the subject; the reference language
does not require every concept to become a network of boxes. Match that
language even when the new subject needs different objects, labels, colors,
or topology. This skill is
for explanatory diagrams in that language, not arbitrary ASCII pictures,
text banners, or unrelated terminal effects.

## Preview, build stills, then animate

Use this workflow when the skill runs in a conversational harness. Honor an
explicit request for a different medium or workflow.

1. Identify what the viewer needs to understand. Choose a visual metaphor that
   preserves that meaning: arrangement, hierarchy, containment, change,
   comparison, flow, density, or another relationship suited to the subject.
2. Show an actual text-art preview **in the chat**, inside a fenced `text`
   block. A description, file link, or promise to preview is not a substitute.
   For a still, show the composition. For an animation, show its meaningful
   poses with short explanations in chat outside the fenced preview. Preserve
   spaces and line breaks. Keep the preview narrow enough to read without
   wrapping.
3. Build editable diagram stills in the intended Figma file. Refine the chat
   rough within the asset bounds, inspect the native rendering, and share
   frame links and images. If the destination is unknown, ask for it after
   showing the text direction; do not create an arbitrary file.
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
For example, a direction about an editorial workflow could start like this:

```text
+-- drafts --+      +-- review --+      +-- ready --+
|  =  =  =   |----->|     =      |----->|    = =    |
+------------+      +------------+      +-----------+
```

Here each `=` represents a document; the spatial order explains progression.
An animation could move one document through the stages while the containers
stay fixed. Choose objects and relationships for the actual request. The chat
sketch approximates composition, not the final font metrics, color, or timing.

## Use the reference library

Start with [the reference index](references/library.md). Inspect the relevant
PNG images, then read the associated full JSON payload for construction or
motion details. The files are bundled with the skill and can be read offline.
Access to the original Figma file is not a prerequisite.

The JSON files contain complete captured container subtrees and all captured
text ranges and keyframes, including hidden layers. They are source artifacts, not
snippets. Source URLs provide provenance and optional live inspection. The
capture format and its explicit boundaries are documented in the index.

Use the references as the default visual direction, including their character
vocabulary, hierarchy, spacing, contrast, visual continuity, and pacing.
Do not copy a reference's product names, service topology, logos, labels, or
technical claims into a new concept unless they belong to the user's request.
Use the user's newer reference when it overrides these examples. Do not fetch
every payload by default.

Some full references include source-slide titles, component documentation,
legends, or technical claims. Preserve those in the source artifacts, but
carry over only the diagram elements relevant to the new task. Axes, units,
data labels, and state labels can belong inside the diagram. Presentation
headings and surrounding explanatory copy still belong to the parent skill.

## Compose the visual

Build a character system that remains readable at the final viewing size.

- Use a monospace font with a stable character advance and explicit line
  height. Preserve these metrics across related stills and animation poses.
  Measure the actual font; a font size is not a character width.
- Use whitespace as geometry. Keep baselines, borders, junctions, and repeated
  objects aligned. Avoid tabs and proportional spacing inside text art.
- Derive each character box from one column count. Match its header, body,
  and footer widths. Center an inline label with equal spaces and equal dash
  runs on both sides; adjust the box width when the label requires it. Use
  consistent dash glyphs and spacing, then reposition attached paths and
  contents if the box changes width.
- Select a small vocabulary of glyphs with distinct visual roles. Plain ASCII
  is the portable base. Unicode arrows or box characters are acceptable when
  the chosen font renders them consistently; do not claim strict ASCII if the
  artwork uses other glyphs.
- Establish clear foreground, supporting structure, and background contrast.
  Reserve accents for meaningful distinctions. Keep the reference's restrained
  contrast hierarchy when adapting its palette to another brand or background.
- Make the concept readable before adding detail. Use concise internal labels
  when the subject needs them. Explain the visual in chat; presentation copy
  belongs to the parent skill. Do not force every idea into a terminal or a
  box-and-arrow system.
- For charts, preserve the supplied values, units, scale, and comparison.
  Align character traces, fills, and labels to that mapping. For trees, keep
  indentation and connector columns consistent across row states. For
  timelines, distinguish ordered milestones from proportional time spacing;
  changing a label alone must not silently imply a different duration.
- Fit the diagram within the supplied bounds or its own content frame.
  Preserve text metrics when moving elements. Do not silently shrink a
  related composition's type to solve an overlap or add surrounding layout.

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
  changes are useful operations. Use actual stepped keyframes for stepped
  motion. Some references combine held character poses with eased chart
  reveals or focus transitions; preserve that distinction when it explains
  the subject. A low export frame rate does not turn a tween into stepped
  animation.
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

Give the user or parent skill the requested diagram still or animation, its
editable container ID and frame link, dimensions, and a preview they can
inspect. Store task-specific scene data and node ownership receipts beside
the output, outside the installed skill.

For stills, verify typography, glyph rendering, clipping, hierarchy, and
spacing at the intended size. Check border widths and symmetric dash runs
around centered labels, comparing the rendered dash lengths and gaps in short
headers and connectors with long borders. Check that rendered text belongs to
the diagram and that no presentation titles or surrounding copy were added.
For animation, also inspect meaningful phases, state transitions, and the
ending. Report what was actually inspected; a resting screenshot does not
verify timeline playback.
