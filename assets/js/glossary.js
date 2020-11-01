import {
  COMPILATION_DEPENDENCY_COLOR,
  EXPORT_DEPENDENCY_COLOR,
  RUNTIME_DEPENDENCY_COLOR
} from './constants.js'

import {
  DEFAULT_NODE_COLOR
} from './node_force_layout.js'

import {
  renderLink,
  renderNode,
  renderSelectedNode
} from './utils/render_utils.js'

export function renderGlossary() {
  renderFile()
  renderSelectedNodeIndicator()
  renderLine()

  renderDependencyType(d3.select('.glossary-box svg.dep-type-indicator.compile'), 'compile')
  renderDependencyType(d3.select('.glossary-box svg.dep-type-indicator.export'), 'export')
  renderDependencyType(d3.select('.glossary-box svg.dep-type-indicator.runtime'), 'runtime')
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

  renderNode(g, 10, 10, DEFAULT_NODE_COLOR)
}

function renderLine() {
  const data = [true]

  const g = d3.select('.glossary-box svg.line-indicator')
              .selectAll('line')
              .data(data)
              .enter()

  // Slightly darker than DEFAULT_LINE_STROKE
  renderLink(g, 0, 10, 20, 10, '#aaa')
}

function renderDependencyType(g, type) {
  const data = [true]

  const circle = g.selectAll('circle')
                  .data(data)
                  .enter()

  const line = g.selectAll('line')
                .data(data)
                .enter()

  renderNode(circle, 10, 10, color(type))
  renderLink(line, 20, 10, 40, 10, color(type))
}

function color(type) {
  switch(type) {
    case 'compile': return COMPILATION_DEPENDENCY_COLOR
    case 'export': return EXPORT_DEPENDENCY_COLOR
    case 'runtime': return RUNTIME_DEPENDENCY_COLOR
  }
}
