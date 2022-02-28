import request from '@/utils/request'

export function register(data) {
  return request({
    url: '/member/register',
    method: 'POST',
    data: data
  })
}

export function login(data) {
  return request({
    url: '/member/login',
    method: 'POST',
    data: data
  })
}

export function logout() {
  return request({
    url: '/member/logout',
    method: 'DELETE'
  })
}

export function refreshToken() {
  return request({
    url: '/member/refreshToken',
    method: 'PUT'
  })
}

export function profile() {
  return request({
    url: '/member/profile',
    method: 'GET'
  })
}

export function list(data) {
  return request({
    url: '/member/list',
    method: 'POST',
    data: data
  })
}

export function update(data) {
  return request({
    url: '/member/update',
    method: 'PUT',
    data: data
  })
}

export function remove(data) {
  return request({
    url: '/member/delete',
    method: 'DELETE',
    data: data
  })
}
