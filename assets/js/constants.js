export const TRANSITION_SLOW = 600
export const TRANSITION_FAST = 500

// TODO: Remove this color
export const CAUSES_RECOMPILE_COLOR = '#da4bfa'

// NOTE: Keep these colors in sync with colors.scss
export const COMPILATION_DEPENDENCY_COLOR = '#d32a3a'
export const EXPORT_DEPENDENCY_COLOR = '#0092b1'
export const RUNTIME_DEPENDENCY_COLOR = '#8b9f3e'
export const ANY_DEPENDEE_COLOR = 'black'
export const UI_PURPLE_COLOR = '#59386c'

export const COMPILE_LINE_STROKE = COMPILATION_DEPENDENCY_COLOR
export let EXPORT_LINE_STROKE = EXPORT_DEPENDENCY_COLOR
export const RUNTIME_LINE_STROKE = RUNTIME_DEPENDENCY_COLOR
export const DEFAULT_LINE_STROKE = '#ccc'

export const depType = {
  compile: 'compile',
  export: 'export',
  runtime: 'runtime',
}

// if (jQuery('body.dark-mode').length > 0) {
//   DEFAULT_NODE_COLOR = 'white'
//   EXPORT_LINE_STROKE = '#a1bfff'
// }
