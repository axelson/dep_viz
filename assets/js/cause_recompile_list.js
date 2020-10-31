import lodash from 'lodash'

// Manages the list that shows which files in the graph cause the most other
// files to recompile
export class CauseRecompileList {
  constructor(causeRecompileMap, nodeForceLayout) {
    this.causeRecompileMap = causeRecompileMap
    this.nodeForceLayout = nodeForceLayout
    this.allFiles = calculateTopRecompiles(causeRecompileMap)
  }

  initialize() {
    const topFiles = this.allFiles.slice(0, 6)

    // recompile map shows which files the given id cause to recompile
    const u = d3.select('.highlight-box .cause-recompile-list')
                .selectAll('div')
                .data(topFiles)

    u.enter()
     .append('div')
     .attr('class', 'inline-item hover-bold')
     .text(d => `${d.count}: ${d.id}`)
     .merge(u)
     .on('mouseover', (d) => {
       // TODO: This needs to be fixed
       this.nodeForceLayout.highlightFilesThatDependOnSelectedFile(d.id, true)
     })
     .on('mouseout', (_d) => {
       this.nodeForceLayout.unHighlightFilesThisFileCausesToRecompile()
     })
  }

}

function calculateTopRecompiles(causeRecompileMap) {
  const topFiles = []

  for (const id of Object.keys(causeRecompileMap)) {
    topFiles.push({id: id, count: causeRecompileMap[id].length})
  }

  return lodash.sortBy(topFiles, d => d.count).reverse()
}
