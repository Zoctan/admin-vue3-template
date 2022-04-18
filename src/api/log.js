import request from 'utils/request'

export function list(data) {
  return request({
    url: '/log/list',
    method: 'POST',
    data: data
  })
}

export function remove(data) {
  return request({
    url: '/log/delete',
    method: 'DELETE',
    data: data
  })
}
