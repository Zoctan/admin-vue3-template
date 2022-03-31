export const getParam = (data) => {
    let url = '';
    for (const k in data) {
        let value = data[k] !== undefined ? data[k] : ''
        url += `&${k}=${encodeURIComponent(value)}`
    }
    return url ? url.substring(1) : ''
}

export const getUrl = (url, data) => {
    const param = getParam(data)
    if (param == '') return url
    else return url + (url.indexOf('?') ? '?' : '') + getParam(data)
}