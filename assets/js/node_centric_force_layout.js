import {
  findAllDependencies,
  findCompileDependencies
} from './force_utils.js'

export function showOnlyThisNodeAndCompileDeps(id, originalForce, nodeData, linkData, targetObjects) {
  window.vizMode = 'focusNode'
  console.log('show only this node', id)

  // Stop the original force so that we can create our own force for this view
  originalForce.stop()

  const compileMatched = findCompileDependencies(targetObjects, id)
  const matched = findAllDependencies(targets, id)

  const filteredNodes = nodeData
        .filter(d => d.id in compileMatched)
        .map(d => {
          d['distance'] = matched[d.id]
          return d
        })

  const filteredLinks = linkData.filter(d => {
    const sourceMatched = d.source.id in compileMatched
    const targetMatched = d.target.id in compileMatched
    return sourceMatched && targetMatched
  })

  const promise1 = updateNodes(filteredNodes).end()
  const promise2 = updateLinks(filteredLinks).end()

  Promise.allSettled([promise1, promise2]).then(function () {
    startForceLayout(filteredNodes, filteredLinks)
  })
}

function startForceLayout(filteredNodes, filteredLinks) {
  console.log('starting new force layout')
  const width = window.svgWidth, height = window.svgHeight

  const force = d3.forceSimulation(filteredNodes)
                  .force('charge', d3.forceManyBody().strength(-70))
                  .force('link', d3.forceLink().links(filteredLinks).id(d => d.id).distance(30))
                  .force('x', d3.forceX().x(width * 0.6))
                  .force('y', d3.forceY().y(d => {
                    console.log('d', d);
                    const base = height / 15

                    return base + height / 5 * d.distance
                  }))

  force
    .on('tick', buildTicked(filteredNodes, filteredLinks, force))

  window.force2 = force
}

function buildTicked(filteredNodes, filteredLinks, force) {
  return () => {
    updateNodes(filteredNodes)
    updateLinks(filteredLinks)
    updateLabels(filteredNodes)
  }
}

function updateNodes(filteredNodes) {
  var u = d3.select('svg')
    .selectAll('circle')
    .data(filteredNodes, d => d.id)

  u
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)

  return u.exit()
   .transition().duration(500)
   .style('opacity', 0)
   .remove()
}

function updateLinks(filteredLinks) {
  var u = d3.select('svg')
            .select('.links')
            .selectAll('line')
            .data(filteredLinks)

  u
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y)

  return u.exit()
   .transition().duration(500)
   .style('opacity', 0)
   .remove()
}

function updateLabels(filteredNodes) {
  const u = d3.select('svg')
              .selectAll('text.node-label')
              .data(filteredNodes)

  u
  // TODO: Should try to share this offset logic somehow. Maybe we should strive
  // to have a single updateLabels function
    .attr('x', d => d.x + 10)
    .attr('y', d => d.y)

  u.exit().remove()
}
