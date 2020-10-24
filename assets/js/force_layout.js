import lodash from 'lodash'
import jQuery from 'jquery'
window.jQuery = jQuery

import {
  findAllDependencies,
  findCompileDependencies
} from './force_utils.js'

import BrowserText from './browser_text.js'

const NODE_RADIUS = 5
const HIGHLIGHTED_NODE_RADIUS = 8
let DEFAULT_NODE_COLOR = 'black'
const HIGHLIGHT_NODE_COLOR = '#ffd300'
const GETS_RECOMPILED_NODE_COLOR = 'red'
const CAUSES_RECOMPILE_NODE_COLOR = '#da4bfa'

const DEFAULT_LINE_STROKE = '#ccc'
const COMPILE_LINE_STROKE = 'red'
let EXPORT_LINE_STROKE = '#3a79ff'

const TRANSITION_SLOW = 600
const TRANSITION_FAST = 500

const $allFilesContainer = jQuery('.info-box-file-list-container')
const $topStats = jQuery('.highlight-box')

if (jQuery('body.dark-mode').length > 0) {
  DEFAULT_NODE_COLOR = 'white'
  EXPORT_LINE_STROKE = '#a1bfff'
}

const vizSettings = {
  maxLabelsToShow: 10,
  logFilesToCompile: false
}
const vizState = {
  infoBoxMode: 'stats'
}

// Data
// targetObjects - Map from files to list of file objects w/type that they are depdendencies
// targets - Like targetObjects but just a plain list for each file
// causeRecompileMap - Map from files to list of files that they will cause to recompile
// getsRecompiledMap - Map from files to count of files that will cause the file to get recompile
//   Maybe change this a list also
//
// NOTE: There isn't a good reason that a function would need to take in both
// targets and targetObjects since targets can be derived from targetObjects

initGlossary()

export function forceLayout(dataPromise) {
  dataPromise.then(data => {
    render(data)
  })
}

function render(data) {
  const nodeData = data.filter(row => row.type == "node")
  const linkData = data.filter(row => row.type == "edge")
  transformData(linkData)
  window.linkData = linkData
  // console.log('linkData', linkData);
  // console.log('nodeData', nodeData);

  const targets =
        lodash.reduce(linkData, function(acc, link) {
          if (acc[link.source]) {
            acc[link.source].push(link.target)
          } else {
            acc[link.source] = [link.target]
          }
          return acc;
        }, {})

  const targetObjects =
        lodash.reduce(linkData, function (acc, link) {
          const obj = {id: link.target, type: linkType(link.label)}
          if (acc[link.source]) {
            acc[link.source].push(obj)
          } else {
            acc[link.source] = [obj]
          }
          return acc
        }, {})

  if (!window.Worker) alert("ERROR: Web Workers not supported")

  const worker = new Worker('js/graph_worker.js')
  worker.postMessage({type: 'init', targetObjects: targetObjects, nodeData: nodeData})
  worker.onmessage = e => {
    renderHighlightsBox(e.data.causeRecompileMap)
    renderTopFilesThatGetRecompiled(e.data.getsRecompiledMap, targetObjects)
    renderTotalFileCount(e.data.getsRecompiledMap)
  }

  // TODO: Remove these and double-check that nothing breaks
  window.targets = targets
  window.targetObjects = targetObjects

  const width = window.svgWidth, height = window.svgHeight

  const force = d3.forceSimulation(nodeData)
    .force('charge', d3.forceManyBody().strength(chargeStrength))
    .force('center', d3.forceCenter(width * 0.6, height / 2))
    // NOTE:  linkData is transformed by d3 after this point
    .force('link', d3.forceLink().links(linkData).id(item => item.id))

  window.force = force

  force
    .on('tick', buildTicked(nodeData, linkData, force));

  renderInfoBox(nodeData, targets, targetObjects)

  setTimeout(function() {
    // const id = 'lib/gviz/application.ex'
    // showOnlyThisNodeAndCompileDeps(id, force, nodeData, linkData, targetObjects)
    // showFileTree(id, targetObjects)
  }, 500)
}

