import lodash from 'lodash'
import jQuery from 'jquery'

import { CustomTooltip } from './utils/custom_tooltip.js'

import {
  findAllDependencies,
  findCompileDependencies
} from './force_utils.js'

import { showOnlyThisNodeAndCompileDeps } from './node_centric_force_layout.js'

const tooltip = CustomTooltip("node_tooltip", 300)
const NODE_RADIUS = 5
const DEFAULT_NODE_COLOR = 'black'
const HIGHLIGHT_NODE_COLOR = 'red'
const SECONDARY_HIGHLIGHT_NODE_COLOR = '#ffd300'
const DEFAULT_LINE_STROKE = '#ccc'
const TRANSITION_SLOW = 600
const TRANSITION_FAST = 500

const vizSettings = {
  maxLabelsToShow: 10,
  logFilesToCompile: false
}

export function forceLayout(dataPromise) {
  dataPromise.then(data => {
    render(data)
  })
}

function render(data) {
  const nodeData = data.filter(row => row.type == "node")
  const linkData = data.filter(row => row.type == "edge")
  transformData(linkData)
  window.linkData = linkData
  console.log('linkData', linkData);
  console.log('nodeData', nodeData);

  const targets =
        lodash.reduce(linkData, function(acc, link) {
          if (acc[link.source]) {
            acc[link.source].push(link.target)
          } else {
            acc[link.source] = [link.target]
          }
          return acc;
        }, {})

  const targetObjects =
        lodash.reduce(linkData, function (acc, link) {
          const obj = {id: link.target, type: linkType(link.label)}
          if (acc[link.source]) {
            acc[link.source].push(obj)
          } else {
            acc[link.source] = [obj]
          }
          return acc
        }, {})

  // console.log('targets', targets);
  // console.log('targetObjects', targetObjects);

  window.targets = targets
  window.targetObjects = targetObjects

  const width = window.svgWidth, height = window.svgHeight

  const force = d3.forceSimulation(nodeData)
    .force('charge', d3.forceManyBody().strength(chargeStrength))
    .force('center', d3.forceCenter(width * 0.6, height / 2))
    // NOTE:  linkData is transformed by d3 after this point
    .force('link', d3.forceLink().links(linkData).id(item => item.id))

  window.force = force

  force
    .on('tick', buildTicked(nodeData, linkData, force));

  renderInfoBox(nodeData, targets, targetObjects)
}

function renderInfoBox(nodeData, targets, targetObjects) {
  const u = d3.select('.info-box-file-list')
    .selectAll('div')
    .data(nodeData, d => d.id)

  u.enter()
   .append('div')
   .attr('class', 'info-box-item')
   .text(d => d.id)
   .on('mouseover', function (nodeDatum) {
     highlightNodeCompileDeps(nodeDatum.id, targets, targetObjects)
   })
   .on('mouseout', function (_nodeDatum) {
     unShowNodeCompileDeps()
   })

  const $input = jQuery('#info-box-input')
  const $header = jQuery('#info-box-header')

  $input.bind('input', function () {
    const input = $(this).val()
    if (input == '') {
      $header.text('All files:')
    } else {
      $header.text(`Results for "${input}":`)
    }

    const u2 =
          d3.select('.info-box-file-list')
            .selectAll('div')
            .data(nodeData.filter(d => {
              return d.id.indexOf(input) !== -1
            }), d => d.id)

    u2.enter()
      .append('div')
      .text(d => d.id)

    u2.exit().remove()

    d3.select('svg')
      .selectAll('circle')
      .transition().duration(TRANSITION_SLOW)
      .style('opacity', d => {
        if (d.id.indexOf(input) !== -1) {
          return 1
        } else {
          return 0.1
        }
      })
      .style('fill', d => {
        if (input == '') {
          return 'black'
        } else if (d.id.indexOf(input) !== -1) {
          return HIGHLIGHT_NODE_COLOR
        } else {
          return 'black'
        }
      })

    d3.select('svg')
      .selectAll('line')
      .transition().duration(TRANSITION_SLOW)
      .style('opacity', d => {
        if (d.source.id.indexOf(input) !== -1) {
          return 1
        } else {
          return 0.1
        }
      })
      .style('stroke', d => {
        // if (d.target.id.indexOf(input) !== -1 && d.source.id.indexOf(input) !== -1) {
        if (d.source.id.indexOf(input) !== -1) {
          return d.stroke
        } else {
          return DEFAULT_LINE_STROKE
        }
      })
  })
}

function chargeStrength(_data) {
  // NOTE: It might be nice for this to be dependent on the number of connected
  // edges. By giving more strength to nodes that have many edges the clusters
  // will be a little more dispersed and hopefully easier to grok.
  return -30
}

function transformData(linkData) {
  linkData.forEach(d => {
    if (d.label == "(compile)") {
      d.stroke = HIGHLIGHT_NODE_COLOR
    } else if (d.label == "(export)") {
      d.stroke = 'blue'
    } else {
      d.stroke = DEFAULT_LINE_STROKE
    }
  })
}

function showTooltip(data) {
  let content = "<div class=\"inner_tooltip\">"
  content += `<span class=\"file-name\">${data.id}</span><br/>`
  content += "</div>"
  tooltip.showTooltip(content, d3.event)
}

function hideTooltip() {
  tooltip.hideTooltip()
}

function buildTicked(nodeData, linkData, force) {
  return () => {
    updateNodes(nodeData, linkData, force)
    updateLinks(linkData)
  }
}

