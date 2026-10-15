# Reference library

These examples establish the skill's visual language: precise character
geometry, sparse composition, quiet structure, semantic accents, and stepped
changes that explain a concept. Read the bundled images first, then open the
complete payload for the relevant construction or motion. Carry that language
into new subjects and brands. Original Figma access is optional; every image
and JSON file below is in this repository.

## Choose a reference

The examples demonstrate different ways to explain a change with characters.

| Example              | Transferable idea                                                                      | Full source readout                                                | Native PNG                                                        |
| -------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Transformation       | A recognizable object changes internally while its surroundings stay stable.           | [processor.json](figma/processor.json)                             | [processor.png](images/processor.png)                             |
| Parallel activity    | Distinct actions overlap while their routes and identities remain readable.            | [parallel-transformation.json](figma/parallel-transformation.json) | [parallel-transformation.png](images/parallel-transformation.png) |
| State and conflict   | Repeated rows establish a comparison; text and color reveal a different state.         | [state-conflict.json](figma/state-conflict.json)                   | [state-conflict.png](images/state-conflict.png)                   |
| Focus and resolution | A sequence expands one subject, shows a change, and returns to the larger composition. | [state-resolution.json](figma/state-resolution.json)               | [state-resolution.png](images/state-resolution.png)               |

### Transformation

This example uses complete text poses and discrete visibility changes.

![Native resting view of the transformation reference](images/processor.png)

[Original Figma frame](https://www.figma.com/design/LqPL6TBnX15hId7FRjfMOG?node-id=766-35029)

### Parallel activity

This example uses stable typography and position to make overlapping activity
readable. Its labels describe the original subject; do not carry those labels
into an unrelated illustration.

![Native resting view of the parallel activity reference](images/parallel-transformation.png)

[Original Figma frame](https://www.figma.com/design/LqPL6TBnX15hId7FRjfMOG?node-id=818-4909)

### State and conflict

This example uses repeated structures, a restrained accent, and readable state
labels. Its full readout includes hidden instance descendants as well as the
visible composition.

![Native resting view of the state and conflict reference](images/state-conflict.png)

[Original Figma frame](https://www.figma.com/design/LqPL6TBnX15hId7FRjfMOG?node-id=1630-5817)

### Focus and resolution

This example contains stepped focus changes, expansion, substitution, and
restoration. Inspect its keyframes for the sequence; the PNG is a resting
canvas view, not a sampled playback frame.

![Native resting view of the focus and resolution reference](images/state-resolution.png)

[Original Figma frame](https://www.figma.com/design/LqPL6TBnX15hId7FRjfMOG?node-id=1640-2682)

## Reference profile

These observations describe this collection. Use the user's current design
system when it calls for a different font, palette, canvas, or subject.

- The source frames use 1920 × 1080 canvases and a dark `#090a08` background.
- Main art commonly uses Geist Mono Regular at 32px with 40px line height.
  The pose-based examples use approximately 19px character advance. Other
  hierarchy levels have their own metrics; inspect the actual text ranges.
- Quiet gray structure supports brighter content and semantic accents.
  Green and red carry meanings in these source examples. They are not
  mandatory colors for other subjects.
- The captured manual keyframes use HOLD transitions. Some examples swap
  complete poses; others animate persistent layers and clipped reveals.
- Some sequences loop; others finish on a result or continue a prior shot.
  Read the actual timeline rather than inferring a loop from the style.

## Payload format and completeness

Each JSON is a full captured property readout of its selected frame subtree,
not an excerpt of selected poses. It preserves all traversed layers, including
hidden instance descendants, complete text strings, rich text segments,
geometry properties, paint data, manual and resolved animation tracks,
animation styles, and containing timelines. Referenced accessible paint/text
styles and variable definitions are included. `childIds` preserve sibling
order; `parentId` preserves the hierarchy. `FIGMA_MIXED` represents Figma's
mixed-value sentinel without dropping the field.

Each payload records the source file, page, frame, exact source URL, capture
date, property schema, node count, and read errors. The accompanying
[index.json](index.json) records file hashes, image dimensions, and source
identities. Captures in this collection were made on October 15, 2026.

These are Plugin API readouts. The connector did not support `JSON_REST_V1`
export, so they are not presented as REST responses or `.fig` backups. The
format records its boundaries explicitly:

- Instances contain their rendered descendants; external component master
  definitions are not recursively included.
- Native text, vector paths, vector networks, and shape properties are
  retained. Derived glyph outlines (`fillGeometry` and `strokeGeometry`) are
  not duplicated alongside their source text and font properties.
- Font binaries, image binaries referenced by paint hashes, plugin-private
  data, comments, and version history are outside this readout. The supplied
  PNGs preserve the visible reference. Check `imageHashes` and capture errors
  before claiming another capture is independently reconstructable.

The PNGs show the native resting canvas state. They support visual inspection
of typography and composition, not verification of an arbitrary timeline
moment. Use the complete tracks to understand the motion and verify a newly
built animation through actual playback.

## Read or extend the collection

Use local files when the skill is installed. A harness without a checkout can
fetch files from the repository's raw GitHub URLs; use a commit SHA when
reproducibility matters. A live Figma link is useful for provenance or a newer
version, but must not become a required dependency for these references.

To add a reference, use the current Figma use and motion skills, inspect its
source, and run [capture-figma-reference.js](../scripts/capture-figma-reference.js)
through `use_figma`. Append an invocation with the inspected file, page, and
frame IDs and the capture date. This reads the source without changing design
nodes. Preserve the complete result instead of copying a few keyframes into a
summary file. Capture a native screenshot and record what state it represents.

When a response limit prevents transferring the result in one call,
[payload-transfer.js](../scripts/payload-transfer.js) packs it losslessly into
bounded chunks. Supply a standard zlib encoder, such as `pako.deflate`, in the
capture environment. This transport dependency is only needed when collecting
new references; reading the skill requires no JavaScript packages. Save every
chunk, then restore the ordinary JSON with:

```sh
node scripts/assemble-reference.mjs <chunk-directory> <stem> <output.json>
```

The assembler rejects missing chunks, mixed captures, and checksum mismatches.
A changed source during capture requires a new coherent set of chunks. Keep
transport chunks in task output, not in the skill. Add the expanded JSON and
PNG to this collection, update the index, and run:

```sh
node scripts/validate-references.mjs
```

Use snippets in explanatory prose when helpful. Keep the actual reference
artifacts complete and load only the examples relevant to the current task.
