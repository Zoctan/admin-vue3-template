import request from '@/utils/request'

export function checkExist(data) {
  return request({
    url: '/member/checkExist',
    method: 'POST',
    data: data
  })
}

export function checkOldPassword(data) {
  return request({
    url: '/member/checkOldPassword',
    method: 'POST',
    data: data
  })
}

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

export function updatePassword(data) {
  return request({
    url: '/member/updatePassword',
    method: 'PUT',
    data: data
  })
}

export function updateProfile(data) {
  return request({
    url: '/member/updateProfile',
    method: 'PUT',
    data: data
  })
}

export function updateDetail(data) {
  return request({
    url: '/member/updateDetail',
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
