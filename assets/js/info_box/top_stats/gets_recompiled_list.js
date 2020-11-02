import lodash from 'lodash'

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

    this.renderTopFilesThatGetRecompiled(getsRecompiledMap)
  }

  renderTopFilesThatGetRecompiled(getsRecompiledMap) {
    const allFiles = calculateTopGetRecompiled(getsRecompiledMap)
    const topFiles = allFiles.slice(0, 10)

    const u = d3.select('.highlight-box .gets-recompiled-list')
                .selectAll('div')
                .data(topFiles)

    u.enter()
     .append('div')
     .attr('class', 'inline-item hover-bold')
    // Subtract 1 to not count itself
      .text(d => `${d.count - 1}: ${d.id}`)
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
  }
}

function calculateTopGetRecompiled(getsRecompiledMap) {
  const allFiles = []

  for (const id of Object.keys(getsRecompiledMap)) {
    allFiles.push({id: id, count: getsRecompiledMap[id]})
  }

  return lodash.orderBy(allFiles, ['count'], ['desc'])
}
