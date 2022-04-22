import request from 'utils/request'

const group = 'rule'

export function add(data) {
  return request({
    url: `/${group}/add`,
    method: 'POST',
    data: data
  })
}

export function list(data) {
  return request({
    url: `/${group}/list`,
    method: 'POST',
    data: data
  })
}

export function update(data) {
  return request({
    url: `/${group}/update`,
    method: 'PUT',
    data: data
  })
}

export function removeList(data) {
  return request({
    url: `/${group}/removeList`,
    method: 'DELETE',
    data: data
  })
}

export function remove(data) {
  return request({
    url: `/${group}/remove`,
    method: 'DELETE',
    data: data
  })
}
