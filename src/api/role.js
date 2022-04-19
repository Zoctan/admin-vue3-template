import request from 'utils/request'

const group = 'role'

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

export function listParent(data) {
  return request({
    url: `/${group}/listParent`,
    method: 'POST',
    data: data
  })
}

export function detail(data) {
  return request({
    url: `/${group}/detail`,
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

export function addMemberRole(data) {
  return request({
    url: `/${group}/addMemberRole`,
    method: 'POST',
    data: data
  })
}

export function removeMemberRole(data) {
  return request({
    url: `/${group}/removeMemberRole`,
    method: 'DELETE',
    data: data
  })
}
