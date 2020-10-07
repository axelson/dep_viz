export function forceLayout(dataPromise) {
  dataPromise.then(data => {
    render(data)
  })
}

function render(data) {
  console.log('data', data);
  const nodes = data.filter(row => row.type == "node")
  const links = data.filter(row => row.type == "edge")
  console.log('nodes', nodes);
  console.log('links', links);

  const width = 500, height = 500

  d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('link', d3.forceLink().links(links).id(item => item.id))
    .on('tick', buildTicked(nodes, links));
}

function buildTicked(nodes, links) {
  return () => {
    updateNodes(nodes)
    updateLinks(links)
  }
}

function updateLinks(links) {
  var u = d3.select('.links')
    .selectAll('line')
    .data(links)

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

function updateNodes(nodes) {
  var u = d3.select('svg')
    .selectAll('circle')
    .data(nodes)

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
