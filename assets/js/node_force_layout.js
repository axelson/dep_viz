import BrowserText from './utils/browser_text.js'

import {
  TRANSITION_SLOW,
  TRANSITION_FAST,
  COMPILATION_DEPENDENCY_COLOR,
  DEFAULT_LINE_STROKE,
  EXPORT_DEPENDENCY_COLOR, RUNTIME_DEPENDENCY_COLOR
} from './constants.js'

import {
  findAllDependencies
} from './force_utils.js'

export const NODE_RADIUS = 5
const HIGHLIGHTED_NODE_RADIUS = 8

const DEFAULT_STROKE_WIDTH = 0.3
const HIGHLIGHTED_STROKE_WIDTH = 1.2

export let DEFAULT_NODE_COLOR = '#777'
const HIGHLIGHT_NODE_COLOR = 'black'

export class NodeForceLayout {
  constructor(nodeData, linkData, width, height) {
    this.nodeData = nodeData
    this.linkData = linkData
    this.width = width
    this.height = height
  }

  initialize(dependenciesMap, causeRecompileMap, selectedNodeDetails) {
    this.dependenciesMap = dependenciesMap
    this.causeRecompileMap = causeRecompileMap

    const width = this.width, height = this.height

    const force =
          d3.forceSimulation(this.nodeData)
            .force('charge', d3.forceManyBody().strength(buildChargeStrength(this.nodeData.length)))
            .force('center', d3.forceCenter(width * 0.6, height / 2))
            .force('link', d3.forceLink().links(this.linkData).id(item => item.id))

  force
      .on('tick', buildTicked(this.nodeData, this.linkData, force, this, selectedNodeDetails));
  }

  highlightDependenciesOfNode(id) {
    if (!this.dependenciesMap) return

    const dependencyTypes = this.dependenciesMap[id]
    const duration = TRANSITION_SLOW

    if (window.vizSettings.logFilesToCompile) {
      console.log(`\nTouching any of these file will cause ${id} to recompile:`)
      for (const id of Object.keys(compileMatched)) {
        console.log(id)
      }
    }

    const linkClass = function(d) {
      return d.source.id === id || d.target.id === id ? 'direction-animate' : ''
    }

    // Fade out non-compile dependencies nodes
    const nodes =
          d3.select('svg.main')
            .select('.nodes')
            .selectAll('circle')

    nodes
      .transition().duration(duration)
      .attr('r', d => d.id == id ? HIGHLIGHTED_NODE_RADIUS : NODE_RADIUS)
      .style('fill-opacity', d => hoverNodeOpacity(dependencyTypes, d))
      .style('fill', d => hoverNodeFillNew(dependencyTypes, d, id))

    // Fade and desaturate non-compile depedency lines and arrows
    d3.select('svg.main')
      .selectAll('line')
      .transition().duration(duration)
      .style('stroke-opacity', d => hoverOpacityCompile(dependencyTypes, d))
      .attr('stroke', d => hoverLineStroke(dependencyTypes, d))
      .attr('stroke-width', d => hoverStrokeWidth(dependencyTypes, d))
      .attr('class', linkClass)

    showMatchingLabels(nodes, dependencyTypes, id)
  }

  unShowNodeCompileDeps() {
    // if (window.vizMode === 'focusNode') return
    this.restoreNodes()
    this.restoreLines()
    this.restoreLabels()
  }

  restoreNodes() {
    d3.select('svg.main')
      .select('.nodes')
      .selectAll('circle')
      .transition().duration(TRANSITION_FAST)
      .attr('r', NODE_RADIUS)
      .style('fill', DEFAULT_NODE_COLOR)
      .style('fill-opacity', 1)
  }

  restoreLines() {
    d3.select('svg.main')
      .selectAll('line')
      .transition().duration(TRANSITION_FAST)
      .style('stroke-opacity', 1)
      .attr('stroke', d => d.stroke)
      .attr('stroke-width', DEFAULT_STROKE_WIDTH)
      .attr('class', '')
  }

  restoreLabels() {
    updateLabels([])
  }

  unHighlightFilesThisFileCausesToRecompile() {
    this.restoreNodes()
    this.restoreLines()
    this.restoreLabels()
  }

