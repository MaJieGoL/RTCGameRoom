export default function ajax (method, url, data, hundler) {
  wx.request({
    method,
    url,
    data,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: hundler
  })
}
