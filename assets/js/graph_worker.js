import {
  findCompileDependencies,
  findAllDependenciesTypes
} from './force_utils'

onmessage = function(e) {
  switch (e.data.type) {
    case 'init': return init(e.data.nodeData, e.data.targetObjects)
    default:
      console.error('Unexpected message type', e.data.type)
      return null
  }
}

function init(nodeData, targetObjects) {
  const dependenciesMap = {}

  // TODO: Phase these out
  const getsRecompiledMap = {}

  nodeData.forEach(node => {
    const deps = findCompileDependencies(targetObjects, node.id)
    const dependencyTypes = findAllDependenciesTypes(targetObjects, node.id)

    dependenciesMap[node.id] = dependencyTypes
    getsRecompiledMap[node.id] = Object.keys(deps).length
  })

  // dependenciesMap looks correct, so maybe the problem is in the rendering
  // console.log('dependenciesMap', dependenciesMap);
  // console.log('causeRecompileMap', causeRecompileMap);
  // console.log('getsRecompiledMap', getsRecompiledMap);

  const causeRecompileMap = {}
  // for dependenciesMap
  for (const [file, deps] of Object.entries(dependenciesMap)) {
    for (const [depFile, depType] of Object.entries(deps)) {
      if (depType === 'compile') {
        const list = (causeRecompileMap[depFile] || [])
        list.push(file)
        causeRecompileMap[depFile] = list
      }
    }
  }

  postMessage({
    causeRecompileMap: causeRecompileMap,
    getsRecompiledMap: getsRecompiledMap,
    dependenciesMap: dependenciesMap,
  })
}

// This script needs a copy of targetObjects graph
// For each node, calculate the nodes that will cause this node to be recompiled
// Stream results back to the main process?
