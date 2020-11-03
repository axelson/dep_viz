import lodashReduce from 'lodash/reduce'
import jQuery from 'jquery'
window.jQuery = jQuery

import {TabBar} from './info_box/tab_bar.js'
import {CauseRecompileList} from './info_box/top_stats/cause_recompile_list.js'
import {GetsRecompiledList} from './info_box/top_stats/gets_recompiled_list.js'

import {NodeForceLayout} from './node_force_layout.js'
import {ModeSwitcher} from './mode_switcher.js'
import {SelectedNodeDetails} from './info_box/selected_node_details.js'

import { findPaths } from './force_utils.js'
import { renderGlossary } from './glossary.js'

import {
  COMPILE_LINE_STROKE,
  EXPORT_LINE_STROKE,
  RUNTIME_LINE_STROKE,
} from './constants'

window.vizSettings = {
  maxLabelsToShow: 10,
  logFilesToCompile: false
}
window.vizState = {
  // Either 'all-files', 'top-stats', or 'selected-file'
  infoBoxMode: 'all-files',

  // Mode is either 'deps' or 'ancestors'
  viewMode: 'deps',

  selectedNode: null,
}

const $projectName = jQuery('.info-box .project-name')

// Data
// targetObjects - Map from files to list of file objects w/type that they are depdendencies
// targets - Like targetObjects but just a plain list for each file
// causeRecompileMap - Map from files to list of files that they will cause to recompile
// getsRecompiledMap - Map from files to count of files that will cause the file to get recompile
//   Maybe change this a list also
//
// NOTE: There isn't a good reason that a function would need to take in both
// targets and targetObjects since targets can be derived from targetObjects

export function forceLayout(dataPromise) {
  dataPromise.then(data => {
    const nodeData = data.filter(row => row.type == "node")
    const linkData = data.filter(row => row.type == "edge")
    render(nodeData, linkData, "xref graph")
  })
}

export function render(nodeData, linkData, graphLabel) {
  console.log('graphLabel', graphLabel);
  transformData(linkData)
  window.linkData = linkData
  // console.log('linkData', linkData);
  // console.log('nodeData', nodeData);

  $projectName.text(graphLabel)

  const targets =
        lodashReduce(linkData, function(acc, link) {
          if (acc[link.source]) {
            acc[link.source].push(link.target)
          } else {
            acc[link.source] = [link.target]
          }
          return acc;
        }, {})

  const targetObjects =
        lodashReduce(linkData, function (acc, link) {
          const obj = {id: link.target, type: linkType(link.label)}
          if (acc[link.source]) {
            acc[link.source].push(obj)
          } else {
            acc[link.source] = [obj]
          }
          return acc
        }, {})

  const width = window.svgWidth, height = window.svgHeight

  const nodeForceLayout = new NodeForceLayout(nodeData, linkData, targetObjects, width, height)
  const selectedNodeDetails = new SelectedNodeDetails(targetObjects)
  const modeSwitcher = new ModeSwitcher(width)
  const getsRecompiledList = new GetsRecompiledList()
  const tabBar = new TabBar()

  if (!window.Worker) alert("ERROR: Web Workers not supported")

  const worker = new Worker('js/graph_worker.js')
  worker.postMessage({type: 'init', targetObjects: targetObjects, nodeData: nodeData})
  worker.onmessage = e => {
    nodeForceLayout.initialize(e.data.dependenciesMap, e.data.causeRecompileMap, selectedNodeDetails, tabBar)
    selectedNodeDetails.initialize(e.data.dependenciesMap, nodeForceLayout)
    modeSwitcher.initialize(nodeForceLayout, selectedNodeDetails)
    getsRecompiledList.initialize(e.data.getsRecompiledMap, nodeForceLayout, selectedNodeDetails, modeSwitcher)
    tabBar.initialize(nodeForceLayout, selectedNodeDetails)

    renderHighlightsBox(e.data.causeRecompileMap, nodeForceLayout, modeSwitcher)
    renderTotalFileCount(e.data.getsRecompiledMap)
  }

  // TODO: Remove these and double-check that nothing breaks
  window.targets = targets
  window.targetObjects = targetObjects

  renderInfoBox(nodeData, targets, nodeForceLayout)
  renderGlossary()

  findPaths(targetObjects, 'lib/demo_dep/a.ex', 'lib/demo_dep/b_runtime/c_runtime.ex')
  setTimeout(function() {
    // const id = 'lib/demo_dep/a.ex'
    // showOnlyThisNodeAndCompileDeps(id, force, nodeData, linkData, targetObjects)
    // selectedNodeDetails.infoBoxShowSelectedFilesDependencies(id)
  }, 500)
}

function renderHighlightsBox(causeRecompileMap, nodeForceLayout, modeSwitcher) {
  const causeRecompileList = new CauseRecompileList(causeRecompileMap, nodeForceLayout, modeSwitcher)
  causeRecompileList.initialize()
}

function renderTotalFileCount(getsRecompiledMap) {
  const totalFileCount = Object.keys(getsRecompiledMap).length
  jQuery('.total-files-count').text(totalFileCount)
}

// Most of this should be split out into a new file
function renderInfoBox(nodeData, _targets, nodeForceLayout) {
  const u = d3.select('.info-box-file-list')
    .selectAll('div')
    .data(nodeData, d => d.id)

  u.enter()
   .append('div')
   .attr('class', 'inline-item hover-bold')
   .text(d => d.id)
   .on('mouseover', function (nodeDatum) {
     nodeForceLayout.highlightDependenciesOfNode(nodeDatum.id, true)
   })
   .on('mouseout', function (_nodeDatum) {
     nodeForceLayout.restoreGraph()
   })

  const $input = jQuery('#info-box-input')
  const $header = jQuery('#info-box-header')

  $input.bind('input', function () {
    const input = jQuery(this).val()
    if (input == '') {
      $header.text('All files:')
    } else {
      $header.text(`Results for "${input}":`)
    }

    filterInfoBoxFileList(nodeData, input)
    filterCauseRecompileList(input)
    nodeForceLayout.filterHighlightSearch(input)
  })
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

function transformData(linkData) {
  linkData.forEach(d => {
    if (d.label == "(compile)") {
      d.stroke = COMPILE_LINE_STROKE
      d.dependencyType = 'compile'
    } else if (d.label == "(export)") {
      d.stroke = EXPORT_LINE_STROKE
      d.dependencyType = 'export'
    } else {
      d.stroke = RUNTIME_LINE_STROKE
      d.dependencyType = 'runtime'
    }
  })
}

function linkType(label) {
  switch(label) {
    case "(compile)": return 'compile'
    case "(export)": return 'export'
    default: return 'runtime'
  }
}
