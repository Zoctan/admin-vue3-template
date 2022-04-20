import request from 'utils/request'
import { baseUrl } from 'utils/request'
import { buildUrl } from 'utils/url'

export function uploadUrl(data) {
  return buildUrl(baseUrl + '/upload/add', data)
}

export function removeUrl(data) {
  return buildUrl(baseUrl + '/upload/delete', data)
}

export function add(data, onUploadProgress) {
  return request({
    url: '/upload/add',
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
    onUploadProgress
  })
}

export function remove(data) {
  return request({
    url: '/upload/remove',
    method: 'DELETE',
    data: data
  })
}
