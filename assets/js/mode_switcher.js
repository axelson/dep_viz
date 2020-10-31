import {
  UI_PURPLE_COLOR,
} from './constants'

import {
  DEFAULT_NODE_COLOR,
  NODE_RADIUS
} from './node_force_layout.js'

import {
  renderSelectedNode
} from './utils/render_utils.js'

const OPACITY_FADED = 0.3
const TRANSITION_SPEED = 250

export function initializeModeSwitcher(width, _height) {
  const data = [window.vizState]
  renderModeSwitcher(width, data)
}

function toggleMode() {
  const newViewMode = window.vizState.viewMode === 'deps' ? 'ancestors' : 'deps'
  window.vizState.viewMode = newViewMode

  renderModeSwitcher(window.svgWidth, [window.vizState])
}

export function renderModeSwitcher(width, data) {
  const u = d3.select('svg.main .mode-switcher')
              .selectAll('.controls')
              .data(data)

  const g = u.enter()
             .append('g')
             .attr('class', 'controls')
             .attr('transform', `translate(${width / 2}, 8)`)

  renderBg(g)

  renderHeader(g, u)
  renderSlider(g, u)
  renderNodes(g, u)
  renderExplainTextSection(g, u)
}

function renderHeader(g) {
  g.append('text')
   .attr('fill', UI_PURPLE_COLOR)
   .attr('text-anchor', 'middle')
   .style('dominant-baseline', 'central')
   .style('user-select', 'none')
   .text('VIEW MODE')
}

function renderExplainTextSection(g, u) {
  const el = g
        .append('g')
        .attr('class', 'explain-text-container')

  renderExplainText(el, u, 'left')
  renderExplainText(el, u, 'right')
}

function renderExplainText(g, u, side) {
  const x = side === 'left' ? -10 : 10
  const dy = 1.2

  const textEl = g.append('text')
                  .attr('class', side === 'left' ? 'explain-text left-text' : 'explain-text right-text')
                  .attr('text-anchor', side === 'left' ? 'end' : 'start')
                  .style('dominant-baseline', 'central')
                  .style('text-align', side === 'left' ? 'right' : 'left')
                  .attr('opacity', side === 'left' ? 0 : 1)
                  .attr('transform', `translate(${x}, 90)`)
  textEl.append('tspan')
        .attr('y', dy * 0 + 'em')
        .attr('class', 'bold')
        .text(side === 'left' ? 'Dependers' : 'Dependees')

   textEl.append('tspan')
         .attr('x', 0)
         .attr('y', dy * 1 + 'em')
         .text(side === 'left' ? 'view files that have' : 'view dependencies')

  textEl.append('tspan')
        .attr('x', 0)
        .attr('y', dy * 2 + 'em')
        .text(side === 'left' ? 'dependencies on the' : 'of the selected file')

  textEl.append('tspan')
        .attr('x', 0)
        .attr('y', dy * 3 + 'em')
        .text(side === 'left' ? 'selected file' : '')

  u.selectAll('.left-text')
   .transition().duration(TRANSITION_SPEED)
   .attr('opacity', d => d.viewMode === 'ancestors' ? 1 : 0)

  u.selectAll('.right-text')
   .transition().duration(TRANSITION_SPEED)
   .attr('opacity', d => d.viewMode === 'deps' ? 1 : 0)
}

function renderBg(g) {
  const width = 250
  const height = 150

  g.append('rect')
   .attr('fill', 'white')
   .attr('x', -width / 2)
   .attr('y', -10)
   .attr('width', width)
   .attr('height', height)
   .attr('fill-opacity', 0.8)
}

function renderNodes(g, u) {
  const dots = g
        .append('g')

  const dx = 15
  const divider = 40
  const baseY = 60

  renderDot(dots, u, baseY, -divider - dx * 0, 'left')
  renderDot(dots, u, baseY, -divider - dx * 1, 'left')
  renderDot(dots, u, baseY, -divider - dx * 2, 'left')
  renderArrow(dots, baseY, -1, 'left')

  renderDot(dots, u, baseY, 0, 'center')

  renderArrow(dots, baseY, 1, 'right')
  renderDot(dots, u, baseY, divider + dx * 0, 'right')
  renderDot(dots, u, baseY, divider + dx * 1, 'right')
  renderDot(dots, u, baseY, divider + dx * 2, 'right')

  u.selectAll('.left')
   .transition().duration(TRANSITION_SPEED)
   .style('fill-opacity', leftFill)

  u.selectAll('.right')
   .transition().duration(TRANSITION_SPEED)
   .style('fill-opacity', rightFill)
}

function leftFill(d) {
  return d.viewMode === 'ancestors' ? 1 : OPACITY_FADED
}

function rightFill(d) {
  return d.viewMode === 'deps' ? 1 : OPACITY_FADED
}

function renderArrow(dots, baseY, x, className) {
  const y = baseY - 6
  const baseX = 16
  x = x > 0 ? baseX : -baseX - 11

  dots.append('g')
      .attr('transform', `translate(${x}, ${y}) scale(0.8)`)
      .append('path')
      .attr('class', `arrow ${className}`)
      .attr('d', 'M0 0l13.88 7.5L0 14.69 2.99 7.5z')
      .attr('fill', UI_PURPLE_COLOR)
      .attr('fill-opacity', className === 'left' ? OPACITY_FADED : 1)
}

function renderDot(dots, u, baseY, x, className) {
  dots
    .append('circle')
    .attr('class', `dot ${className}`)
    .attr('r', NODE_RADIUS)
    .attr('cx', x)
    .attr('cy', baseY)
    .attr('fill', className === 'center' ? 'black': DEFAULT_NODE_COLOR)
    .attr('fill-opacity', className === 'left' ? OPACITY_FADED : 1)

  if (className === 'center') {
    renderSelectedNode(dots, x, baseY)
  }
}

function renderSlider(g, u) {
  const sliderWidth = 100, sliderHeight = 20

  const _sliderBg = g
        .append('rect')
        .attr('fill', '#ccc')
        .attr('x', -sliderWidth / 2)
        .attr('y', 15)
        .attr('rx', sliderHeight / 2)
        .attr('width', 100)
        .attr('height', sliderHeight)
        .style('cursor', 'pointer')
        .on('click', toggleMode)

  const sliderX = (d) => d.viewMode === 'ancestors' ? -sliderWidth / 2 : 0

  const _slider = g
        .append('rect')
        .attr('class', 'slider')
        .attr('fill', UI_PURPLE_COLOR)
        .attr('x', sliderX)
        .attr('y', 15)
        .attr('rx', sliderHeight / 2)
        .attr('width', sliderWidth * 0.55)
        .attr('height', sliderHeight)
        .style('pointer-events', 'none')

  u.selectAll('.slider')
   .transition().duration(TRANSITION_SPEED)
   .attr('x', sliderX)
}
