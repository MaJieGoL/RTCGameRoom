const app = getApp()
import ajax from '../../utils/ajax'

Page({
  data: {
    followList: [],
    followMsg: []
  },

  onLoad: function () {
    var that = this

    ajax('GET', 'http://localhost:5050/api/user/follow_list', {
      tester: app.globalData.T
    }, function (res) {
      that.data.followList = res.data.data

      var self = that

      for (let i = 0; i < that.data.followList.length; i++) {
        if (that.data.followList[i].ToOpenid === '[object Object]') continue
        ajax('GET', 'http://localhost:5050/api/user/profile', {
          tester: app.globalData.T,
          openid: that.data.followList[i].ToOpenid
        }, function (res) {
          var su = res.data.data.systemUser

          var ciqin = su.Analytics.Ciqin ? su.Analytics.Ciqin : {}
          var avalon = su.Analytics.Avalon ? su.Analytics.Avalon : {}
          var resistance = su.Analytics.Resistance ? su.Analytics.Resistance : {}

          var ciqinWin = (ciqin['六国阵营'] ? ciqin['六国阵营'].Win : 0) + (ciqin['秦国阵营'] ? ciqin['秦国阵营'].Win : 0)
          var ciqinLose = (ciqin['六国阵营'] ? ciqin['六国阵营'].Lose : 0) + (ciqin['秦国阵营'] ? ciqin['秦国阵营'].Lose : 0)
          var avalonWin = (avalon['抵抗组织'] ? avalon['抵抗组织'].Win : 0) + (avalon['间谍'] ? avalon['间谍'].Win : 0)
          var avalonLose = (avalon['抵抗组织'] ? avalon['抵抗组织'].Lose : 0) + (avalon['间谍'] ? avalon['间谍'].Lose : 0)
          var resistanceWin = (resistance['抵抗军'] ? resistance['抵抗军'].Win : 0) + (resistance['间谍'] ? resistance['间谍'].Win : 0)
          var resistanceLose = (resistance['抵抗军'] ? resistance['抵抗军'].Lose : 0) + (resistance['间谍'] ? resistance['间谍'].Lose : 0)

          var info = {}

          info.allWinRate = (((ciqinWin + avalonWin + resistanceWin) / (ciqinWin + avalonWin + resistanceWin + ciqinLose + avalonLose + resistanceLose)) * 100).toFixed(0) + '%'
          info.nickname = su.UserInfo.nickname
          info.score = su.Score
          info.headimgurl = su.UserInfo.headimgurl
          info.openid = su.Openid

          self.data.followMsg.push(info)
          self.data.followMsg.sort(function (a, b) {
            return b.score - a.score
          })

          self.setData({
            followMsg: self.data.followMsg
          })
        })
      }
    })
  },

  seeInfo: function (e) {
    let that = this
    let openid = e.currentTarget.dataset.openid
    app.globalData.OU = 0

    ajax('GET', 'http://localhost:5050/api/user/profile', {
      tester: app.globalData.T,
      openid: openid
    }, function (res) {
      console.log(res)
      app.globalData.OU = res.data.data.systemUser
      wx.navigateTo({
        url: '../personal/personal?openid=' + app.globalData.OU.Openid,
      })
    })
  }
})
