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