function calculateTopRecompiles(causeRecompileMap) {
  const topFiles = []

  for (const id of Object.keys(causeRecompileMap)) {
    topFiles.push({id: id, count: causeRecompileMap[id].length})
  }

  return lodash.sortBy(topFiles, d => d.count).reverse()
}

function renderHighlightsBox(causeRecompileMap) {
  const allFiles = calculateTopRecompiles(causeRecompileMap)
  const topFiles = allFiles.slice(0, 6)

  // recompile map shows which files the given id cause to recompile
  const u = d3.select('.highlight-box .cause-recompile-list')
              .selectAll('div')
              .data(topFiles)

  u.enter()
    .append('div')
    .attr('class', 'inline-item')
    .text(d => `${d.count}: ${d.id}`)
    .merge(u)
    .on('mouseover', (d) => {
      highlightFilesThisFileCausesToRecompile(d.id, causeRecompileMap)
    })
    .on('mouseout', (_d) => {
      unHighlightFilesThisFileCausesToRecompile()
    })
}

function calculateTopGetRecompiled(getsRecompiledMap) {
  const allFiles = []

  for (const id of Object.keys(getsRecompiledMap)) {
    allFiles.push({id: id, count: getsRecompiledMap[id]})
  }

  return lodash.orderBy(allFiles, ['count'], ['desc'])
}

function renderTopFilesThatGetRecompiled(getsRecompiledMap, targetObjects) {
  const allFiles = calculateTopGetRecompiled(getsRecompiledMap)
  const topFiles = allFiles.slice(0, 6)

  const u = d3.select('.highlight-box .gets-recompiled-list')
              .selectAll('div')
              .data(topFiles)

  u.enter()
   .append('div')
    .attr('class', 'inline-item')
    // Subtract 1 to not count itself
   .text(d => `${d.count - 1}: ${d.id}`)
   .merge(u)
   .on('mouseover', (d) => {
     highlightCompileDepsOfNode(d.id, targetObjects)
     // showFileTree(d.id, targetObjects)
   })
   .on('mouseout', (_d) => {
     unShowNodeCompileDeps()
     // unShowFileTree()
   })
}

function renderTotalFileCount(getsRecompiledMap) {
  const totalFileCount = Object.keys(getsRecompiledMap).length
  jQuery('.total-files-count').text(totalFileCount)
}

function renderInfoBox(nodeData, _targets, targetObjects) {
  const u = d3.select('.info-box-file-list')
    .selectAll('div')
    .data(nodeData, d => d.id)

  u.enter()
   .append('div')
   .attr('class', 'inline-item')
   .text(d => d.id)
   .on('mouseover', function (nodeDatum) {
     highlightCompileDepsOfNode(nodeDatum.id, targetObjects)
   })
   .on('mouseout', function (_nodeDatum) {
     unShowNodeCompileDeps()
   })

  const $input = jQuery('#info-box-input')
  const $header = jQuery('#info-box-header')
  const $tabBar = jQuery('.tab-bar')

  $tabBar.on('click', '.tab', function () {
    const $this = jQuery(this)
    if (!$this.hasClass('active')) {
      $this.siblings().removeClass('active')
      $this.addClass('active')
      switch ($this.data('name')) {
        case 'stats': {
          $allFilesContainer.hide()
          $topStats.show()
          vizState.infoBoxMode = 'stats'
          break
        }

        case 'all-files': {
          $allFilesContainer.show()
          $topStats.hide()
          vizState.infoBoxMode = 'all-files'
          break
        }
      }
    }
  })

  $input.bind('input', function () {
    const input = jQuery(this).val()
    if (input == '') {
      $header.text('All files:')
    } else {
      $header.text(`Results for "${input}":`)
    }

    const u2 =
          d3.select('.info-box-file-list')
            .selectAll('div')
            .data(nodeData.filter(d => {
              return d.id.indexOf(input) !== -1
            }), d => d.id)

    u2.enter()
      .append('div')
      .text(d => d.id)

    u2.exit().remove()

    d3.select('svg')
      .select('.nodes')
      .selectAll('circle')
      .transition().duration(TRANSITION_SLOW)
      .style('fill-opacity', d => {
        if (d.id.indexOf(input) !== -1) {
          return 1
        } else {
          return 0.1
        }
      })
      .style('fill', d => {
        if (input == '') {
          return 'black'
        } else if (d.id.indexOf(input) !== -1) {
          return HIGHLIGHT_NODE_COLOR
        } else {
          return 'black'
        }
      })

    d3.select('svg')
      .selectAll('line')
      .transition().duration(TRANSITION_SLOW)
      .style('fill-opacity', d => {
        if (d.source.id.indexOf(input) !== -1) {
          return 1
        } else {
          return 0.1
        }
      })
      .style('stroke', d => {
        // if (d.target.id.indexOf(input) !== -1 && d.source.id.indexOf(input) !== -1) {
        if (d.source.id.indexOf(input) !== -1) {
          return d.stroke
        } else {
          return DEFAULT_LINE_STROKE
        }
      })
  })
}

