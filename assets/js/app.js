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
import "d3-graphviz"
window.d3 = d3

import { forceLayout } from "./force_layout.js"

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

fetch('/dot', {})
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text();
  })
  .then(text => {
    const graphEl = document.getElementById('graph');
    if (graphEl) {
      const graphviz = d3.select("#graph").graphviz()

      graphviz
        .transition(function() {
          return d3.transition()
                  .delay(100)
                  .duration(1000);
        })
        .renderDot(text)
    }
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });

// const forceLayout = document.getElementById('force-layout');

const forceData =
  d3.csv("/force_data")
    // .then(response => {
    //   console.log('response', response)
    //   return response
    // })

forceLayout(forceData)

// var links = [
//   {source: 0, target: 1},
//   {source: 0, target: 2},
//   // {source: 0, target: 3}
// ]

// if (forceLayout) {
//   console.log("force layout!")
//   var width = 500, height = 500
//   var nodes = [{}, {}, {}, {}, {}]

//   var simulation =
//       d3.forceSimulation(nodes)
//         .force('charge', d3.forceManyBody())
//         .force('center', d3.forceCenter(width / 2, height / 2))
//         .force('link', d3.forceLink().links(links))
//         .on('tick', ticked);
// }

// function updateLinks() {
//   var u = d3.select('.links')
//     .selectAll('line')
//     .data(links)

//   u.enter()
//     .append('line')
//     .merge(u)
//     .attr('x1', function(d) {
//       return d.source.x
//     })
//     .attr('y1', function(d) {
//       return d.source.y
//     })
//     .attr('x2', function(d) {
//       return d.target.x
//     })
//     .attr('y2', function(d) {
//       return d.target.y
//     })

//   u.exit().remove()
// }

// function updateNodes() {
//   var u = d3.select('svg')
//     .selectAll('circle')
//     .data(nodes)

//   u.enter()
//     .append('circle')
//     .attr('r', 5)
//     .merge(u)
//     .attr('cx', function(d) {
//       return d.x
//     })
//     .attr('cy', function(d) {
//       return d.y
//     })

//   u.exit().remove()
// }

// function ticked() {
//   updateLinks()
//   updateNodes()
// }

// d3.select("#graph").graphviz()
//     .renderDot('digraph  {a -> b}');
