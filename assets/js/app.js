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
import "phoenix_html"
import {Socket} from "phoenix"
import NProgress from "nprogress"
import {LiveSocket} from "phoenix_live_view"
import * as d3 from "d3"
window.d3 = d3
import graphlibDot from "@dagrejs/graphlib-dot"

import { render } from "./force_layout.js"

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
let liveSocket = new LiveSocket("/live", Socket, {params: {_csrf_token: csrfToken}})

// Show progress bar on live navigation and form submits
window.addEventListener("phx:page-loading-start", info => NProgress.start())
window.addEventListener("phx:page-loading-stop", info => NProgress.done())

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket

let searchParams = new URLSearchParams(window.location.search)
const fileName = searchParams.get('file') || 'sample_xref_graph.dot'

const dotData = d3.text(`/dot_files/${fileName}`)
dotData.then(data => {
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
})
