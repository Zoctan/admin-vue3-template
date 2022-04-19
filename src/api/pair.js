import request from 'utils/request'

const group = 'pair'

export function getValue(data) {
  return request({
    url: `/${group}/getValue`,
    method: 'POST',
    data: data
  })
}

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

export function remove(data) {
  return request({
    url: `/${group}/remove`,
    method: 'DELETE',
    data: data
  })
}