function chargeStrength(_data) {
  // NOTE: It might be nice for this to be dependent on the number of connected
  // edges. By giving more strength to nodes that have many edges the clusters
  // will be a little more dispersed and hopefully easier to grok.
  return -30
}

function transformData(linkData) {
  linkData.forEach(d => {
    if (d.label == "(compile)") {
      d.stroke = COMPILE_LINE_STROKE
    } else if (d.label == "(export)") {
      d.stroke = EXPORT_LINE_STROKE
    } else {
      d.stroke = DEFAULT_LINE_STROKE
    }
  })
}

function buildTicked(nodeData, linkData, force) {
  return () => {
    updateNodes(nodeData, linkData, force)
    updateLinks(linkData)
    updateLabelsPos()
  }
}

function updateLinks(linkData) {
  var u = d3.select('.links')
    .selectAll('line')
    .data(linkData)

  u.enter()
    .append('line')
    .attr('stroke', d => d.stroke)
    .attr('stroke-width', 0.3)
    .merge(u)
    .attr('x1', function(d) {
      return d.source.x
    })
    .attr('y1', function(d) {
      return d.source.y
    })
    .attr('x2', function(d) {
      return d.target.x
    })
    .attr('y2', function(d) {
      return d.target.y
    })

  u.exit().remove()
}

function updateNodes(nodeData, _linkData, force) {
  var u = d3.select('svg')
            .select('.nodes')
            .selectAll('circle')
            .data(nodeData, d => d.id)

  u.enter()
    .append('circle')
    .attr('r', NODE_RADIUS)
    .attr('class', nodeClass)
    .style('fill', DEFAULT_NODE_COLOR)
    .merge(u)
    .attr('cx', function(d) {
      return d.x
    })
    .attr('cy', function(d) {
      return d.y
    })
    .on('mouseover', function (nodeDatum) {
      console.log("Hovered on", nodeDatum.id)
      if (window.vizMode === 'focusNode') {
        highlightAllDeps(nodeDatum.id, targets, targetObjects)
      } else {
        highlightCompileDepsOfNode(nodeDatum.id, targetObjects)
        showFileTree(nodeDatum.id, targetObjects)
      }
    })
    .on('mouseout', function (_nodeDatum) {
      unShowNodeCompileDeps()
      unShowFileTree()
    })
    .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded))
    .on('click', function (_d) {
    })

  u.exit().remove()

  function dragStarted(d) {
    if (window.vizMode === 'focusNode') return
    if (!d3.event.active) force.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  function dragged(d) {
    if (window.vizMode === 'focusNode') return
    d.fx = d3.event.x
    d.fy = d3.event.y
  }

  function dragEnded(d) {
    if (window.vizMode === 'focusNode') return
    if (!d3.event.active) force.alphaTarget(0)
    d.fx = null
    d.fy = null
  }
}

function updateLabelBackgroundPos() {
  const background = d3.select('svg')
                       // .select('.label-backgrounds')
                       .selectAll('rect')

  background
    .attr('x', d => d.x + 10)
    .attr('y', d => d.y - 12)
}

export function updateLabelsPos() {
  const u = d3.select('svg')
              .selectAll('text.node-label')

  u
    .attr('x', d => d.x + 10)
    .attr('y', d => d.y)
}

