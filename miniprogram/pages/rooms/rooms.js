var app = getApp()
var sliderWidth = 96

Page({
  data: {
    rooms: [],
    gameType: 1,
    gameStatus: false,
    tabs: ['抵抗组织', '阿瓦隆', '刺秦'],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0
  },

  onLoad: function () {
    let that = this

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        })
      }
    })

    var _par = {
      lastId: 0,
      count: 10,
      tester: app.globalData.T
    }

    wx.request({
      url: 'http://localhost:5050/api/game/list',
      data: _par,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (response) {
        let res = response.data.data
        let self = that

        res.map(item => {
          let t = new Date(item.CreateTime * 1000)

          // item.config = config[item.PlayerCountLimit]
          item.status = item.GameInfo.Started
          item.time = t.getHours() + ':' + (t.getMinutes() < 10 ? '0' + t.getMinutes() : t.getMinutes())
          if (item.Public === 1) {
            self.data.rooms.push(item)
          }
        })
        that.setData({
          rooms: that.data.rooms
        })
      }
    })
  },

  startChange: function (e) {
    this.data.gameStatus = e.detail.value
    this.setData({
      gameStatus: this.data.gameStatus
    })
  },

  tabClick: function (e) {
    this.data.activeIndex = parseInt(e.currentTarget.id)
    this.data.gameType = this.data.activeIndex + 1
    this.setData({
      activeIndex: this.data.activeIndex,
      sliderOffset: e.currentTarget.offsetLeft,
      gameType: this.data.gameType
    })
  },

  joinRoom: function (e) {
    var id = e.currentTarget.dataset.id
    var that = this

    wx.request({
      url: 'http://localhost:5050/api/game/get_game',
      method: 'POST',
      data: {
        tester: app.globalData.T,
        id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        let game = res.data.data
        let id = game.Id

        if (game.PlayerCountLimit > game.PlayerList.length) {
          wx.request({
            url: 'http://localhost:5050/api/game/join_game',
            method: 'POST',
            data: {
              tester: app.globalData.T,
              id
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              app.globalData.G = res.data.data
              wx.navigateTo({
                url: '../room/room?id=' + id,
              })
            }
          })
        } else {
          if (game.OBList && game.OBList.some(item => item.openid === app.globalData.SU.Openid)) {
            wx.request({
              url: 'http://localhost:5050/api/game/get_game',
              method: 'POST',
              data: {
                tester: app.globalData.T,
                id
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success: function (res) {
                app.globalData.G = res.data.data
                app.globalData.OB = true
                wx.navigateTo({
                  url: '../room/room',
                })
              }
            })
          } else {
            wx.request({
              url: 'http://localhost:5050/api/game/ob_join_game',
              method: 'POST',
              data: {
                tester: app.globalData.T,
                id
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success: function (res) {
                app.globalData.G = res.data.data
                app.globalData.OB = true
                wx.navigateTo({
                  url: '../room/room',
                })
              }
            })
          }
        }
      }
    })
  }
})
