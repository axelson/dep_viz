export class FileSearch {
  constructor(nodeData) {
    this.nodeData = nodeData
  }

  initialize(nodeForceLayout, causeRecompileList, getsRecompiledList) {
    this.nodeForceLayout = nodeForceLayout
    this.causeRecompileList = causeRecompileList
    this.getsRecompiledList = getsRecompiledList

    this.renderFileList()
  }

  renderFileList() {
    const u = d3.select('.info-box-file-list')
                .selectAll('div')
                .data(this.nodeData, d => d.id)

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

    const $input = jQuery('#info-box-input')
    const $header = jQuery('#info-box-header')

    const that = this
    $input.bind('input', function () {
      const input = jQuery(this).val()
      if (input == '') {
        $header.text('All files:')
        that.nodeForceLayout.restoreGraph()
      } else {
        $header.text(`Search results for "${input}":`)
        that.nodeForceLayout.filterHighlightSearch(input)
      }

      that.causeRecompileList.render(input)
      filterInfoBoxFileList(that.nodeData, input)
    })
  }
}

function filterInfoBoxFileList(nodeData, input) {
  const u =
        d3.select('.info-box-file-list')
          .selectAll('div')
          .data(nodeData.filter(d => {
            return d.id.indexOf(input) !== -1
          }), d => d.id)

  u.enter()
    .append('div')
    .text(d => d.id)

  u.exit().remove()
}
