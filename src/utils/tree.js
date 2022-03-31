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
//           children: []
//          },
//         ],
//       },
//       { id: 4, parent_id: 1,, label: 'XX', children: [] },
//     ],
//   }
// ]
export const list2Tree = (_list, parentIdKey = 'parent_id') => {
  const list = []
  Object.assign(list, _list)
  const map = {}, tree = []
  for (let i = 0; i < list.length; i++) {
    map[list[i].id] = i
    list[i].children = []
  }
  for (let i = 0; i < list.length; i++) {
    const node = list[i]
    if (node[parentIdKey] !== 0) {
      // if you have dangling branches check that map[node.parentId] exists
      list[map[node[parentIdKey]]].children.push(node)
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
//           children: []
//          },
//         ],
//       },
//       { id: 4, parent_id: 1,, label: 'XX', children: [] },
//     ],
//   }
// ]
// keyValue = (node) => { id: node.id, parent_id: node.parent_id, label: node.label }
// =>
// [
//   { id: 1, parent_id: 0, label: 'Benci' },
//   { id: 2, parent_id: 1, permission: 'A1' },
// ]
export const tree2List = (node, keyValue = () => { }, path = [], result = []) => {
  if (!node.children.length) {
    result.push(path.concat(keyValue(node)))
  }
  for (const child of node.children) {
    tree2List(child, keyValue, path.concat(keyValue(node)), result)
  }
  return result
}