export function forceLayout(dataPromise) {
  dataPromise.then(data => {
    render(data)
  })
}

function render(data) {
  const nodeData = data.filter(row => row.type == "node")
  const linkData = data.filter(row => row.type == "edge")

  const width = 500, height = 500

  d3.forceSimulation(nodeData)
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('link', d3.forceLink().links(linkData).id(item => item.id))
    .on('tick', buildTicked(nodeData, linkData));
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
    .merge(u)
    .attr('cx', function(d) {
      return d.x
    })
    .attr('cy', function(d) {
      return d.y
    })

  u.exit().remove()
}
