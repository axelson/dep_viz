import {
  NODE_RADIUS
} from '../node_force_layout.js'

export function renderSelectedNode(g, cx, cy) {
  console.log('NODE_RADIUS', NODE_RADIUS);

  g.append('circle')
   .attr('r', NODE_RADIUS + 3)
   .attr('stroke', 'black')
   .attr('stroke-width', 1.5)
   .attr('cx', cx)
   .attr('cy', cy)
   .attr('fill', 'none')
}
