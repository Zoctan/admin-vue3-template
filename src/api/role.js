import request from '@/utils/request'

export function listRoleWithPermission(params) {
  return request({
    url: '/role/permission',
    method: 'get',
    params
  })
}

export function list(params) {
  return request({
    url: '/role',
    method: 'get',
    params
  })
}

export function listResourcePermission(params) {
  return request({
    url: '/permission',
    method: 'get',
    params
  })
}

export function add(params) {
  return request({
    url: '/role',
    method: 'post',
    params
  })
}

export function update(params) {
  return request({
    url: '/role',
    method: 'put',
    params
  })
}

export function remove(roleId) {
  return request({
    url: '/role/' + roleId,
    method: 'delete'
  })
}

export function updateAccountRole(params) {
  return request({
    url: '/account/role',
    method: 'put',
    params
  })
}
