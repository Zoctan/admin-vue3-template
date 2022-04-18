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

export function updateList(data) {
  return request({
    url: `/${group}/updateList`,
    method: 'PUT',
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
    url: `/${group}/deleteList`,
    method: 'DELETE',
    data: data
  })
}

export function remove(data) {
  return request({
    url: `/${group}/delete`,
    method: 'DELETE',
    data: data
  })
}