  filterHighlightSearch(searchText) {
    d3.select('svg.main')
      .select('.nodes')
      .selectAll('circle')
      .transition().duration(TRANSITION_SLOW)
      .style('fill-opacity', d => {
        if (d.id.indexOf(searchText) !== -1) {
          return 1
        } else {
          return 0.1
        }
      })
      .style('fill', d => {
        if (searchText == '') {
          return 'black'
        } else if (d.id.indexOf(searchText) !== -1) {
          return HIGHLIGHT_NODE_COLOR
        } else {
          return 'black'
        }
      })

    d3.select('svg.main')
      .selectAll('line')
      .transition().duration(TRANSITION_SLOW)
      .style('fill-opacity', d => {
        if (d.source.id.indexOf(searchText) !== -1) {
          return 1
        } else {
          return 0.1
        }
      })
      .style('stroke', d => {
        // if (d.target.id.indexOf(searchText) !== -1 && d.source.id.indexOf(searchText) !== -1) {
        if (d.source.id.indexOf(searchText) !== -1) {
          return d.stroke
        } else {
          return DEFAULT_LINE_STROKE
        }
      })
  }

  highlightFilesThatDependOnSelectedFile(id) {
    const duration = TRANSITION_SLOW
    const causeRecompileMap = this.causeRecompileMap

    if (window.vizSettings.logFilesToCompile) {
      console.log(`\nTouching ${id} will cause these files to be recompiled:`)
      causeRecompileMap[id].forEach(id => {
        console.log(id)
      })
    }

    const matched = {}
    const matchedLinks = {}
    causeRecompileMap[id].forEach(nodeId => {
      matched[nodeId] = true

      // For all compile dependencies of the current node
      const deps = targetObjects[nodeId] || []
      deps.forEach(dep => {
        if (dep.type === 'compile') {
          // Check if `id` is in list of dependencies
          // NOTE: This is not very performant
          const allDeps = findAllDependencies(targetObjects, dep.id)
          if (id in allDeps) {
            matchedLinks[nodeId + ',' + dep.id] = true
          }
        } else if (dep.type === 'export' && dep.id === id) {
          matchedLinks[nodeId + ',' + dep.id] = true
        }
      })
    })

    const nodes =
          d3.select('svg.main')
            .select('.nodes')
            .selectAll('circle')

    // Highlight and fade nodes
    nodes
      .transition().duration(duration)
      .attr('r', d => d.id == id ? HIGHLIGHTED_NODE_RADIUS : NODE_RADIUS)
      .style('fill-opacity', d => hoverOpacity(matched, d.id))
      .style('fill', d => hoverNodeFill(matched, d, id, DEFAULT_NODE_COLOR))

    const strokeOpacity = d => {
      const key = d.source.id + ',' + d.target.id
      return key in matchedLinks ? 1 : 0.1
    }

    const strokeWidth = d => {
      const key = d.source.id + ',' + d.target.id
      return key in matchedLinks ? HIGHLIGHTED_STROKE_WIDTH : DEFAULT_STROKE_WIDTH
    }

    const stroke = d => {
      const key = d.source.id + ',' + d.target.id
      return key in matchedLinks ? d.stroke : DEFAULT_LINE_STROKE
    }

    const className = d => {
      const key = d.source.id + ',' + d.target.id
      return key in matchedLinks ? 'direction-animate' : ''
    }

    // Highlight and fade links
    d3.select('svg.main')
      .selectAll('line')
      .transition().duration(duration)
      .style('stroke-opacity', strokeOpacity)
      .attr('stroke-width', strokeWidth)
      .attr('stroke', stroke)
      .attr('class', className)

    showMatchingLabels(nodes, matched, id)
  }
}

function buildChargeStrength(numNodes) {
  // NOTE: It might be nice for this to be dependent on the number of connected
  // edges. By giving more strength to nodes that have many edges the clusters
  // will be a little more dispersed and hopefully easier to grok.
  if (numNodes > 200) {
    return -20
  } else if (numNodes > 100) {
    return -30
  } else {
    return -40
  }
}

function buildTicked(nodeData, linkData, force, nodeForceLayout, selectedNodeDetails) {
  console.log('nodeData', nodeData);
  return () => {
    updateNodes(nodeData, linkData, force, nodeForceLayout, selectedNodeDetails)
    updateLinks(linkData)
    updateLabelsPos()
  }
}

