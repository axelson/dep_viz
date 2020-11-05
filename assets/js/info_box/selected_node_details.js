import jQuery from 'jquery'
import lodashOrderBy from 'lodash/orderBy'

import { findAllDependencies } from '../force_utils.js'
import { colorFromDepType, renderSelectedNode } from '../utils/render_utils.js'

const $topStats = jQuery('.highlight-box')
const $allFilesContainer = jQuery('.info-box-file-list-container')
const $selectedFileTabHeader = jQuery('.tab-bar .tab[data-name="selected-file"]')

const $ancestorsListContainer = jQuery('.info-box-file-tree .ancestor-container')
const $fileTreeContainer = jQuery('.info-box-file-tree .file-tree-container')
const $dependencyPathContainer = jQuery('.info-box-file-tree .dependency-path-container')

let selectedNodeRendered = false

export class SelectedNodeDetails {
  constructor(targetObjects) {
    this.targetObjects = targetObjects
  }

  initialize(dependenciesMap, causeRecompileMap, nodeForceLayout) {
    this.dependenciesMap = dependenciesMap
    this.causeRecompileMap = causeRecompileMap
    this.nodeForceLayout = nodeForceLayout
  }

  hide() {
    jQuery('.info-box-file-tree').hide()
  }

  infoBoxShowSelectedFilesDependencies(id, hideStatsAndFiles = true) {
    if (hideStatsAndFiles) doHideStatsAndFiles()
    $ancestorsListContainer.hide()
    $fileTreeContainer.show()

    // This should be a call into the TabBar instance
    if (hideStatsAndFiles) {
      $selectedFileTabHeader.show()
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

    const deps = lodashOrderBy(this.targetObjects[id], [typeToOrder], ['desc'])

    this.renderSelectedHeaderForDependencies(id, deps)
    this.renderDirectDependenciesList(id, deps)
  }

  infoBoxShowSelectedFilesAncestors(id, hideStatsAndFiles = true) {
    if (hideStatsAndFiles) doHideStatsAndFiles()
    $ancestorsListContainer.show()
    $fileTreeContainer.hide()

    // This should be a call into the TabBar instance
    if (hideStatsAndFiles) {
      $selectedFileTabHeader.show()
    }
    jQuery('.info-box-file-tree').show()

    // For the current file render the file name
    jQuery('.info-box-file-tree .current-file').text(id)

    const ancestorsList = []
    this.causeRecompileMap[id].forEach(nodeId => {
      if (nodeId !== id) {
        ancestorsList.push(nodeId)
      }
    })

    this.renderSelectedHeaderForAncestors(ancestorsList)
    this.renderAncestors(id, ancestorsList)
  }

  infoBoxShowSelectedDependencyPath(fileList) {
    $ancestorsListContainer.hide()
    $fileTreeContainer.hide()
    $dependencyPathContainer.show()

    this.renderSelectedHeaderForDependencyPath(fileList)
    this.renderDependencyPath(fileList)
  }

  restoreInfoBox() {
    const {viewMode} = window.vizState
    $dependencyPathContainer.hide()
    if (viewMode === 'deps') {
      $ancestorsListContainer.hide()
      $fileTreeContainer.show()
    } else if (viewMode === 'ancestors') {
      $ancestorsListContainer.show()
      $fileTreeContainer.hide()
    }
  }

  renderAncestors(id, ancestorsList) {
    const u = d3.select('.info-box-file-tree .ancestor-list')
                .selectAll('div')
                .data(ancestorsList)

    u.enter()
     .append('div')
     .attr('class', 'inline-item hover-bold')
     .merge(u)
     .text(d => d)
     .on('mouseover', nodeId => {
       this.nodeForceLayout.highlightPathsToFile(nodeId, id)
     })
     .on('mouseout', d => {
       this.nodeForceLayout.reconstructGraph()
     })

    u.exit()
     .remove()
  }

  renderDirectDependenciesList(id, deps) {
    const u = d3.select('.info-box-file-tree .file-tree')
                .selectAll('tr')
                .data(deps)

    const container = u.enter()
                       .append('tr')
                       .attr('class', '')

    const _label =
          container
          .append('td')
          .text(d => {
            switch(d.type) {
              case 'compile': return 'compile'
              case 'export': return 'export '
              case 'runtime': return 'runtime'
            }
          })
          .style('color', d => colorFromDepType(d.type))
          .attr('class', 'm-r-4')
          .style('vertical-align', 'top')

    const file =
          container
          .append('td')

    file.append('div')
        .text(d => d.id)
        .attr('class', 'monospace pointer-events-auto')
        .on('mouseover', d => {
          this.nodeForceLayout.highlightSingleNode(d.id)
        })
        .on('mouseout', _d => {
          this.nodeForceLayout.unHighlightSingleNode()
        })

    const compileContainers = file.filter(d => d.type === 'compile')
    compileContainers.append('div')
                     .attr('class', 'italic')
                     .html(d => {
                       const matched = findAllDependencies(this.targetObjects, d.id)
                       // Show count of files that this compile dependency depends on
                       // This count could be off by one, need to check if id is included
                       const count = Object.keys(matched).filter(fileId => fileId !== id).length
                       // Subtract 1 to not include itself
                       return `this causes a compile dependency on <span class="compile-red">${count - 1}</span> additional files`
                     })
  }

  renderDependencyPath(fileList) {
    const u = d3.select('.info-box-file-tree .dependency-path')
                .selectAll('div')
                .data(fileList)

    u.enter()
     .append('div')
     .merge(u)
     .text(d => d)

    u.exit()
     .remove()
  }

  renderSelectedHeaderForDependencyPath(fileList) {
    if (fileList.length > 0) {
      $dependencyPathContainer.find('.info-line-1').text('Dependency path:')
      $dependencyPathContainer.find('.info-line-2').text('')
    } else {
      $dependencyPathContainer.find('.info-line-1').text('')
      $dependencyPathContainer.find('.info-line-2').text('')
    }
  }

  renderSelectedHeaderForAncestors(ancestorsList) {
    if (ancestorsList.length > 0) {
      $ancestorsListContainer.find('.info-line-1').text('These files have a compile or export dependency on the selected file:')
      $ancestorsListContainer.find('.info-line-2').text('')
    } else {
      $ancestorsListContainer.find('.info-line-1').text('… has no files that depend on it')
      $ancestorsListContainer.find('.info-line-2').text('')
    }

    if (!selectedNodeRendered) {
      renderSelectNodeIndicator()
      selectedNodeRendered = true
    }
  }

  renderSelectedHeaderForDependencies(id, directDependencies) {
    const dependenciesMap = this.dependenciesMap
    const allDependencies = dependenciesMap[id]
    const depsCount = Object.keys(allDependencies).length

    let compileDepCount = 0
    let exportDepCount = 0
    Object.values(allDependencies).forEach(type => {
      if(type === 'compile') compileDepCount++
      if(type === 'export') exportDepCount++
    })

    if (directDependencies.length > 0) {
      $fileTreeContainer.find('.info-line-1').text(`… has ${depsCount - 1} dependencies (${compileDepCount - 1} compile dependencies, ${exportDepCount} export dependencies)`)
      $fileTreeContainer.find('.info-line-2').text('… has a direct dependency on these files:')
    } else {
      $fileTreeContainer.find('.info-line-1').text('… has no dependencies')
      $fileTreeContainer.find('.info-line-2').text('')
    }

    if (!selectedNodeRendered) {
      renderSelectNodeIndicator()
      selectedNodeRendered = true
    }
  }

  // Shows the direct depenencies of the given file id
  unShowFileTree(hideStatsAndFiles = true) {
    this.hide()

    if (hideStatsAndFiles) {
      switch (window.vizState.infoBoxMode) {
        case 'top-stats':
          $topStats.show()
          break

        case 'all-files':
          $allFilesContainer.show()
          break
      }
    }

    const u = d3.select('.info-box-file-tree .file-tree')
                .selectAll('tr')
                .data([])

    u.exit().remove()
  }
}

function doHideStatsAndFiles() {
  switch (window.vizState.infoBoxMode) {
    case 'top-stats':
      $topStats.hide()
      break

    case 'all-files':
      $allFilesContainer.hide()
  }
}

function renderSelectNodeIndicator() {
  const data = [true]

  const g = d3.select('.info-box-file-tree svg.selected-node-indicator')
              .selectAll('.selected-node')
              .data(data)
              .enter()

  renderSelectedNode(g, 10, 10)
}
