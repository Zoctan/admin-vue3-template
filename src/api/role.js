import request from '@/utils/request'

export function addRole(data) {
  return request({
    url: '/role/add',
    method: 'POST',
    data: data
  })
}

export function addRule(data) {
  return request({
    url: '/rule/add',
    method: 'POST',
    data: data
  })
}

export function listRole(data) {
  return request({
    url: '/role/list',
    method: 'POST',
    data: data
  })
}

export function listRule(data) {
  return request({
    url: '/rule/list',
    method: 'POST',
    data: data
  })
}

export function detail(data) {
  return request({
    url: '/rule/detail',
    method: 'POST',
    data: data
  })
}

export function updateRole(data) {
  return request({
    url: '/role/update',
    method: 'PUT',
    data: data
  })
}

export function updateRule(data) {
  return request({
    url: '/rule/update',
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
