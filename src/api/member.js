import request from '@/utils/request'

export function search(params) {
  return request({
    url: '/member/search',
    method: 'post',
    params
  })
}

export function list(params) {
  return request({
    url: '/member',
    method: 'get',
    params
  })
}

export function validatePassword(params) {
  return request({
    url: '/member/password',
    method: 'post',
    params
  })
}

export function update(params) {
  return request({
    url: '/member/detail',
    method: 'put',
    params
  })
}

export function updatemember(params) {
  return request({
    url: '/member/' + params.Id,
    method: 'put',
    params
  })
}

export function remove(memberId) {
  return request({
    url: '/member/' + memberId,
    method: 'delete'
  })
}

export function register(memberForm) {
  return request({
    url: '/member',
    method: 'post',
    data: memberForm
  })
}

export function login(memberForm) {
  return request({
    url: '/member/token',
    method: 'post',
    data: memberForm
  })
}

export function detail() {
  return request({
    url: '/member/detail',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/member/token',
    method: 'delete'
  })
}
