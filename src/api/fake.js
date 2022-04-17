import request from 'utils/request'

export function getName() {
  return request({
    url: '/fake/getName',
    method: 'GET'
  })
}
