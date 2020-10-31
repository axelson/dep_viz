import { DEFAULT_LINE_STROKE } from '../constants.js'
import {
  DEFAULT_NODE_COLOR,
  NODE_RADIUS
} from '../node_force_layout.js'

export function renderNode(g, cx, cy) {
  g.append('circle')
   .attr('class', `dot`)
   .attr('r', NODE_RADIUS + 3)
   .attr('cx', cx)
   .attr('cy', cy)
   .attr('fill', DEFAULT_NODE_COLOR)
}

export function renderLink(g, x1, y1, x2, y2) {
  g.append('line')
   .attr('stroke', DEFAULT_LINE_STROKE)
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

export function renderSelectedNodeWithData(g) {
  console.log('g', g);

  g.append('circle')
   .attr('r', NODE_RADIUS + 3)
   .attr('stroke', 'black')
   .attr('stroke-width', 1.5)
   .attr('cx', d => d.x)
   .attr('cy', d => d.y)
   .attr('fill', 'white')

  g.append('circle')
   .attr('class', `dot`)
   .attr('r', NODE_RADIUS)
   .attr('cx', d => d.x)
   .attr('cy', d => d.y)
   .attr('fill', 'black')
}
