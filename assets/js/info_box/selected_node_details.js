import jQuery from 'jquery'
import lodash from 'lodash'

import {
  COMPILE_LINE_STROKE,
  EXPORT_LINE_STROKE
} from '../constants.js'

import {
  DEFAULT_NODE_COLOR
} from '../node_force_layout.js'

import { findAllDependencies } from '../force_utils.js'

const $topStats = jQuery('.highlight-box')
const $allFilesContainer = jQuery('.info-box-file-list-container')

// Shows the direct depenencies of the given file id
export function infoBoxShowSelectedFilesDependencies(id, targetObjects) {
  switch (window.vizState.infoBoxMode) {
    case 'stats':
      $topStats.hide()
      break

    case 'all-files':
      $allFilesContainer.hide()
  }

  jQuery('.info-box-file-tree').show()

  // For the current file render the file name
  jQuery('.info-box-file-tree .current-file').text(id)

  // underneath it render the name of each file it depends on and how it depends on it
  // Sort by compile, then export, then runtime

  const typeToOrder = d => {
    switch(d.type) {
      case 'compile': return 2
      case 'export': return 1
      case 'runtime': return 0
    }
  }

  const deps = lodash.orderBy(targetObjects[id], [typeToOrder], ['desc'])

  const u = d3.select('.info-box-file-tree .file-tree')
              .selectAll('div')
              .data(deps)

  const container = u.enter()
                     .append('div')
                     .attr('class', 'm-l-4')

  const _label =
        container
        .append('span')
        .text(d => {
          switch(d.type) {
            case 'compile': return 'compile: '
            case 'export': return 'export : '
            case 'runtime': return 'runtime: '
          }
        })
        .style('color', d => {
          switch(d.type) {
            case 'compile': return COMPILE_LINE_STROKE
            case 'export': return EXPORT_LINE_STROKE
            case 'runtime': return DEFAULT_NODE_COLOR
          }
        })

  const _file =
        container
        .append('span')
        .text(d => {
          switch (d.type) {
            case 'compile': {
              // TODO: Have this be precomputed in the worker
              const matched = findAllDependencies(targetObjects, d.id)
              // Show count of files that this compile dependency depends on
              const count = Object.keys(matched).length
              // Subtract 1 to not include itself
              return `${d.id} (${count - 1})`
            }

            case 'export':
              return d.id

            case 'runtime':
              return d.id
          }
        })
}

export function unShowFileTree() {
  jQuery('.info-box-file-tree').hide()
  switch (window.vizState.infoBoxMode) {
    case 'stats':
      $topStats.show()
      break

    case 'all-files':
      $allFilesContainer.show()
      break
  }

  const u = d3.select('.info-box-file-tree .file-tree')
              .selectAll('div')
              .data([])

  u.exit().remove()
}
