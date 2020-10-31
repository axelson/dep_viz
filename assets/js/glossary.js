import {
  renderLink,
  renderNode,
  renderSelectedNode
} from './utils/render_utils.js'

export function renderGlossary() {
  renderFile()
  renderSelectedNodeIndicator()
  renderLine()
}

function renderSelectedNodeIndicator() {
  const data = [true]

  const g = d3.select('.glossary-box svg.selected-node-indicator')
              .selectAll('.selected-node')
              .data(data)
              .enter()

  renderSelectedNode(g, 10, 10)
}

function renderFile() {
  const data = [true]

  const g = d3.select('.glossary-box svg.file-indicator')
              .selectAll('circle')
              .data(data)
              .enter()

  renderNode(g, 10, 10)
}

function renderLine() {
  const data = [true]

  const g = d3.select('.glossary-box svg.line-indicator')
              .selectAll('line')
              .data(data)
              .enter()

  renderLink(g, 0, 10, 40, 10)
}
