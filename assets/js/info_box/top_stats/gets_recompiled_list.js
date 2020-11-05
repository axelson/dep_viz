import jQuery from 'jquery'
import lodashOrderBy from 'lodash/orderBy'

const EXPECTED_VIEW_MODE = 'deps'
const $emptyMessage = jQuery('.gets-recompiled-list-empty-message')

export class GetsRecompiledList {
  constructor() {
    this.modeSwitcherInitialMode = null
  }

  initialize(dependenciesMap, nodeForceLayout, selectedNodeDetails, modeSwitcher, tabBar) {
    this.dependenciesMap = dependenciesMap
    this.nodeForceLayout = nodeForceLayout
    this.selectedNodeDetails = selectedNodeDetails
    this.modeSwitcher = modeSwitcher
    this.tabBar = tabBar

    this.allFiles = calculateTopGetRecompiled(this.dependenciesMap)

    this.render('')
  }

  calculateTopFiles(searchText) {
    return findMatchingFiles(this.allFiles, searchText)
      .slice(0, 10)
  }

  getTopFiles() {
    return d3.select('.highlight-box .gets-recompiled-list')
             .selectAll('div')
             .data()
  }

  render(searchText) {
    const topFiles = this.calculateTopFiles(searchText)

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
      .merge(u)
      // Subtract 1 to not count itself
      .text(d => `${format(d.count - 1)}: ${d.id}`)
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
        if (window.vizState.selectedNode) {
        } else {
          if (this.modeSwitcherInitialMode) {
            this.modeSwitcherInitialMode = null
            this.modeSwitcher.toggle()
          }

          this.nodeForceLayout.tabBar.highlightTopStats()
          this.selectedNodeDetails.unShowFileTree(false)
        }
      })
      .on('click', d => {
        if (window.vizState.selectedNode) {
          window.vizState.selectedNode = null
          this.nodeForceLayout.restoreGraph()
        } else {
          window.vizState.selectedNode = d.id

          const viewMode = window.vizState.viewMode
          if (viewMode === 'deps') {
            this.selectedNodeDetails.infoBoxShowSelectedFilesDependencies(d.id)
            this.tabBar.switchTab('selected-file')
          } else if (viewMode === 'ancestors') {
            this.selectedNodeDetails.infoBoxShowSelectedFilesAncestors(d.id)
            this.tabBar.switchTab('selected-file')
          }
        }
      })

    u.exit()
     .remove()

    if (topFiles.length == 0) {
      $emptyMessage.show()
    } else {
      $emptyMessage.hide()
    }
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

function calculateTopGetRecompiled(dependenciesMap) {
  const allFiles = []
  for (const [file, deps] of Object.entries(dependenciesMap)) {
    let count = 0
    for (const [_depFile, depType] of Object.entries(deps)) {
      if (depType === 'compile' || depType === 'export') {
        count += 1
      }
    }
    allFiles.push({id: file, count: count})
  }

  return lodashOrderBy(allFiles, ['count'], ['desc'])
}
