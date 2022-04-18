export function long2ip(proper_address) {
  var output = false
  if (!isNaN(proper_address) && (proper_address >= 0 || proper_address <= 4294967295)) {
    output =
      Math.floor(proper_address / Math.pow(256, 3)) + '.' +
      Math.floor((proper_address % Math.pow(256, 3)) / Math.pow(256, 2)) + '.' +
      Math.floor(((proper_address % Math.pow(256, 3)) % Math.pow(256, 2)) / Math.pow(256, 1)) + '.' +
      Math.floor((((proper_address % Math.pow(256, 3)) % Math.pow(256, 2)) % Math.pow(256, 1)) / Math.pow(256, 0));
  }
  return output
}

export function ip2long(ip_address) {
  var output = false
  var parts = []
  if (ip_address.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
    parts = ip_address.split('.');
    output = (parts[0] * 16777216 +
      (parts[1] * 65536) +
      (parts[2] * 256) +
      (parts[3] * 1));
  }
  return output
}  