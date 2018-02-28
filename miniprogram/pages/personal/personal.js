const app = getApp()
import ajax from '../../utils/ajax'

Page({
  data: {
    tabs: ['阿瓦隆', '抵抗组织', '刺秦'],
    SystemUser: {},
    ciqinWinRate: 0,
    avalonWinRate: 0,
    resistanceWinRate: 0,
    score: 0,
    allWinRate: 0,
    typeRate: 0,
    typeNum: 0,
    ciqinWin: 0,
    ciqinLose: 0,
    avalonWin: 0,
    avalonLose: 0,
    resistanceWin: 0,
    resistanceLose: 0,
    recentGameList: [],
    other: false,
    myFollowList: [],
    win: {},
    ifFollowed: false
  },

  onLoad: function (options) {
    var that = this

    if (app.globalData.OU) {
      this.data.SystemUser = app.globalData.OU
    } else {
      this.data.SystemUser = JSON.parse(app.globalData.SU)
    }

    var ciqin = this.data.SystemUser.Analytics.Ciqin ? this.data.SystemUser.Analytics.Ciqin : {}
    var avalon = this.data.SystemUser.Analytics.Avalon ? this.data.SystemUser.Analytics.Avalon : {}
    var resistance = this.data.SystemUser.Analytics.Resistance ? this.data.SystemUser.Analytics.Resistance : {}

    this.data.ciqinWin = (ciqin['六国阵营'] ? ciqin['六国阵营'].Win : 0) + (ciqin['秦国阵营'] ? ciqin['秦国阵营'].Win : 0)
    this.data.ciqinLose = (ciqin['六国阵营'] ? ciqin['六国阵营'].Lose : 0) + (ciqin['秦国阵营'] ? ciqin['秦国阵营'].Lose : 0)
    this.data.avalonWin = (avalon['抵抗组织'] ? avalon['抵抗组织'].Win : 0) + (avalon['间谍'] ? avalon['间谍'].Win : 0)
    this.data.avalonLose = (avalon['抵抗组织'] ? avalon['抵抗组织'].Lose : 0) + (avalon['间谍'] ? avalon['间谍'].Lose : 0)
    this.data.resistanceWin = (resistance['抵抗军'] ? resistance['抵抗军'].Win : 0) + (resistance['间谍'] ? resistance['间谍'].Win : 0)
    this.data.resistanceLose = (resistance['抵抗军'] ? resistance['抵抗军'].Lose : 0) + (resistance['间谍'] ? resistance['间谍'].Lose : 0)

    this.data.ciqinWinRate = ((this.data.ciqinWin / (this.data.ciqinWin + this.data.ciqinLose)) * 100).toFixed(0) + '%'
    this.data.avalonWinRate = ((this.data.avalonWin / (this.data.avalonWin + this.data.avalonLose)) * 100).toFixed(0) + '%'
    this.data.resistanceWinRate = ((this.data.resistanceWin / (this.data.resistanceWin + this.data.resistanceLose)) * 100).toFixed(0) + '%'
    this.data.allWinRate = (((this.data.ciqinWin + this.data.avalonWin + this.data.resistanceWin) / (this.data.ciqinWin + this.data.avalonWin + this.data.resistanceWin + this.data.ciqinLose + this.data.avalonLose + this.data.resistanceLose)) * 100).toFixed(0) + '%'
    this.data.score = this.data.SystemUser.Score
    this.data.typeRate = this.data.avalonWinRate
    this.data.typeNum = this.data.avalonWin + this.data.avalonLose
    this.data.win = app.globalData.OU

    if (app.globalData.OU) {
      ajax('GET', 'http://localhost:5050/api/user/get_recentgame_list', {
        tester: app.globalData.T,
        openid: options.openid
      }, function (res) {
        that.getRecentgame(res)
      })
    } else {
      ajax('GET', 'http://localhost:5050/api/user/get_recentgame_list', {
        tester: app.globalData.T
      }, function (res) {
        that.getRecentgame(res)
      })
    }

    ajax('GET', 'http://localhost:5050/api/user/follow_list', {
      tester: app.globalData.T
    }, function (res) {
      res.data.data.map(item => {
        that.data.myFollowList.push(item.ToOpenid)
      })

      that.data.ifFollowed = that.data.myFollowList.indexOf(that.data.SystemUser.Openid) + 1

      that.setData({
        SystemUser: that.data.SystemUser,
        ifFollowed: that.data.ifFollowed,
        win: that.data.win,
        score: that.data.score,
        allWinRate: that.data.allWinRate
      })
    })
  },

  getRecentgame: function (res) {
    let recentGame = []

    res.data.data.map(item => {
      recentGame.push(item.GameId)
    })

    let self = this

    for (let i = 0; i < recentGame.length; i++) {
      ajax('POST', 'http://localhost:5050/api/game/get_game', {
        tester: app.globalData.T,
        id: recentGame[i],
        force: true
      }, function (res) {
        let g = {}
        g = res.data.data
        g.IsMVP = false
        let time = new Date(g.CreateTime * 1000)

        let m = time.getMonth() + 1
        let d = time.getDate()
        let h = time.getHours()
        let mm = time.getMinutes()

        g.time = `${m}-${d} ${h}:${mm}`
        g.type = g.GameType

        g.PlayerList.map(item => {
          if (item.WeixinUserInfo.openid === self.data.SystemUser.Openid) {
            g.Faction = item.Faction
            g.sex = item.WeixinUserInfo.sex
            if (item.Identification === g.GameLog.MvpIdentification) {
              g.IsMVP = true
            }

            if (g.GameType === 3) {
              g.role = item.CiqinRole.Identification
              g.roleName = item.CiqinRole.Name
              if (!g.role) {
                g.role = 'Z'
              }
            }

            if (g.GameType === 2) {
              g.role = item.AvalonRole.Identification
            }
          }
        })
        self.data.recentGameList.push(g)

        self.data.recentGameList.sort(self.sortByProperty('Id'))

        self.setData({
          recentGameList: self.data.recentGameList
        })
      })
    }
  },

  sortByProperty: function (propertyName) {
    return function (obj1, obj2) {
      var val1 = obj1[propertyName]
      var val2 = obj2[propertyName]

      if (val1 < val2) {
        return 1
      } else if (val1 > val2) {
        return -1
      } else {
        return 0
      }
    }
  },

  follow: function () {
    var that = this

    ajax('POST', 'http://localhost:5050/api/user/follow', {
      tester: app.globalData.T,
      openid: this.data.SystemUser.Openid
    }, function (res) {
      if (res.data.err_code !== 0) {
        wx.showModal({
          title: '提示',
          content: '网络错误，关注失败'
        })
      } else {
        that.data.ifFollowed = true

        that.setData({
          ifFollowed: that.data.ifFollowed
        })
      }
    })
  },

  unfollow: function () {
    var that = this

    ajax('POST', 'http://localhost:5050/api/user/unfollow', {
      tester: app.globalData.T,
      openid: this.data.SystemUser.Openid
    }, function (res) {
      if (res.data.err_code !== 0) {
        wx.showModal({
          title: '提示',
          content: '网络错误，取消关注失败'
        })
      } else {
        that.data.ifFollowed = false

        that.setData({
          ifFollowed: that.data.ifFollowed
        })
      }
    })
  },
})
