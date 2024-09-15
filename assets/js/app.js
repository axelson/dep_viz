import * as d3 from "d3"
window.d3 = d3
import graphlibDot from "@dagrejs/graphlib-dot"
import jQuery from 'jquery'

import { render } from "./force_layout.js"

let searchParams = new URLSearchParams(window.location.search)
const fileName = searchParams.get('file')

const fileSelector = document.getElementById('file-selector')

fileSelector.addEventListener('change', (event) => {
  renderSelectedFile(event)
})

if (fileName) {
  renderPresetFile(fileName)
} else {
  const dataPr = d3.json("/sample_dot_file_list")
  dataPr.then(function(fileList) {
    d3.select('.sample-dot-list')
      .selectAll('div')
      .data(fileList)
      .enter()
      .append('div')
      .attr('class', 'sample-dot inline-item')
      .text(d => "- " + d)
      .on('click', function(d) {
        renderPresetFile(d)
      })
  })
}

function renderPresetFile(fileName) {
  jQuery('.initial-interface').hide()
  const dotData = d3.text(`/dot_files/${fileName}`)
  dotData.then(data => {
    renderDotFile(data)
  })
}

function renderSelectedFile(event) {
  jQuery('.initial-interface').hide()

  const fileList = event.target.files
  for (const file of fileList) {
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      renderDotFile(event.target.result)
    });
    reader.readAsText(file);
  }
}

function renderDotFile(data) {
  jQuery('.force-layout-container').show()
  jQuery('body').removeClass('initial')

  let graph = null
  try {
    graph = graphlibDot.read(data)
  } catch(e) {
    console.error(e)
    alert("Unable to parse dot file: " + e.message)
  }
  if (!graph) return

  const nodes = graph.nodes().map(id => {
    return {
      type: 'node',
      id: id,
      source: '',
      target: '',
      label: ''
    }
  })

  const edges = graph.edges().map(edgeObj => {
    const edge = graph.edge(edgeObj)
    return {
      type: 'edge',
      id: '',
      source: edgeObj.v,
      target: edgeObj.w,
      label: edge.label || ''
    }
  })

  render(nodes, edges, graph.graph().id)
}
