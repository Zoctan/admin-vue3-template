import { getValue } from 'api/pair'

export default class Pair {
  static getValueByKey(key) {
    return new Promise((resolve, reject) => {
      getValue({ key: key })
        .then((response) => {
          resolve(response.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }
}