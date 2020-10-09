import { CustomTooltip } from './utils/custom_tooltip.js'

const tooltip = CustomTooltip("node_tooltip", 300)

export function forceLayout(dataPromise) {
  dataPromise.then(data => {
    render(data)
  })
}

function render(data) {
  const nodeData = data.filter(row => row.type == "node")
  const linkData = data.filter(row => row.type == "edge")

  const width = 1000, height = 1000

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
  }
}

function updateLinks(linkData) {
  var u = d3.select('.links')
    .selectAll('line')
    .data(linkData)

  u.enter()
    .append('line')
    .merge(u)
    .attr('stroke', function (d) {
      if (d.label == "(compile)") {
        return 'red'
      } else {
        return '#ccc'
      }
    })
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
    .attr('r', 5)
    .attr('class', nodeClass)
    .merge(u)
    .attr('cx', function(d) {
      return d.x
    })
    .attr('cy', function(d) {
      return d.y
    })
    .on('mouseover', function (nodeDatum, _i) {
      d3.select(this).attr("r", 7)
      showTooltip(nodeDatum)
    })
    .on('mouseout', function (_nodeDatum, _i) {
      d3.select(this).attr("r", 5)
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