function updateLinks(linkData) {
  var u = d3.select('.links')
    .selectAll('line')
    .data(linkData)

  u.enter()
    .append('line')
    .attr('stroke', d => d.stroke)
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

function updateNodes(nodeData, linkData, force) {
  var u = d3.select('svg')
    .selectAll('circle')
    .data(nodeData, d => d.id)

  u.enter()
    .append('circle')
    .attr('r', NODE_RADIUS)
    .attr('class', nodeClass)
    .merge(u)
    .attr('cx', function(d) {
      return d.x
    })
    .attr('cy', function(d) {
      return d.y
    })
    .on('mouseover', function (nodeDatum) {
      console.log("Hovered on", nodeDatum.id)
      if (window.vizMode === 'focusNode') {
        showAllDeps(nodeDatum.id, targets, targetObjects)
      } else {
        highlightNodeCompileDeps(nodeDatum.id, targets, targetObjects)
      }

      showTooltip(nodeDatum)
    })
    .on('mouseout', function (_nodeDatum) {
      unShowNodeCompileDeps()

      hideTooltip()
    })
    .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded))
    .on('click', function (nodeDatum) {
      showOnlyThisNodeAndCompileDeps(
        nodeDatum.id,
        force,
        nodeData,
        linkData,
        targetObjects
      )
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

function updateLabels(nodeData) {
  const u = d3.select('svg')
              .selectAll('text.node-label')
              .data(nodeData)

  u.enter()
   .append('text')
   .attr('class', 'node-label pointer-events-none')
   .text(d => d.id)
   .attr('dominant-baseline', 'middle')
   .style('font-size', 9)
   .merge(u)
    .attr('x', d => d.x + 10)
   .attr('y', d => d.y)

  u.exit().remove()
}

function linkType(label) {
  switch(label) {
    case "(compile)": return 'compile'
    case "(export)": return 'export'
    default: return 'runtime'
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

function highlightNodeCompileDeps(id, _targets, targetObjects) {
  const duration = TRANSITION_SLOW
  const transitionName = 'showCompileDeps'
  const compileMatched = findCompileDependencies(targetObjects, id)

  if (vizSettings.logFilesToCompile) {
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
    d3.select('svg')
      .selectAll('circle')

  nodes
    .transition(transitionName).duration(duration)
    .attr('r', d => d.id == id ? NODE_RADIUS + 2 : NODE_RADIUS)
    .style('fill-opacity', d => hoverNodeOpacity(compileMatched, d))
    .style('fill', d => hoverNodeFill(compileMatched, d, id))

  // Fade and desaturate non-compile depedency lines and arrows
  d3.select('svg')
    .selectAll('line')
    .transition(transitionName).duration(duration)
    .style('stroke-opacity', d => hoverOpacityCompile(compileMatched, d))
    .attr('stroke', d => hoverLineStroke(compileMatched, d))
    .attr('class', linkClass)

  const matchedNodeData = nodes
        .data()
        .filter(d => d.id in compileMatched)

  if (matchedNodeData.length <= vizSettings.maxLabelsToShow) {
    // TODO: Always show the main node label
    updateLabels(matchedNodeData)
  }
}

function unShowNodeCompileDeps() {
  // if (window.vizMode === 'focusNode') return
  const duration = TRANSITION_FAST

  // Restore the nodes
  d3.select('svg')
    .selectAll('circle')
    .transition().duration(duration)
    .attr('r', NODE_RADIUS)
    .style('fill', DEFAULT_NODE_COLOR)
    .style('fill-opacity', 1)

  // Restore the lines
  d3.select('svg')
    .selectAll('line')
    .transition().duration(duration)
    .style('stroke-opacity', 1)
    .attr('stroke', d => d.stroke)
    .attr('class', '')

  // Hide labels
  updateLabels([])
}

function showAllDeps(id, targets, _targetObjects) {
  const duration = TRANSITION_SLOW

  const matched = findAllDependencies(targets, id)

  // Fade out non-dependencies
  d3.select('svg')
    .selectAll('circle')
    .transition().duration(duration)
    .attr('r', d => d.id == id ? NODE_RADIUS + 2 : NODE_RADIUS)
    .style('opacity', d => hoverOpacity(matched, d.id))
    .style('fill', d => hoverNodeFill(matched, d, id))

  // Fade and desaturate non-dependency lines and arrows
  d3.select('svg')
    .selectAll('line')
    .transition().duration(duration)
    .style('opacity', d => hoverOpacityCompile(matched, d))
    .attr('stroke', d => hoverLineStroke(matched, d))

  // Show labels for nodes that will cause a recompile
  const matchedLabels = d3.select('svg')
                          .selectAll('text.node-label')
                          .filter(d => d.id in matched)

  if (matchedLabels.size() <= vizSettings.maxLabelsToShow) {
    matchedLabels
      .transition().duration(duration)
      .style('opacity', 1)
  }
}

function hoverNodeFill(matched, d, id) {
  if (d.focused) {
    return HIGHLIGHT_NODE_COLOR
  } else if (d.id == id) {
    return HIGHLIGHT_NODE_COLOR
  } else if (d.id in matched) {
    return SECONDARY_HIGHLIGHT_NODE_COLOR
  } else {
    return DEFAULT_NODE_COLOR
  }
}

function hoverNodeOpacity(matched, d) {
  return d.id in matched ? 1 : 0.1
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

function hoverLineStroke(matched, d) {
  if (d.source.id in matched) {
    return d.stroke === DEFAULT_LINE_STROKE ? 'black' : d.stroke
  } else {
    return DEFAULT_LINE_STROKE
  }
}

// Use breadth-first traversal to build the list of ndoes that are connected
// this this node and their distances/depths