function updateLinks(linkData) {
  var u = d3.select('.links')
    .selectAll('line')
    .data(linkData)

  u.enter()
    .append('line')
    .attr('stroke', d => d.stroke)
    .attr('stroke-width', DEFAULT_STROKE_WIDTH)
    .merge(u)
    .attr('x1', function(d) {
      return d.source.x
    })
    .attr('y1', function(d) {
      return d.source.y
    })
    .attr('x2', function(d) {
      return d.target.x
    })
    .attr('y2', function(d) {
      return d.target.y
    })

  u.exit().remove()
}

function updateNodes(nodeData, _linkData, force, nodeForceLayout, selectedNodeDetails) {
  var u = d3.select('svg.main')
            .select('.nodes')
            .selectAll('circle')
            .data(nodeData, d => d.id)

  u.enter()
    .append('circle')
    .attr('r', NODE_RADIUS)
    .attr('class', nodeClass)
    .style('fill', DEFAULT_NODE_COLOR)
    .merge(u)
    .attr('cx', function(d) {
      return d.x
    })
    .attr('cy', function(d) {
      return d.y
    })
    .on('mouseover', function (nodeDatum) {
      console.log("Hovered on", nodeDatum.id)
      if (window.vizState.selectedNode !== null) return
      const viewMode = window.vizState.viewMode
      if (viewMode === 'deps') {
        nodeForceLayout.highlightDependenciesOfNode(nodeDatum.id)
        selectedNodeDetails.infoBoxShowSelectedFilesDependencies(nodeDatum.id)
      } else if (viewMode === 'ancestors') {
        nodeForceLayout.highlightFilesThatDependOnSelectedFile(nodeDatum.id)
      }
    })
    .on('mouseout', function (_nodeDatum) {
      if (window.vizState.selectedNode === null) {
        nodeForceLayout.unShowNodeCompileDeps()
        selectedNodeDetails.unShowFileTree()
      }
    })
    .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded))
    .on('click', function (d) {
      console.log('clicked on', d.id)
      if (window.vizState.selectedNode) {
        window.vizState.selectedNode = null
        nodeForceLayout.unShowNodeCompileDeps()
        selectedNodeDetails.unShowFileTree()
      } else {
        window.vizState.selectedNode = d.id
        updateLabels([])
      }
    })

  u.exit().remove()

  function dragStarted(d) {
    if (window.vizMode === 'focusNode') return
    if (!d3.event.active) force.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  function dragged(d) {
    if (window.vizMode === 'focusNode') return
    d.fx = d3.event.x
    d.fy = d3.event.y
  }

  function dragEnded(d) {
    if (window.vizMode === 'focusNode') return
    if (!d3.event.active) force.alphaTarget(0)
    d.fx = null
    d.fy = null
  }
}

function hoverLineStroke(matched, d) {
  if (d.source.id in matched) {
    return d.stroke
  } else {
    return DEFAULT_LINE_STROKE
  }
}

function hoverAnimateStroke(id, d) {
  return d.source.id === id || d.target.id === id ? 'direction-animate' : ''
}

function showMatchingLabels(nodes, matched, id) {
  const matchedNodeData = nodes
        .data()
        .filter(d => d.id in matched)

  if (matchedNodeData.length <= window.vizSettings.maxLabelsToShow) {
    updateLabels(matchedNodeData, id)
  } else {
    updateLabels(matchedNodeData.filter(d => d.id === id), id)
  }
}

function nodeClass(_data) {
  return ''
  // const id = data.id
  // if (id.includes('_web')) {
  //   if (id.includes('_view.ex')) {
  //     return 'node-type-view'
  //   } else if (id.includes('_controller.ex')) {
  //     return 'node-type-controller'
  //   } else if (id.includes('/live/')) {
  //     return 'node-type-live'
  //   } else {
  //     return ''
  //   }
  // } else {
  //   return ''
  // }
}

function updateLabelsPos() {
  const u = d3.select('svg.main')
              .selectAll('text.node-label')

  u
    .attr('x', d => d.x + 10)
    .attr('y', d => d.y)
}

function hoverNodeOpacity(matched, d) {
  return d.id in matched ? 1 : 0.1
}

function hoverStrokeWidth(matched, d) {
  const sourceMatched = d.source.id in matched
  const targetMatched = d.target.id in matched
  // return sourceMatched && targetMatched ? HIGHLIGHTED_STROKE_WIDTH : DEFAULT_STROKE_WIDTH
  if (sourceMatched && targetMatched) {
    // TODO: Extract this to a function
    // Check if the link is a runtime dependency
    if (d.label === '') {
      return DEFAULT_STROKE_WIDTH
    } else {
      return HIGHLIGHTED_STROKE_WIDTH
    }
  } else {
    return DEFAULT_STROKE_WIDTH
  }
}

