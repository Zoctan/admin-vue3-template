import request from '@/utils/request'
import { baseUrl } from '@/utils/request'
import { getUrl } from '@/utils/url'

export function uploadUrl(data) {
  return getUrl(baseUrl + '/upload/add', data)
}

export function removeUrl(data) {
  return getUrl(baseUrl + '/upload/delete', data)
}

export function remove(data) {
  return request({
    url: '/upload/remove',
    method: 'DELETE',
    data: data
  })
}
