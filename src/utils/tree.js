// [
//   { id: 1, parent_id: 0, label: 'Benci' },
//   { id: 2, parent_id: 1, permission: 'A1' },
// ]
// =>
// [
//   {
//     id: 1,
//     parent_id: 0,
//     label: 'Benci',
//     children: [
//       { 
//         id: 2,
//         parent_id: 1,
//         label: 'A1',
//         children: [
//          { 
//           id: 3,
//           parent_id: 2,
//           label: 'Acostic',
//          },
//         ],
//       },
//       { id: 4, parent_id: 1,, label: 'XX' },
//     ],
//   }
// ]
export const list2Tree = (_list, parentIdKey = 'parent_id', idKey = 'id', childrenKey = 'children') => {
  const list = []
  Object.assign(list, _list)
  const map = {}, tree = []
  for (let i = 0; i < list.length; i++) {
    map[list[i][idKey]] = i
  }
  for (let i = 0; i < list.length; i++) {
    const node = list[i]
    if (node[parentIdKey] !== 0) {
      if (!(childrenKey in list[map[node[parentIdKey]]])) {
        list[map[node[parentIdKey]]][childrenKey] = []
      }
      // if you have dangling branches check that map[node.parentId] exists
      list[map[node[parentIdKey]]][childrenKey].push(node)
    } else {
      tree.push(node)
    }
  }
  return tree
}

// node:
// [
//   {
//     id: 1,
//     parent_id: 0,
//     label: 'Benci',
//     children: [
//       { 
//         id: 2,
//         parent_id: 1,
//         label: 'A1',
//         children: [
//          { 
//           id: 3,
//           parent_id: 2,
//           label: 'Acostic',
//          },
//         ],
//       },
//       { id: 4, parent_id: 1,, label: 'XX' },
//     ],
//   }
// ]
// keyValueMap = (node) => { return { id: node.id, parent_id: node.parent_id, label: node.label } }
// =>
// [
//   { id: 1, parent_id: 0, label: 'Benci' },
//   { id: 2, parent_id: 1, permission: 'A1' },
// ]
export const tree2List = (node, keyValueMap = () => { }, path = [], result = [], childrenKey = 'children') => {
  result.push(keyValueMap(node))
  if (node[childrenKey]) {
    for (const child of node[childrenKey]) {
      tree2List(child, keyValueMap, path.concat(keyValueMap(node)), result, childrenKey)
    }
  }
  return result
}