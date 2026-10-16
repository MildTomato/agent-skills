# Figma workflow

Create editable diagram assets and native animation in the user's destination
file. A parent skill owns slide or page layout and presentation copy. Reference
files are sources to study. Their IDs are not write targets.

## Organize the file

Inspect the file before creating anything. Reuse an established page and naming
scheme when one exists. Otherwise use the following convention consistently.
These are editor organization names; do not add them as text in the artwork.

| Level                     | Convention                                              | Example                                   |
| ------------------------- | ------------------------------------------------------- | ----------------------------------------- |
| Page                      | Human-readable concept family or series                 | `Search`                                  |
| Section for directions    | `<Concept> / Explorations` when alternatives are useful | `Indexing / Explorations`                 |
| Section for stills        | `<Concept> / Stills`                                    | `Indexing / Stills`                       |
| Section for animation     | `<Concept> / Animations`                                | `Indexing / Animations`                   |
| Frame stem                | `<concept-slug>/<sequence>-<beat-slug>`                 | `indexing/01-group-records`               |
| Still frame               | `<stem>/still`                                          | `indexing/01-group-records/still`         |
| Narrative animation frame | `<stem>/animation-<duration>s`                          | `indexing/01-group-records/animation-12s` |
| Loop frame                | `<stem>/loop-<duration>s`                               | `indexing/01-group-records/loop-12s`      |

A concept page can hold several related sections. Do not create a page for
every revision. Use actual Figma `SECTION` nodes, not frames styled to look
like sections. Place frames inside their matching section. Create an
Explorations section only when it has a purpose. Create the Animations section
when animation work is authorized; approved stills remain available for review.

Keep a still and its animation under the same stem. Use zero-padded sequence
numbers for reading order and concrete beat names. If several stills form a
storyboard, give each beat its own sequence number. Distinguish alternate
compositions with meaningful names, not `final-final`, `copy`, or opaque IDs.
An existing project prefix can precede the stem; do not impose one brand's
prefix on another file.

Name internal layers by role, such as `structure / boundary`, `focus / item`,
`label / status`, or `pose / 04-grouped`. Use the same frame stem for exported
files, replacing slashes with hyphens. Update a duration suffix when the actual
timeline changes. Do not rename unrelated artwork to enforce this convention.

## Inspect and build stills

Load the available Figma use skill before invoking `use_figma`; load its motion
skill when reading or authoring animation. Use the current tool schemas and
API documentation. Load the create-file skill if a new file is requested, or
the component skill if building a reusable component library is in scope.

Record the target file, page, section, asset bounds, and existing font metrics
before writing. Use caller-supplied bounds when available; otherwise fit the
diagram with breathing room, using shared bounds for related poses and motion.
Do not infer slide dimensions or title and footer areas from the references.
A page-level source link is a starting point for finding references, not a
request to dump or modify the entire file.

Show the actual text rough in chat before the native still. Use editable text
for the art, with native groups or frames for composition. Reuse an existing
component when actual product UI belongs in the scene. Do not rebuild that UI
as a loose approximation or rasterize the whole illustration for convenience.

Load the actual fonts before editing text. Preserve font size, line height,
character advance, and rich text ranges. Verify that all chosen glyphs exist.
Generate each box's text rows from a shared column count. For a centered inline
label, balance the spaces and dash runs on both sides; choose a compatible box
width rather than adding an unmatched dash. Verify the native glyph spacing
as well as the character counts. Short dash runs can render differently from
long ones because of text shaping. If that happens, disable the relevant font
substitution when supported, or place individual border glyphs as native text
on the measured character grid. Keep them editable and use the same glyph and
font metrics throughout; do not compensate with mixed dash characters.
Use auto-layout for related labels or rows; use explicit character-grid
placement where the illustration requires it. Keep the diagram in its own
editable container. Include object and state labels needed by the diagram.
Leave presentation titles, captions, and other surrounding copy to the parent
skill. Preserve any caller-owned copy outside the diagram's container.

Find free space inside the intended section. Enlarge a section only as needed
and account for its neighbors. Return all created or changed node IDs and save
them in a task-local receipt. Verify the still with a native screenshot and
share its exact frame URL, container ID, and dimensions. Verify that the export
contains only the diagram asset. This is the user's approval checkpoint.

## Animate the approved direction

Proceed after confirmation of the stills and authorization to animate. Prior
approval in the conversation remains valid. Preserve the approved stills and
create or update the corresponding frame in the Animations section.

Choose the representation that fits the illustration:

- **Complete text poses:** Useful when the character composition changes
  substantially. Swap pose visibility with HOLD keyframes. Keep exactly one
  pose visible for each intended interval, including the first frame and seam.
- **Persistent objects:** Useful when the same objects move, reveal, expand, or
  change state. Animate descendants with HOLD transforms, opacity, or clipped
  dimensions for stepped motion. Keep glyphs readable. When adapting a chart
  or focus transition that uses easing, preserve its intended continuous
  reveal alongside the held character states.
- **Combined construction:** Keep the static structure persistent and swap or
  move only the changing text. Do not duplicate the whole scene if that makes
  a simple edit harder to maintain.

Use times in seconds and public property names from the installed API. Keep
animation on descendants of the timeline-owning frame. A low video frame rate
does not create stepped motion. Do not shorten an existing timeline or reset
its ending unless the requested revision calls for that change.

For updates, use saved ownership IDs and inspect the live target. A matching
name is not enough to justify replacing a frame or deleting its children.
Follow the tool's retry guidance after errors. If native motion is unavailable,
keep the stills and report the limitation rather than simulating success.

## Verify the deliverable

A Figma screenshot shows the resting canvas state. It can verify composition,
but it cannot establish the appearance at an arbitrary timeline timestamp.

After a meaningful motion change, export a small diagnostic video from the
frame that owns the timeline and inspect representative phases, including the
ending. Reuse that render for every needed frame sample. Increase resolution
when text requires it. Export the requested delivery format and resolution
once the motion passes review.

Check visibility, clipping, baseline alignment, readable text, intended overlap,
causality, and the loop seam or final hold. Related shots must preserve their
handoff composition when a continuous sequence is intended. Retain the scene
settings, frame IDs, approved still links, and render receipt with the output.
