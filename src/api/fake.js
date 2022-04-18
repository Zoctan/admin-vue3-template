import request from 'utils/request'

const group = 'fake'

export function getName() {
  return request({
    url: `/${group}/getName`,
    method: 'GET'
  })
}
