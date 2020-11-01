import {
  COMPILE_LINE_STROKE,
  EXPORT_LINE_STROKE,
  RUNTIME_LINE_STROKE
} from '../constants.js'

import {
  NODE_RADIUS
} from '../node_force_layout.js'

export function renderNode(g, cx, cy, fill) {
  g.append('circle')
   .attr('class', `dot`)
   .attr('r', NODE_RADIUS)
   .attr('cx', cx)
   .attr('cy', cy)
   .attr('fill', fill)
}

export function renderLink(g, x1, y1, x2, y2, stroke) {
  g.append('line')
   .attr('stroke', stroke)
   .attr('x1', x1)
   .attr('x2', x2)
   .attr('y1', y1)
   .attr('y2', y2)
}

export function renderSelectedNode(g, cx, cy) {
  g.append('circle')
   .attr('class', `dot`)
   .attr('r', NODE_RADIUS)
   .attr('cx', cx)
   .attr('cy', cy)
   .attr('fill', 'black')

  g.append('circle')
   .attr('r', NODE_RADIUS + 3)
   .attr('stroke', 'black')
   .attr('stroke-width', 1.5)
   .attr('cx', cx)
   .attr('cy', cy)
   .attr('fill', 'none')
}

export function renderSelectedNodeWithData(g, color = 'black') {
  let colorFn = null
  if (color === 'auto') {
    colorFn = d => d.tempFill || 'black'
  } else {
     colorFn = color
  }

  g.append('circle')
   .attr('r', NODE_RADIUS + 3)
   .attr('stroke', colorFn)
   .attr('stroke-width', 1.5)
   .attr('cx', d => d.x)
   .attr('cy', d => d.y)
   .attr('fill', 'white')

  g.append('circle')
   .attr('class', `dot`)
   .attr('r', NODE_RADIUS)
   .attr('cx', d => d.x)
   .attr('cy', d => d.y)
   .attr('fill', colorFn)
}

export function colorFromDepType(type) {
  switch(type) {
    case 'compile': return COMPILE_LINE_STROKE
    case 'export': return EXPORT_LINE_STROKE
    case 'runtime': return RUNTIME_LINE_STROKE
  }
}