function highlightAllDeps(id, targets, _targetObjects) {
  const duration = TRANSITION_SLOW

  const matched = findAllDependencies(targets, id)

  // Fade out non-dependencies
  const nodes = d3.select('svg.main')
                  .select('.nodes')
                  .selectAll('circle')

  nodes
    .transition().duration(duration)
    .attr('r', d => d.id == id ? NODE_RADIUS + 2 : NODE_RADIUS)
    .style('fill-opacity', d => hoverOpacity(matched, d.id))
    .style('fill', d => hoverNodeFill(matched, d, id, DEFAULT_NODE_COLOR))

  // Fade and desaturate non-dependency lines and arrows
  d3.select('svg.main')
    .selectAll('line')
    .transition().duration(duration)
    .style('fill-opacity', d => hoverOpacityCompile(matched, d))
    .attr('stroke', d => hoverLineStroke(matched, d))

  const filteredNodes =
        nodes
        .filter(d => d.id in matched)
        .data()

  if (filteredNodes.length <= vizSettings.maxLabelsToShow) {
    updateLabels(filteredNodes, id)
  } else {
    updateLabels(filteredNodes.filter(d => d.id === id), id)
  }
}

function hoverNodeFill(matched, d, id, matchedColor) {
  if (d.focused) {
    return HIGHLIGHT_NODE_COLOR
  } else if (d.id == id) {
    return HIGHLIGHT_NODE_COLOR
  } else if (d.id in matched) {
    return matchedColor
  } else {
    return DEFAULT_NODE_COLOR
  }
}

function hoverNodeFillNew(dependencyTypes, d, id) {
  if (d.focused) {
    return HIGHLIGHT_NODE_COLOR
  } else if (d.id == id) {
    return HIGHLIGHT_NODE_COLOR
  } else if (d.id in dependencyTypes) {
    switch (dependencyTypes[d.id]) {
      case 'compile': return COMPILATION_DEPENDENCY_COLOR
      case 'export': return EXPORT_DEPENDENCY_COLOR
      case 'runtime': return RUNTIME_DEPENDENCY_COLOR
      default: throw `Unhandled node type ${dependencyTypes[d.id]}`
    }
  } else {
    return DEFAULT_NODE_COLOR
  }
}

function hoverOpacity(matched, id) {
  return id in matched ? 1 : 0.1
}

function hoverOpacityCompile(matched, d) {
  if (d.id) {
    // Node
    return d.id in matched ? 1 : 0.1
  } else {
    // Link
    const sourceMatched = d.source.id in matched
    const targetMatched = d.target.id in matched
    return sourceMatched && targetMatched ? 1 : 0.1
  }
}

export function updateLabels(nodeData, primaryId) {
  const fontSize = d => d.id === primaryId ? 13 : 9

  const u = d3.select('svg.main')
              .select('.labels')
              .selectAll('g')
              .data(nodeData)

  const enter = u.enter()

  // Sort the primary node to be displayed last (so that it will be displayed on
  // top of all other nodes and elements)
  const g = enter.append('g')
                 .sort((a, _b) => a.id === primaryId ? 1 : -1)

  // Label Background
  g
    .filter(d => d.id === primaryId)
    .append('rect')
    .attr('width', d => {
      const width = BrowserText.getWidth(d.id, fontSize(d), 'Fira Mono')
      return width + 30
    })
    .attr('height', 25)
    .style('fill', 'white')
    .style('fill-opacity', d => {
      return d.id === primaryId ? 0.9 : 0
    })

  updateLabelBackgroundPos()

  g
   .append('text')
   .attr('class', 'node-label pointer-events-none')
   .text(d => d.id)
   .attr('dominant-baseline', 'middle')
   .style('font-size', fontSize)
   .merge(u)
   .attr('x', d => d.x + 18)
   .attr('y', d => d.y)

  u.exit()
   .attr('opacity', 1)
   .transition().duration(TRANSITION_SLOW)
   .attr('opacity', 0)
   .remove()
}

function updateLabelBackgroundPos() {
  const background = d3.select('svg.main')
                       .select('.labels')
                       .selectAll('rect')

  background
    .attr('x', d => d.x + 10)
    .attr('y', d => d.y - 12)
}
