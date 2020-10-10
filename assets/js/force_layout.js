import lodash from 'lodash'

import { CustomTooltip } from './utils/custom_tooltip.js'

const tooltip = CustomTooltip("node_tooltip", 300)
const NODE_RADIUS = 5

export function forceLayout(dataPromise) {
  dataPromise.then(data => {
    render(data)
  })
}

function render(data) {
  const nodeData = data.filter(row => row.type == "node")
  const linkData = data.filter(row => row.type == "edge")
  transformData(linkData)
  console.log('linkData', linkData);
  console.log('nodeData', nodeData);

  const width = window.svgWidth, height = window.svgHeight

  d3.forceSimulation(nodeData)
    .force('charge', d3.forceManyBody().strength(chargeStrength))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('link', d3.forceLink().links(linkData).id(item => item.id))
    .on('tick', buildTicked(nodeData, linkData));
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
      d.stroke = 'red'
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
    updateNodes(nodeData, linkData)
    updateLinks(linkData)
  }
}

function updateLinks(linkData) {
  var u = d3.select('.links')
    .selectAll('line')
    .data(linkData)

  u.enter()
    .append('line')
    .merge(u)
    .attr('stroke', d => d.stroke)
    .attr('marker-end', 'url(#arrowHead)')
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

function updateNodes(nodeData, linkData) {
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
    .on('mouseover', function (nodeDatum, _i) {
      d3.select(this).attr("r", NODE_RADIUS + 2)

      const targets =
            lodash.reduce(linkData, function(acc, link) {
              if (acc[link.source.id]) {
                acc[link.source.id].push(link.target.id)
              } else {
                acc[link.source.id] = [link.target.id]
              }
              return acc;
            }, {});

      const matched = visit(targets, nodeDatum.id)

      d3.select('svg')
        .selectAll('circle')
        .transition().duration(1000)
        .style('opacity', d => hoverOpacity(matched, d.id))

      d3.select('svg')
        .selectAll('line')
        .transition().duration(1000)
        .style('opacity', d => hoverOpacity(matched, d.source.id))
        .attr('stroke', d => {
          if (d.source.id in matched) {
            return d.stroke
          } else {
            return '#ccc'
          }
        })

      showTooltip(nodeDatum)
    })
    .on('mouseout', function (_nodeDatum, _i) {
      d3.select(this).attr("r", 5)

      d3.select('svg')
        .selectAll('circle')
        .transition().duration(1000)
        .style('opacity', 1)

      d3.select('svg')
        .selectAll('line')
        .transition().duration(1000)
        .style('opacity', 1)
        .attr('stroke', d => d.stroke)

      hideTooltip()
    })

  u.exit().remove()
}

function nodeClass(data) {
  const id = data.id
  if (id.includes('_web')) {
    if (id.includes('_view.ex')) {
      return 'node-type-view'
    } else if (id.includes('_controller.ex')) {
      return 'node-type-controller'
    } else if (id.includes('/live/')) {
      return 'node-type-live'
    } else {
      return ''
    }
  } else {
    return ''
  }
}

function hoverOpacity(visited, id) {
  if (id in visited) {
    return Math.max(1 - visited[id] * 0.1, 0.5)
  } else {
    return 0.1
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
      if (!visited[childNode]) {
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