export function updateLabels(nodeData, primaryId) {
  const fontSize = d => d.id === primaryId ? 13 : 9

  const u = d3.select('svg')
              .select('.labels')
              .selectAll('g')
              .data(nodeData)

  const enter = u.enter()

  // Sort the primary node to be displayed last (so that it will be displayed on
  // top of all other nodes and elements)
  const g = enter.append('g')
                 .sort((a, _b) => a.id === primaryId ? 1 : -1)

  // Label Background
  g
    .filter(d => d.id === primaryId)
    .append('rect')
    .attr('width', d => {
      const width = BrowserText.getWidth(d.id, fontSize(d), 'Fira Mono')
      return width + 30
    })
    .attr('height', 25)
    .style('fill', 'white')
    .style('fill-opacity', d => {
      return d.id === primaryId ? 0.9 : 0
    })

  updateLabelBackgroundPos()

  g
   .append('text')
   .attr('class', 'node-label pointer-events-none')
   .text(d => d.id)
   .attr('dominant-baseline', 'middle')
   .style('font-size', fontSize)
   .merge(u)
   .attr('x', d => d.x + 18)
   .attr('y', d => d.y)

  u.exit().remove()
}

function linkType(label) {
  switch(label) {
    case "(compile)": return 'compile'
    case "(export)": return 'export'
    default: return 'runtime'
  }
}

function nodeClass(_data) {
  return ''
  // const id = data.id
  // if (id.includes('_web')) {
  //   if (id.includes('_view.ex')) {
  //     return 'node-type-view'
  //   } else if (id.includes('_controller.ex')) {
  //     return 'node-type-controller'
  //   } else if (id.includes('/live/')) {
  //     return 'node-type-live'
  //   } else {
  //     return ''
  //   }
  // } else {
  //   return ''
  // }
}

function highlightCompileDepsOfNode(id, targetObjects) {
  const duration = TRANSITION_SLOW
  const compileMatched = findCompileDependencies(targetObjects, id)

  if (vizSettings.logFilesToCompile) {
    console.log(`\nTouching any of these file will cause ${id} to recompile:`)
    for (const id of Object.keys(compileMatched)) {
      console.log(id)
    }
  }

  const linkClass = function(d) {
    return d.source.id === id || d.target.id === id ? 'direction-animate' : ''
  }

  // Fade out non-compile dependencies nodes
  const nodes =
    d3.select('svg')
      .selectAll('circle')

  nodes
    .transition().duration(duration)
    .attr('r', d => d.id == id ? HIGHLIGHTED_NODE_RADIUS : NODE_RADIUS)
    .style('fill-opacity', d => hoverNodeOpacity(compileMatched, d))
    .style('fill', d => hoverNodeFill(compileMatched, d, id, CAUSES_RECOMPILE_NODE_COLOR))

  // Fade and desaturate non-compile depedency lines and arrows
  d3.select('svg')
    .selectAll('line')
    .transition().duration(duration)
    .style('stroke-opacity', d => hoverOpacityCompile(compileMatched, d))
    .attr('stroke', d => hoverLineStroke(compileMatched, d))
    .attr('class', linkClass)

  showMatchingLabels(nodes, compileMatched, id)
}

function unShowNodeCompileDeps() {
  // if (window.vizMode === 'focusNode') return
  restoreNodes()
  restoreLines()
  restoreLabels()
}

function highlightFilesThisFileCausesToRecompile(id, causeRecompileMap) {
  const duration = TRANSITION_SLOW

  if (vizSettings.logFilesToCompile) {
    console.log(`\nTouching ${id} will cause these files to be recompiled:`)
    causeRecompileMap[id].forEach(id => {
      console.log(id)
    })
  }

  const matched = {}
  causeRecompileMap[id].forEach(id => matched[id] = true)

  const nodes =
        d3.select('svg')
          .selectAll('circle')

  // Highlight and fade nodes
  nodes
    .transition().duration(duration)
    .attr('r', d => d.id == id ? HIGHLIGHTED_NODE_RADIUS : NODE_RADIUS)
    .style('fill-opacity', d => hoverOpacity(matched, d.id))
    .style('fill', d => hoverNodeFill(matched, d, id, GETS_RECOMPILED_NODE_COLOR))

  // Highlight and fade links
  d3.select('svg')
    .selectAll('line')
    .transition().duration(duration)
    .style('stroke-opacity', d => hoverOpacityCompile(matched, d))
    .attr('stroke', d => hoverLineStroke(matched, d))
    .attr('class', d => hoverAnimateStroke(id, d))

  showMatchingLabels(nodes, matched, id)
}

