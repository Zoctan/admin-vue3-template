import request from 'utils/request'

export function add(data) {
  return request({
    url: '/role/add',
    method: 'POST',
    data: data
  })
}

export function list(data) {
  return request({
    url: '/role/list',
    method: 'POST',
    data: data
  })
}

export function listParent(data) {
  return request({
    url: '/role/listParent',
    method: 'POST',
    data: data
  })
}

export function detail(data) {
  return request({
    url: '/role/detail',
    method: 'POST',
    data: data
  })
}

export function update(data) {
  return request({
    url: '/role/update',
    method: 'PUT',
    data: data
  })
}

export function remove(data) {
  return request({
    url: '/role/delete',
    method: 'DELETE',
    data: data
  })
}

export function addMemberRole(data) {
  return request({
    url: '/role/addMemberRole',
    method: 'POST',
    data: data
  })
}

export function deleteMemberRole(data) {
  return request({
    url: '/role/deleteMemberRole',
    method: 'DELETE',
    data: data
  })
}
