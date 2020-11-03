// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
//     import {Socket} from "phoenix"
//     import socket from "./socket"
//
// import "phoenix_html"
import * as d3 from "d3"
window.d3 = d3
import graphlibDot from "@dagrejs/graphlib-dot"

import { render } from "./force_layout.js"

let searchParams = new URLSearchParams(window.location.search)
const fileName = searchParams.get('file')

const fileSelector = document.getElementById('file-selector')

fileSelector.addEventListener('change', (event) => {
  renderSelectedFile(event)
})

if (fileName) {
  renderPresetFile(fileName)
  fileSelector.style.display = 'none'
}

function renderPresetFile(fileName) {
  const dotData = d3.text(`/dot_files/${fileName}`)
  dotData.then(data => {
    renderDotFile(data)
  })
}

function renderSelectedFile(event) {
  const fileList = event.target.files
  for (const file of fileList) {
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      renderDotFile(event.target.result)
    });
    reader.readAsText(file);
  }
  fileSelector.style.display = 'none'
}

function renderDotFile(data) {
  const graph = graphlibDot.read(data)

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
