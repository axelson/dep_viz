import lodash, { indexOf } from 'lodash'
import jQuery from 'jquery'

import { CustomTooltip } from './utils/custom_tooltip.js'

const tooltip = CustomTooltip("node_tooltip", 300)
const NODE_RADIUS = 5
const DEFAULT_NODE_COLOR = 'black'
const HIGHLIGHT_NODE_COLOR = 'red'
const SECONDARY_HIGHLIGHT_NODE_COLOR = '#ffd300'
const TRANSITION_SLOW = 600
const TRANSITION_FAST = 500

// const HIGHLIGHT_FORMAT = 'children'
const HIGHLIGHT_FORMAT = 'children-compile'

const vizSettings = {
  maxLabelsToShow: 10
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

  d3.forceSimulation(nodeData)
    .force('charge', d3.forceManyBody().strength(chargeStrength))
    .force('center', d3.forceCenter(width * 0.6, height / 2))
    // NOTE:  linkData is transformed by d3 after this point
    .force('link', d3.forceLink().links(linkData).id(item => item.id))
    .on('tick', buildTicked(nodeData, linkData));

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
     showNodeCompileDeps(nodeDatum.id, targets, targetObjects)
   })
   .on('mouseout', function (nodeDatum) {
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
          return '#ccc'
        }
      })
  })
}

function chargeStrength(_data) {
  // NOTE: It might be nice for this to be dependent on the number of connected
  // edges. By giving more strength to nodes that have many edges the clusters
  // will be a little more dispersed and hopefully easier to grok.
  return -50
}

function transformData(linkData) {
  linkData.forEach(d => {
    if (d.label == "(compile)") {
      d.stroke = HIGHLIGHT_NODE_COLOR
    } else if (d.label == "(export)") {
      d.stroke = 'blue'
    } else {
      d.stroke = '#ccc'
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

function buildTicked(nodeData, linkData) {
  return () => {
    updateNodes(nodeData)
    updateLinks(linkData)
    updateLabels(nodeData)
  }
}

function updateLinks(linkData) {
  var u = d3.select('.links')
    .selectAll('line')
    .data(linkData)

  u.enter()
    .append('line')
    .attr('stroke', d => d.stroke)
    .attr('marker-end', 'url(#arrowHead)')
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

function updateNodes(nodeData) {
  var u = d3.select('svg')
    .selectAll('circle')
    .data(nodeData)

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
      showNodeCompileDeps(nodeDatum.id, targets, targetObjects)

      showTooltip(nodeDatum)
    })
    .on('mouseout', function (_nodeDatum) {
      unShowNodeCompileDeps()

      hideTooltip()
    })

  u.exit().remove()
}

function updateLabels(nodeData) {
  var u = d3.select('svg')
            .selectAll('text.node-label')
            .data(nodeData)

  u.enter()
   .append('text')
   .attr('class', 'node-label pointer-events-none')
   .text(d => d.id)
   .attr('dominant-baseline', 'middle')
   .style('font-size', 9)
   // Labels start hidden and are only shown later (but maybe this isn't the
   // best pattern)
   .style('opacity', 0)

  u
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

function showNodeCompileDeps(id, targets, targetObjects) {
  const duration = TRANSITION_SLOW
  let matched = visit(targets, id)
  const compileMatched = findCompileDependencies(targetObjects, id)

  console.log(`\nTouching any of these file will cause ${id} to recompile:`)
  for (const id of Object.keys(compileMatched)) {
    console.log(id)
  }

  // Fade out non-compile dependencies nodes
  d3.select('svg')
    .selectAll('circle')
    .transition().duration(duration)
    .attr('r', d => d.id == id ? NODE_RADIUS + 2 : NODE_RADIUS)
    .style('opacity', d => hoverOpacityCompile(compileMatched, d))
    .style('fill', d => {
      if (d.id == id) {
        return HIGHLIGHT_NODE_COLOR
      } else if (d.id in compileMatched) {
        return SECONDARY_HIGHLIGHT_NODE_COLOR
      } else {
        return DEFAULT_NODE_COLOR
      }
    })

  // Fade and desaturate non-compile depedency lines and arrows
  d3.select('svg')
    .selectAll('line')
    .transition().duration(duration)
    .style('opacity', d => hoverOpacityCompile(compileMatched, d))
    .attr('stroke', d => hoverStroke(matched, compileMatched, d))

  // Show labels for nodes that will cause a recompile
  const matchedLabels = d3.select('svg')
    .selectAll('text.node-label')
    .filter(d => d.id in compileMatched)

  if (matchedLabels.size() <= vizSettings.maxLabelsToShow) {
    matchedLabels
      .transition().duration(duration)
      .style('opacity', 1)
  }
}

function unShowNodeCompileDeps() {
  const duration = TRANSITION_FAST

  // Restore the nodes
  d3.select('svg')
    .selectAll('circle')
    .transition().duration(duration)
    .attr('r', NODE_RADIUS)
    .style('fill', DEFAULT_NODE_COLOR)
    .style('opacity', 1)

  // Restore the lines
  d3.select('svg')
    .selectAll('line')
    .transition().duration(duration)
    .style('opacity', 1)
    .attr('stroke', d => d.stroke)

  // Hide labels
  d3.select('svg')
    .selectAll('text.node-label')
    .transition().duration(duration)
    .style('opacity', 0)
}

function hoverOpacity(matched, compileMatched, id) {
  if (HIGHLIGHT_FORMAT == 'children-compile') {
    return id in compileMatched ? 1 : 0.1
  } else if (HIGHLIGHT_FORMAT == 'children') {
    return id in matched ? 1 : 0.1
  }
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

function hoverStroke(matched, compileMatched, d) {
  if (HIGHLIGHT_FORMAT == 'children-compile') {
    return d.source.id in compileMatched ? d.stroke : '#ccc'
  } else if (HIGHLIGHT_FORMAT == 'children') {
    return d.source.id in matched ? d.stroke : '#ccc'
  }
}

// Use breadth-first traversal to build the list of ndoes that are connected
// this this node and their distances/depths
function visit(graph, id) {
  let cur = [id]
  let next = []
  const visited = {}
  let depth = 0

  while (cur.length > 0 || next.length > 0) {
    const node = cur.shift()
    visited[node] = depth;

    (graph[node] || []).forEach(childNode => {
      if (!(childNode in visited)) {
        next.push(childNode)
      }
    })

    if (cur.length == 0) {
      cur = next
      next = []
      depth += 1
    }
  }

  return visited
}

function findCompileDependencies(graph, id) {
  return compileDependencies(graph, id, {[id]: true}, false)
}

// Find all the files that will cause this file to recompile
function compileDependencies(graph, id, matched, isCompileDep) {
  // A file that has an export dependency
  // Compilation dependencies are any dependency that is directly a compilation
  // dependency and  any dependency of a compilation dependency
  // Also include export depedency (but not it's children) in this analysis

  if (graph[id]) {
    graph[id].forEach(node => {
      switch (node.type) {
        case 'compile':
          if (!matched[node.id]) {
            matched[node.id] = true
            compileDependencies(graph, node.id, matched, true)
          }
          break

        case 'export':
          if (!matched[node.id]) {
            matched[node.id] = true
          }
          break

        case 'runtime':
          if (isCompileDep && !matched[node.id]) {
            matched[node.id] = true
            compileDependencies(graph, node.id, matched, true)
          }
          break

        default:
          throw `Unhandled node type ${node.type}`
      }
    })
  }

  return matched
}
