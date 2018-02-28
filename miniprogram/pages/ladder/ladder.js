const app = getApp()
import ajax from '../../utils/ajax'

Page({
  data: {
    msgs: [],
    winRate: [],
    score: [],
    lv: [],
    ladder: []
  },

  onLoad: function () {
    let that = this

    ajax('GET', 'http://localhost:5050/api/game/ladder', {
      tester: app.globalData.T
    }, function (res) {
      that.data.ladder = res.data.data
      console.log(res.data.data)

      that.sortByWinRate()
    })
  },

  sortByWinRate: function () {
    this.data.msgs = []

    for (let i = 0; i < this.data.ladder.length; i++) {
      var ciqin = this.data.ladder[i].Analytics.Ciqin ? this.data.ladder[i].Analytics.Ciqin : {}
      var avalon = this.data.ladder[i].Analytics.Avalon ? this.data.ladder[i].Analytics.Avalon : {}
      var resistance = this.data.ladder[i].Analytics.Resistance ? this.data.ladder[i].Analytics.Resistance : {}

      var ciqinWin = (ciqin['六国阵营'] ? ciqin['六国阵营'].Win : 0) + (ciqin['秦国阵营'] ? ciqin['秦国阵营'].Win : 0)
      var ciqinLose = (ciqin['六国阵营'] ? ciqin['六国阵营'].Lose : 0) + (ciqin['秦国阵营'] ? ciqin['秦国阵营'].Lose : 0)
      var avalonWin = (avalon['抵抗组织'] ? avalon['抵抗组织'].Win : 0) + (avalon['间谍'] ? avalon['间谍'].Win : 0)
      var avalonLose = (avalon['抵抗组织'] ? avalon['抵抗组织'].Lose : 0) + (avalon['间谍'] ? avalon['间谍'].Lose : 0)
      var resistanceWin = (resistance['抵抗军'] ? resistance['抵抗军'].Win : 0) + (resistance['间谍'] ? resistance['间谍'].Win : 0)
      var resistanceLose = (resistance['抵抗军'] ? resistance['抵抗军'].Lose : 0) + (resistance['间谍'] ? resistance['间谍'].Lose : 0)

      var msg = {}
      msg.headimgurl = this.data.ladder[i].UserInfo.headimgurl
      msg.nickname = this.data.ladder[i].UserInfo.nickname
      msg.order = parseInt((((ciqinWin + avalonWin + resistanceWin) / (ciqinWin + avalonWin + resistanceWin + ciqinLose + avalonLose + resistanceLose)) * 100).toFixed(0))
      msg.openid = this.data.ladder[i].UserInfo.openid

      this.data.msgs.push(msg)
    }

    this.data.msgs.sort(this.sortByProperty('order'))

    for (let i = 0; i < this.data.msgs.length; i++) {
      this.data.msgs[i].order = this.data.msgs[i].order + '%'
    }

    this.setData({
      msgs: this.data.msgs
    })
  },

  // seeLeader: function (openid) {
  //   let that = this
  //   window.OU = 0
  //   ajax('get', `/api/user/profile/?${qs.stringify({tester: window.T, openid})}`, function (res) {
  //     window.OU = res.data.data.systemUser
  //     that.$router.push({name: 'Personal', parsms: {openid: window.OU.Openid}})
  //   })
  // },
  //
  // sortByScore: function () {
  //   this.msgs = []
  //
  //   for (let i = 0; i < this.ladder.length; i++) {
  //     var msg = {}
  //
  //     msg.headimgurl = this.ladder[i].UserInfo.headimgurl
  //     msg.nickname = this.ladder[i].UserInfo.nickname
  //     msg.order = this.ladder[i].Score
  //
  //     this.msgs.push(msg)
  //   }
  //
  //   this.msgs.sort(this.sortByProperty('order'))
  // },

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
  }
})
