// Run through Figma's Plugin API, followed by:
// return await captureFigmaReference({ fileKey, pageId, nodeId, capturedOn });
// Read-only: no design nodes are created, changed, or removed.
async function captureFigmaReference(config) {
  const page = await figma.getNodeByIdAsync(config.pageId)
  if (!page || page.type !== 'PAGE') throw new Error('Reference page not found')
  await figma.setCurrentPageAsync(page)
  const root = await figma.getNodeByIdAsync(config.nodeId ?? config.frameId)
  const containerTypes = ['FRAME', 'SECTION', 'COMPONENT', 'COMPONENT_SET', 'GROUP', 'INSTANCE']
  if (!root || !containerTypes.includes(root.type)) {
    throw new Error('Reference container not found or unsupported')
  }
  let ancestor = root
  while (ancestor && ancestor.type !== 'PAGE') ancestor = ancestor.parent
  if (ancestor?.id !== page.id) throw new Error('Reference belongs to another page')
  if (figma.fileKey && config.fileKey !== figma.fileKey) {
    throw new Error('Reference file key does not match the open file')
  }

  const errors = []
  const variableIds = new Set()
  const styleIds = new Set()
  const imageHashes = new Set()
  const common = [
    'visible',
    'locked',
    'opacity',
    'blendMode',
    'isMask',
    'maskType',
    'x',
    'y',
    'width',
    'height',
    'rotation',
    'relativeTransform',
    'absoluteTransform',
    'absoluteBoundingBox',
    'absoluteRenderBounds',
    'constraints',
    'layoutAlign',
    'layoutGrow',
    'layoutPositioning',
    'layoutSizingHorizontal',
    'layoutSizingVertical',
    'minWidth',
    'maxWidth',
    'minHeight',
    'maxHeight',
    'fills',
    'strokes',
    'fillStyleId',
    'strokeStyleId',
    'strokeWeight',
    'strokeAlign',
    'strokeCap',
    'strokeJoin',
    'dashPattern',
    'strokeMiterLimit',
    'strokeTopWeight',
    'strokeRightWeight',
    'strokeBottomWeight',
    'strokeLeftWeight',
    'effects',
    'effectStyleId',
    'cornerRadius',
    'cornerSmoothing',
    'topLeftRadius',
    'topRightRadius',
    'bottomLeftRadius',
    'bottomRightRadius',
    'boundVariables',
    'explicitVariableModes',
    'resolvedVariableModes',
    'exportSettings',
    'reactions',
    'layoutMode',
    'layoutWrap',
    'primaryAxisSizingMode',
    'counterAxisSizingMode',
    'primaryAxisAlignItems',
    'counterAxisAlignItems',
    'counterAxisAlignContent',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'paddingBottom',
    'itemSpacing',
    'counterAxisSpacing',
    'itemReverseZIndex',
    'strokesIncludedInLayout',
    'clipsContent',
    'layoutGrids',
    'gridStyleId',
    'guides',
    'overflowDirection',
    'numberOfFixedChildren',
    'layoutGrids',
    'vectorPaths',
    'vectorNetwork',
    'arcData',
    'pointCount',
    'innerRadius',
    'booleanOperation',
    'componentPropertyReferences',
  ]
  const textFields = [
    'characters',
    'fontName',
    'fontSize',
    'fontWeight',
    'textCase',
    'textDecoration',
    'letterSpacing',
    'lineHeight',
    'textStyleId',
    'textAlignHorizontal',
    'textAlignVertical',
    'textAutoResize',
    'textTruncation',
    'maxLines',
    'paragraphIndent',
    'paragraphSpacing',
    'listSpacing',
    'hangingPunctuation',
    'hangingList',
    'autoRename',
    'hasMissingFont',
    'hyperlink',
    'openTypeFeatures',
    'leadingTrim',
  ]
  const segmentFields = [
    'fontName',
    'fontSize',
    'fontWeight',
    'textDecoration',
    'textCase',
    'lineHeight',
    'letterSpacing',
    'fills',
    'textStyleId',
    'fillStyleId',
    'listOptions',
    'listSpacing',
    'indentation',
    'paragraphIndent',
    'paragraphSpacing',
    'hyperlink',
    'openTypeFeatures',
    'boundVariables',
  ]
  function clone(value) {
    if (value === figma.mixed) return { type: 'FIGMA_MIXED' }
    if (value === undefined) return undefined
    return JSON.parse(
      JSON.stringify(value, (key, item) => (item === figma.mixed ? { type: 'FIGMA_MIXED' } : item))
    )
  }
  function inspectReferences(value, key = '') {
    if (!value || typeof value !== 'object') {
      if (/StyleId$/.test(key) && typeof value === 'string' && value) styleIds.add(value)
      return
    }
    if (value.type === 'VARIABLE_ALIAS') variableIds.add(value.id)
    if (value.type === 'IMAGE' && value.imageHash) imageHashes.add(value.imageHash)
    for (const [k, v] of Object.entries(value)) inspectReferences(v, k)
  }
  function properties(object, fields, id) {
    const out = {}
    for (const field of new Set(fields)) {
      if (!(field in object)) continue
      try {
        const value = clone(object[field])
        if (value !== undefined) out[field] = value
      } catch (error) {
        errors.push({ id, field, message: String(error) })
      }
    }
    inspectReferences(out)
    return out
  }
  const nodes = []
  function visit(node) {
    const children = 'children' in node ? [...node.children] : []
    const item = {
      id: node.id,
      name: node.name,
      type: node.type,
      parentId: node.parent?.id ?? null,
      childIds: children.map((child) => child.id),
      properties: properties(node, common, node.id),
      motion: Object.fromEntries(
        ['manualKeyframeTracks', 'animations', 'animationStyles', 'timelines']
          .filter((field) => field in node)
          .map((field) => [field, clone(node[field])])
      ),
    }
    if (node.type === 'TEXT') {
      item.text = properties(node, textFields, node.id)
      item.text.segments = clone(node.getStyledTextSegments(segmentFields))
      inspectReferences(item.text)
    }
    if (node.type === 'INSTANCE') {
      item.instance = properties(node, ['componentProperties', 'overrides'], node.id)
    }
    if (
      node.type === 'COMPONENT_SET' ||
      (node.type === 'COMPONENT' && node.parent?.type !== 'COMPONENT_SET')
    ) {
      item.component = properties(node, ['componentPropertyDefinitions'], node.id)
    }
    inspectReferences(item.motion)
    nodes.push(item)
    for (const child of children) visit(child)
  }
  const previousSkip = figma.skipInvisibleInstanceChildren
  figma.skipInvisibleInstanceChildren = false
  try {
    visit(root)
  } finally {
    figma.skipInvisibleInstanceChildren = previousSkip
  }

  const styles = []
  const seenStyles = new Set()
  for (const id of styleIds) {
    if (seenStyles.has(id)) continue
    seenStyles.add(id)
    const style = await figma.getStyleByIdAsync(id)
    if (!style) {
      errors.push({ id, field: 'style', message: 'Style unavailable' })
      continue
    }
    const styleFields = ['id', 'name', 'type', 'key', 'description', 'remote', 'boundVariables']
    if (style.type === 'PAINT') styleFields.push('paints')
    if (style.type === 'TEXT') styleFields.push(...textFields.filter((f) => f !== 'characters'))
    if (style.type === 'EFFECT') styleFields.push('effects')
    if (style.type === 'GRID') styleFields.push('layoutGrids')
    styles.push(properties(style, styleFields, id))
  }
  const variables = []
  const collections = []
  const collectionIds = new Set()
  const seenVariables = new Set()
  for (const id of variableIds) {
    if (seenVariables.has(id)) continue
    seenVariables.add(id)
    const variable = await figma.variables.getVariableByIdAsync(id)
    if (!variable) {
      errors.push({ id, field: 'variable', message: 'Variable unavailable' })
      continue
    }
    const data = properties(
      variable,
      [
        'id',
        'name',
        'key',
        'description',
        'resolvedType',
        'valuesByMode',
        'variableCollectionId',
        'scopes',
        'codeSyntax',
        'remote',
        'hiddenFromPublishing',
      ],
      id
    )
    variables.push(data)
    collectionIds.add(variable.variableCollectionId)
  }
  for (const id of collectionIds) {
    const collection = await figma.variables.getVariableCollectionByIdAsync(id)
    if (!collection) {
      errors.push({ id, field: 'collection', message: 'Collection unavailable' })
      continue
    }
    collections.push(
      properties(
        collection,
        ['id', 'name', 'key', 'modes', 'defaultModeId', 'remote', 'hiddenFromPublishing'],
        id
      )
    )
  }
  return {
    schemaVersion: 2,
    source: {
      fileKey: config.fileKey,
      fileName: figma.root.name,
      pageId: page.id,
      pageName: page.name,
      nodeId: root.id,
      nodeName: root.name,
      nodeType: root.type,
      url: `https://www.figma.com/design/${config.fileKey}?node-id=${root.id.replace(':', '-')}`,
      capturedOn: config.capturedOn,
    },
    capture: {
      method: 'Figma Plugin API recursive property readout',
      scope:
        'Entire selected container subtree, including hidden layers, all text, style ranges, and motion keyframes',
      nodeCount: nodes.length,
      textNodeCount: nodes.filter((n) => n.type === 'TEXT').length,
      truncated: false,
      propertySchema: { common: [...new Set(common)], textFields, segmentFields },
      limitations: [
        'JSON_REST_V1 export is unavailable in this MCP context; this is a documented Plugin API readout, not a REST response or .fig backup.',
        'External component master definitions are not recursively exported; all instance descendants are included as rendered nodes.',
        'Binary image assets, fonts, plugin-private data, comments, and version history are not embedded.',
        'Derived fillGeometry/strokeGeometry are excluded; native text, vector paths, vector networks, and shape properties are retained.',
      ],
      errors,
    },
    nodes,
    styles,
    variables,
    collections,
    imageHashes: [...imageHashes],
  }
}
