const app = getApp()

Page({
  data: {
    player: 0,
    players: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    game: null
  },

  playerChange: function (e) {
    for (let key in app.globalData) {
      app.globalData[key] = null
    }

    this.setData({
      player: e.detail.value
    })

    this.data.player = e.detail.value

    let that = this

    wx.request({
      url: 'http://localhost:5050',
      data: {
        tester: that.data.player
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        let parser = new DOMParser()
        let doc = parser.parseFromString(res.data, "text/html")
        let datas = doc.getElementsByTagName('script')[0].childNodes[0].data.split('\n')
        let result = {}
        for (let i = 0; i < datas.length; i++) {
          if (datas[i].split('=')[1]) {
            let item = datas[i].split('=')
            let itemKey = ''.slice.call(item[0].trim(), 4)
            let itemValue = item[1].split("'")[1]
            if (itemValue.length && itemKey !== 'G') result[itemKey] = JSON.parse(itemValue.replace(/\\x22/g, '"'))
          }
        }

        app.globalData.U = result.U
        app.globalData.SU = result.SU
        app.globalData.T = result.T

        let self = that

        wx.request({
          url: 'http://localhost:5050/api/user/get_game',
          data: {
            tester: app.globalData.T,
            openid: app.globalData.U.openid
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            if (res.data.err_code === 0) {
              app.globalData.G = res.data.data
              self.data.game = app.globalData.G
              self.setData({
                game: self.data.game
              })
            }
          }
        })
      }
    })
  },

  goCreate: function () {
    wx.navigateTo({
      url: '../create/create',
    })
  },

  goRooms: function () {
    wx.navigateTo({
      url: '../rooms/rooms',
    })
  },

  goFollow: function () {
    wx.navigateTo({
      url: '../follow/follow'
    })
  },

  goLadder: function () {
    wx.navigateTo({
      url: '../ladder/ladder'
    })
  },

  continueGame: function () {
    wx.navigateTo({
      url: '../room/room',
    })
  }
})
