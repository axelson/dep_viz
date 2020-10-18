import { findCompileDependencies } from './force_utils'

onmessage = function(e) {
  console.log('Message received', e)
  switch (e.data.type) {
    case 'init': return init(e.data.nodeData, e.data.targetObjects)
    default:
      console.error('Unexpected message type', e.data.type)
      return null
  }
}

function init(nodeData, targetObjects) {
  console.log('targetObjects', targetObjects);
  const causeRecompileMap = {}
  const getsRecompiledMap = {}

  nodeData.forEach(node => {
    const deps = findCompileDependencies(targetObjects, node.id)

    getsRecompiledMap[node.id] = Object.keys(deps).length

    for (const depId of Object.keys(deps)) {
      if (causeRecompileMap[depId]) {
        causeRecompileMap[depId].push(node.id)
      } else {
        causeRecompileMap[depId] = [node.id]
      }
    }
  })

  // This is working, although it's not distinguishing between export and
  // compile dependencies
  postMessage({
    causeRecompileMap: causeRecompileMap,
    getsRecompiledMap: getsRecompiledMap,
  })
}

// This script needs a copy of targetObjects graph
// For each node, calculate the nodes that will cause this node to be recompiled
// Stream results back to the main process?
