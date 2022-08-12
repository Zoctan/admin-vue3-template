export const getParam = (data) => {
    let url = ''
    for (const key in data) {
        let value = data[key] !== undefined ? data[key] : ''
        url += `&${key}=${encodeURIComponent(value)}`
    }
    return url ? url.substring(1) : ''
}

export const buildUrl = (url, data) => {
    const param = getParam(data)
    if (param === '') return url
    else return url + (url.indexOf('?') ? '?' : '') + param
}

export const object2FormData = (nestedObject, formData = new FormData()) => {
    const createFormData = (obj, subKeyStr = '') => {
        for (let i in obj) {
            const value = obj[i]
            const subKeyStrTrans = subKeyStr ? subKeyStr + '[' + i + ']' : i
            if (typeof (value) !== 'object') {
                formData.append(subKeyStrTrans, value)
            } else {
                createFormData(value, subKeyStrTrans)
            }
        }
    }
    createFormData(nestedObject)
    return formData
}