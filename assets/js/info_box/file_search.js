import jQuery from 'jquery'
import lodashSortBy from 'lodash/sortBy'

const $emptyMessage = jQuery('.info-box-file-list-empty-message')

export class FileSearch {
  constructor(nodeData) {
    this.nodeData = nodeData
  }

  initialize(nodeForceLayout, causeRecompileList, getsRecompiledList, tabBar, selectedNodeDetails) {
    this.nodeForceLayout = nodeForceLayout
    this.causeRecompileList = causeRecompileList
    this.getsRecompiledList = getsRecompiledList
    this.tabBar = tabBar
    this.selectedNodeDetails = selectedNodeDetails

    const $input = jQuery('#info-box-input')
    const $header = jQuery('#info-box-header')

    const that = this
    $input.bind('input', function () {
      const input = jQuery(this).val()

      that.causeRecompileList.render(input)
      that.getsRecompiledList.render(input)

      if (input == '') {
        $header.text('All files:')
        if (window.vizState.infoBoxMode === 'all-files') {
          that.nodeForceLayout.restoreGraph()
        } else if (window.vizState.infoBoxMode === 'top-stats') {
          tabBar.highlightTopStats()
        }
      } else {
        $header.text(`Search results for "${input}":`)
        if (window.vizState.infoBoxMode === 'all-files') {
          that.nodeForceLayout.filterHighlightSearch(input)
        } else if (window.vizState.infoBoxMode === 'top-stats') {
          tabBar.highlightTopStats()
        }
      }

      that.render(input)
    })

    this.render('')
  }

  render(searchText) {
    const dataUnsorted =
          this.nodeData.filter(d => {
            return d.id.indexOf(searchText) !== -1
          })

    const data = lodashSortBy(dataUnsorted, 'id')

    const u =
          d3.select('.info-box-file-list')
            .selectAll('div')
            .data(data, d => d.id)

    u.enter()
     .append('div')
     .attr('class', 'inline-item hover-bold')
     .text(d => d.id)
     .on('mouseover', d => {
       this.nodeForceLayout.highlightDependenciesOfNode(d.id, true)
     })
     .on('mouseout', _d => {
       this.nodeForceLayout.restoreGraph()
     })
     .on('click', d => {
       window.vizState.selectedNode = d.id

       const viewMode = window.vizState.viewMode
       // TODO: This logic is now replicated in three places, should be centralized somewhere
       // maybe in the tab bar. And maybe in a new InfoBox class
       if (viewMode === 'deps') {
         this.selectedNodeDetails.infoBoxShowSelectedFilesDependencies(d.id)
         this.tabBar.switchTab('selected-file')
       } else {
         this.selectedNodeDetails.infoBoxShowSelectedFilesAncestors(d.id)
         this.tabBar.switchTab('selected-file')
       }
     })

    u.exit()
     .remove()

    if (u.enter().merge(u).size() === 0) {
      $emptyMessage.show()
    } else {
      $emptyMessage.hide()
    }
  }
}
