import lodashOrderBy from 'lodash/orderBy'

const EXPECTED_VIEW_MODE = 'deps'

export class GetsRecompiledList {
  constructor() {
    this.modeSwitcherInitialMode = null
  }

  initialize(getsRecompiledMap, nodeForceLayout, selectedNodeDetails, modeSwitcher) {
    this.getsRecompiledMap = getsRecompiledMap
    this.nodeForceLayout = nodeForceLayout
    this.selectedNodeDetails = selectedNodeDetails
    this.modeSwitcher = modeSwitcher
    this.allFiles = calculateTopGetRecompiled(this.getsRecompiledMap)

    this.render('')
  }

  render(searchText) {
    const topFiles = findMatchingFiles(this.allFiles, searchText)
          .slice(0, 10)

    const highestCount = calculateHighestCount(topFiles)
    // https://stackoverflow.com/a/14879700
    const numDigits = Math.log(highestCount - 1) * Math.LOG10E + 1 | 0
    const format = d3.format(`${numDigits}`)

    const u = d3.select('.highlight-box .gets-recompiled-list')
                .selectAll('div')
                .data(topFiles)

    u.enter()
     .append('div')
     .attr('class', 'inline-item hover-bold pre')
      // Subtract 1 to not count itself
      .text(d => `${format(d.count - 1)}: ${d.id}`)
      .merge(u)
      .on('mouseover', (d) => {
        const viewMode = this.modeSwitcher.getViewMode()

        if (viewMode !== EXPECTED_VIEW_MODE) {
          this.modeSwitcherInitialMode = viewMode
          this.modeSwitcher.toggle()
        }

        this.nodeForceLayout.highlightDependenciesOfNode(d.id, true)
        this.selectedNodeDetails.infoBoxShowSelectedFilesDependencies(d.id, false)
      })
      .on('mouseout', (_d) => {
        if (this.modeSwitcherInitialMode) {
          this.modeSwitcherInitialMode = null
          this.modeSwitcher.toggle()
        }

        this.nodeForceLayout.restoreGraph()
        this.selectedNodeDetails.unShowFileTree(false)
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
  const fileList = allFiles.filter(d => d.count > 1)
  return searchText === '' ? fileList : fileList.filter(d => d.id.indexOf(searchText) !== -1)
}

function calculateTopGetRecompiled(getsRecompiledMap) {
  const allFiles = []

  for (const id of Object.keys(getsRecompiledMap)) {
    allFiles.push({id: id, count: getsRecompiledMap[id]})
  }

  return lodashOrderBy(allFiles, ['count'], ['desc'])
}
