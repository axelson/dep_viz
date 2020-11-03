import lodashSortBy from 'lodash/sortBy'

const EXPECTED_VIEW_MODE = 'ancestors'

// Manages the list that shows which files in the graph cause the most other
// files to recompile
export class CauseRecompileList {
  constructor() {
    this.modeSwitcherInitialMode = null
    this.allFiles = null
  }

  initialize(causeRecompileMap, nodeForceLayout, modeSwitcher) {
    this.causeRecompileMap = causeRecompileMap
    this.nodeForceLayout = nodeForceLayout
    this.modeSwitcher = modeSwitcher
    this.allFiles = calculateTopRecompiles(causeRecompileMap)

    this.render('')
  }

  render(searchText) {
    const topFiles = findMatchingFiles(this.allFiles, searchText)
          .slice(0, 10)

    const highestCount = calculateHighestCount(topFiles)
    // https://stackoverflow.com/a/14879700
    const numDigits = Math.log(highestCount - 1) * Math.LOG10E + 1 | 0
    const format = d3.format(`${numDigits}`)

    // recompile map shows which files the given id cause to recompile
    const u = d3.select('.highlight-box .cause-recompile-list')
                .selectAll('div')
                .data(topFiles)

    u.enter()
     .append('div')
     .attr('class', 'inline-item hover-bold pre')
     .text(d => `${format(d.count - 1)}: ${d.id}`)
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

       this.nodeForceLayout.restoreGraph()
     })

    u.exit()
     .remove()
  }
}

function calculateHighestCount(topFiles) {
  if (topFiles.length === 0) {
    return 0
  } else {
    return topFiles[0].count
  }
}

function findMatchingFiles(allFiles, searchText) {
  const fileList = searchText === '' ? allFiles : allFiles.filter(d => d.id.indexOf(searchText) !== -1)
  return fileList.filter(d => d.count > 1)
}

function calculateTopRecompiles(causeRecompileMap) {
  const topFiles = []

  for (const id of Object.keys(causeRecompileMap)) {
    topFiles.push({id: id, count: causeRecompileMap[id].length})
  }

  return lodashSortBy(topFiles, d => d.count).reverse()
}
