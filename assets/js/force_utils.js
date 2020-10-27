import lodash from 'lodash'
import { depType } from './constants.js'

export function findCompileDependencies(graph, id) {
  return compileDependencies(graph, id, {[id]: true}, false)
}

// Find all the files that will cause this file to recompile
function compileDependencies(graph, id, matched, isCompileDep) {
  // A file that has an export dependency
  // Compilation dependencies are any dependency that is directly a compilation
  // dependency and  any dependency of a compilation dependency
  // Also include export depedency (but not it's children) in this analysis

  if (graph[id]) {
    graph[id].forEach(node => {
      switch (node.type) {
        case 'compile':
          if (!matched[node.id]) {
            matched[node.id] = true
            compileDependencies(graph, node.id, matched, true)
          }
          break

        case 'export':
          if (!matched[node.id]) {
            matched[node.id] = true
          }
          break

        case 'runtime':
          if (isCompileDep && !matched[node.id]) {
            matched[node.id] = true
            compileDependencies(graph, node.id, matched, true)
          }
          break

        default:
          throw `Unhandled node type ${node.type}`
      }
    })
  }

  return matched
}

export function findAllDependenciesTypes(graph, id) {
  return doFindAllDependenciesTypes(graph, id, {[id]: depType.compile}, true, false)
}

function doFindAllDependenciesTypes(graph, id, matched, topLevel, isCompileDep) {
  // A file that has an export dependency
  // Compilation dependencies are any dependency that is directly a compilation
  // dependency and any dependency of a compilation dependency
  // Also include export depedency (but not it's children) in this analysis

  // If the node is already visited, then don't recurse
  // Unless the node was visited as a runtime dependency
  // As an optimization, start with all the compile time depdendencies

  if (graph[id]) {
    // Sort nodes by dependency type because we want to visit all compile
    // dependencies first (so that we preferentially mark nodes as compile time
    // depdency, because if a node is both a compile time dependency and a
    // export/runtime dependency then we treat it as a compile time dependency)
    const nodes = lodash.sortBy(graph[id], node => {
      switch (node.type) {
        case 'compile': return 0
        case 'export': return 1
        case 'runtime': return 2
      }
    })

    nodes.forEach(node => {
      if (!matched[node.id]) {
        if (isCompileDep) {
          matched[node.id] = depType.compile
          doFindAllDependenciesTypes(graph, node.id, matched, false, true)
        } else {
          switch (node.type) {
            case 'compile':
              if (topLevel) {
                matched[node.id] = depType.compile
                doFindAllDependenciesTypes(graph, node.id, matched, false, true)
              } else {
                matched[node.id] = depType.runtime
                doFindAllDependenciesTypes(graph, node.id, matched, false, false)
              }
              break

            case 'export':
              if (topLevel) {
                matched[node.id] = depType.export
              } else {
                matched[node.id] = depType.runtime
              }
              doFindAllDependenciesTypes(graph, node.id, matched, false, false)
              break

            case 'runtime':
              matched[node.id] = depType.runtime
              doFindAllDependenciesTypes(graph, node.id, matched, false, false)
              break

            default:
              throw `Unhandled node type ${node.type}`
          }
        }
      }
    })
  }

  return matched
}

export function findAllDependencies(graph, id) {
  let cur = [id]
  let next = []
  const visited = {}
  let depth = 0

  while (cur.length > 0 || next.length > 0) {
    const node = cur.shift()
    visited[node] = depth;

    (graph[node] || []).forEach(childNode => {
      const id = childNode.id || childNode
      if (!(id in visited)) {
        next.push(id)
      }
    })

    if (cur.length == 0) {
      cur = next
      next = []
      depth += 1
    }
  }

  return visited
}
