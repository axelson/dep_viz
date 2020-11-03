export class FileSearch {
  constructor(nodeData) {
    this.nodeData = nodeData
  }

  initialize(nodeForceLayout) {
    this.nodeForceLayout = nodeForceLayout
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
      } else {
        $header.text(`Results for "${input}":`)
      }

      filterInfoBoxFileList(that.nodeData, input)
      filterCauseRecompileList(input)
      that.nodeForceLayout.filterHighlightSearch(input)
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

function filterCauseRecompileList(input) {
  // I need the source data for all files being recompiled...
  // I should refactor to include a reference better
  // Maybe make this class-based
  const u =
        d3.select('.cause-recompile-list')
          .selectAll('div')
          .filter(d => {
            return d.id.indexOf(input) !== -1
          })

  console.log('u', u);
  console.log('u.size()', u.size());

  u.style('opacity', 0.1)
  u.exit().remove()
}
