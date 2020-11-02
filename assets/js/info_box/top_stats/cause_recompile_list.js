import lodash from 'lodash'

const EXPECTED_VIEW_MODE = 'ancestors'

// Manages the list that shows which files in the graph cause the most other
// files to recompile
export class CauseRecompileList {
  constructor(causeRecompileMap, nodeForceLayout, modeSwitcher) {
    this.causeRecompileMap = causeRecompileMap
    this.nodeForceLayout = nodeForceLayout
    this.modeSwitcher = modeSwitcher
    this.allFiles = calculateTopRecompiles(causeRecompileMap)

    this.modeSwitcherInitialMode = null
  }

  initialize() {
    const topFiles = this.allFiles.slice(0, 10)

    const highestCount = topFiles[0].count
    // https://stackoverflow.com/a/14879700
    const numDigits = Math.log(highestCount) * Math.LOG10E + 1 | 0
    const format = d3.format(`${numDigits}`)

    // recompile map shows which files the given id cause to recompile
    const u = d3.select('.highlight-box .cause-recompile-list')
                .selectAll('div')
                .data(topFiles)

    u.enter()
     .append('div')
     .attr('class', 'inline-item hover-bold pre')
     .text(d => `${format(d.count)}: ${d.id}`)
     .merge(u)
     .on('mouseover', (d) => {
       const viewMode = this.modeSwitcher.getViewMode()

       if (viewMode !== EXPECTED_VIEW_MODE) {
         this.modeSwitcherInitialMode = viewMode
         this.modeSwitcher.toggle()
       }

       this.nodeForceLayout.highlightFilesThatDependOnSelectedFile(d.id, true)
     })
     .on('mouseout', (_d) => {
       if (this.modeSwitcherInitialMode) {
         this.modeSwitcherInitialMode = null
         this.modeSwitcher.toggle()
       }

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
