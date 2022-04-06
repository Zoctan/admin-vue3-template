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

export function updateMemberRole(data) {
  return request({
    url: '/memberRole/update',
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
