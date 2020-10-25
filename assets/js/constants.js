import jQuery from 'jquery'

export const TRANSITION_SLOW = 600
export const TRANSITION_FAST = 500
export const GETS_RECOMPILED_COLOR = 'red'
export const CAUSES_RECOMPILE_COLOR = '#da4bfa'

export const COMPILE_LINE_STROKE = 'red'
export const DEFAULT_LINE_STROKE = '#ccc'
export let EXPORT_LINE_STROKE = '#3a79ff'

if (jQuery('body.dark-mode').length > 0) {
  DEFAULT_NODE_COLOR = 'white'
  EXPORT_LINE_STROKE = '#a1bfff'
}
