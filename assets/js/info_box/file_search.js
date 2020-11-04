import jQuery from 'jquery'

const $emptyMessage = jQuery('.info-box-file-list-empty-message')

export class FileSearch {
  constructor(nodeData) {
    this.nodeData = nodeData
  }

  initialize(nodeForceLayout, causeRecompileList, getsRecompiledList, tabBar) {
    this.nodeForceLayout = nodeForceLayout
    this.causeRecompileList = causeRecompileList
    this.getsRecompiledList = getsRecompiledList
    this.tabBar = tabBar

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
    const u =
          d3.select('.info-box-file-list')
            .selectAll('div')
            .data(this.nodeData.filter(d => {
              return d.id.indexOf(searchText) !== -1
            }), d => d.id)

    u.enter()
     .append('div')
     .attr('class', 'inline-item hover-bold')
     .text(d => d.id)
     .on('mouseover', (nodeDatum) => {
       this.nodeForceLayout.highlightDependenciesOfNode(nodeDatum.id, true)
     })
     .on('mouseout', (_nodeDatum) => {
       this.nodeForceLayout.restoreGraph()
     })

    u.exit()
     .remove()

    if (u.size() === 0) {
      $emptyMessage.show()
    } else {
      $emptyMessage.hide()
    }
  }
}
