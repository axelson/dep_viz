export const TRANSITION_SLOW = 600
export const TRANSITION_FAST = 500

// TODO: Remove this color
export const CAUSES_RECOMPILE_COLOR = '#da4bfa'

export const COMPILATION_DEPENDENCY_COLOR = 'red'
export const EXPORT_DEPENDENCY_COLOR = '#3a79ff'
export const RUNTIME_DEPENDENCY_COLOR = '#31d200'
export const ANY_DEPENDEE_COLOR = 'black'

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
