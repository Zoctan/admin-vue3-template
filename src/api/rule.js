import request from '@/utils/request'

export function add(data) {
  return request({
    url: '/rule/add',
    method: 'POST',
    data: data
  })
}

export function list(data) {
  return request({
    url: '/rule/list',
    method: 'POST',
    data: data
  })
}

export function updateList(data) {
  return request({
    url: '/rule/updateList',
    method: 'PUT',
    data: data
  })
}

export function update(data) {
  return request({
    url: '/rule/update',
    method: 'PUT',
    data: data
  })
}

export function remove(data) {
  return request({
    url: '/rule/delete',
    method: 'DELETE',
    data: data
  })
}