function unHighlightFilesThisFileCausesToRecompile() {
  restoreNodes()
  restoreLines()
  restoreLabels()
}

function highlightAllDeps(id, targets, _targetObjects) {
  const duration = TRANSITION_SLOW

  const matched = findAllDependencies(targets, id)

  // Fade out non-dependencies
  const nodes = d3.select('svg')
                  .selectAll('circle')

  nodes
    .transition().duration(duration)
    .attr('r', d => d.id == id ? NODE_RADIUS + 2 : NODE_RADIUS)
    .style('fill-opacity', d => hoverOpacity(matched, d.id))
    .style('fill', d => hoverNodeFill(matched, d, id, DEFAULT_NODE_COLOR))

  // Fade and desaturate non-dependency lines and arrows
  d3.select('svg')
    .selectAll('line')
    .transition().duration(duration)
    .style('fill-opacity', d => hoverOpacityCompile(matched, d))
    .attr('stroke', d => hoverLineStroke(matched, d))

  const filteredNodes =
        nodes
        .filter(d => d.id in matched)
        .data()

  if (filteredNodes.length <= vizSettings.maxLabelsToShow) {
    updateLabels(filteredNodes, id)
  } else {
    updateLabels(filteredNodes.filter(d => d.id === id), id)
  }
}

// Shows the direct depenencies of the given file id
function showFileTree(id, targetObjects) {
  switch (vizState.infoBoxMode) {
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

function unShowFileTree() {
  jQuery('.info-box-file-tree').hide()
  switch (vizState.infoBoxMode) {
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

function hoverNodeFill(matched, d, id, matchedColor) {
  if (d.focused) {
    return HIGHLIGHT_NODE_COLOR
  } else if (d.id == id) {
    return HIGHLIGHT_NODE_COLOR
  } else if (d.id in matched) {
    return matchedColor
  } else {
    return DEFAULT_NODE_COLOR
  }
}

function hoverNodeOpacity(matched, d) {
  return d.id in matched ? 1 : 0.1
}

function hoverOpacity(matched, id) {
  return id in matched ? 1 : 0.1
}

function hoverOpacityCompile(matched, d) {
  if (d.id) {
    // Node
    return d.id in matched ? 1 : 0.1
  } else {
    // Link
    const sourceMatched = d.source.id in matched
    const targetMatched = d.target.id in matched
    return sourceMatched && targetMatched ? 1 : 0.1
  }
}

function hoverLineStroke(matched, d) {
  if (d.source.id in matched) {
    return d.stroke === DEFAULT_LINE_STROKE ? 'black' : d.stroke
  } else {
    return DEFAULT_LINE_STROKE
  }
}

function hoverAnimateStroke(id, d) {
  return d.source.id === id || d.target.id === id ? 'direction-animate' : ''
}

function showMatchingLabels(nodes, matched, id) {
  const matchedNodeData = nodes
        .data()
        .filter(d => d.id in matched)

  if (matchedNodeData.length <= vizSettings.maxLabelsToShow) {
    updateLabels(matchedNodeData, id)
  } else {
    updateLabels(matchedNodeData.filter(d => d.id === id), id)
  }
}

function restoreNodes() {
  d3.select('svg')
    .select('.nodes')
    .selectAll('circle')
    .transition().duration(TRANSITION_FAST)
    .attr('r', NODE_RADIUS)
    .style('fill', DEFAULT_NODE_COLOR)
    .style('fill-opacity', 1)
}

function restoreLines() {
  d3.select('svg')
    .selectAll('line')
    .transition().duration(TRANSITION_FAST)
    .style('stroke-opacity', 1)
    .attr('stroke', d => d.stroke)
    .attr('class', '')
}

function restoreLabels() {
  updateLabels([])
}

function initGlossary() {
  jQuery('.glossary-box .causes-recompile .box').css('background', CAUSES_RECOMPILE_NODE_COLOR)
  jQuery('.glossary-box .gets-recompiled .box').css('background', GETS_RECOMPILED_NODE_COLOR)
}
