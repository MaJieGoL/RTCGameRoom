var app = getApp()

Page({
  data: {
    accounts: ['抵抗组织', '阿瓦隆', '刺秦'],
    accountIndex: 0,
    game: {
      GameType: '1',
      Public: 1, // 是否公开游戏
      VotePublishEnabled: 1, // 是否明票
      PlayerCountLimit: 5,
      ChatTimeLimit: 60,
      MakeGroupRoundLimit: 2, // 否决次数
      FullGameMakeGroupRoundLimit: 0, // 全局否决计数
      CardEnabled: 0 // 是否开启谋略卡
    }
  },

  gameTypeChanged: function(e) {
    console.log('picker account 发生选择改变，携带值为', e.detail.value);
    console.log(this)
    this.setData({
      accountIndex: e.detail.value
    })

    this.data.game.GameType = parseInt(this.data.accountIndex) + 1 + ''
  },

  showVoteChange: function (e) {
    if (e.detail.value) {
      this.data.game.VotePublishEnabled = 1
    } else {
      this.data.game.VotePublishEnabled = 0
    }
  },

  globalChange: function (e) {
    if (e.detail.value) {
      this.data.game.FullGameMakeGroupRoundLimit = 1
    } else {
      this.data.game.FullGameMakeGroupRoundLimit = 0
    }
  },

  publicChanged: function () {
    if (this.data.game.Public === 1) {
      this.data.game.FullGameMakeGroupRoundLimit = 1
      this.data.game.ChatTimeLimit = 60
      this.data.game.MakeGroupRoundLimit = 7

      if (this.data.game.GameType === '3') {
        this.data.game.VotePublishEnabled = 1
      }

      if (this.data.game.GameType === '2') {
        this.data.game.VotePublishEnabled = 1
      }

      if (this.data.game.GameType === '1' || this.data.game.GameType === '2') {
        this.data.game.FullGameMakeGroupRoundLimit = 0
        this.data.game.MakeGroupRoundLimit = 2
      }
    }
    this.setData({
      game: this.data.game
    })
  },

  playerCountChange: function (e) {
    this.data.game.PlayerCountLimit = e.detail.value
  },

  create: function () {
    if (this.data.game.GameType === '3') {
      wx.showModal({
        title: '提示',
        content: '刺秦游戏暂未开放'
      })
      return
    }

    if (this.data.game.FullGameMakeGroupRoundLimit) {
      if (this.data.game.MakeGroupRoundLimit < this.data.game.PlayerCountLimit - 1 || this.data.game.MakeGroupRoundLimit > this.data.game.PlayerCountLimit + 1) {
        wx.showModal({
          title: '提示',
          content: `否决次数应在${this.data.game.PlayerCountLimit - 1}和${this.data.game.PlayerCountLimit + 1}之间`
        })
        return
      }
    } else {
      if (this.data.game.MakeGroupRoundLimit < 2 || this.data.game.MakeGroupRoundLimit > 5) {
        wx.showModal({
          title: '提示',
          content: `否决次数应在2和5之间`
        })
        return
      }
    }

    this.data.game.Public = this.data.game.Public ? 1 : 0

    this.data.game.VotePublishEnabled = this.data.game.VotePublishEnabled ? 1 : 0

    this.data.game.FullGameMakeGroupRoundLimit = this.data.game.FullGameMakeGroupRoundLimit ? 1 : 0

    this.data.game.PlayerCountLimit = parseInt(this.data.game.PlayerCountLimit)

    var that = this

    wx.request({
      url: 'http://localhost:5050/api/game/create_game', //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        tester: app.globalData.T,
        GameType: that.data.game.GameType,
        Public: that.data.game.Public, // 是否公开游戏
        VotePublishEnabled: that.data.game.VotePublishEnabled, // 是否明票
        PlayerCountLimit: that.data.game.PlayerCountLimit,
        ChatTimeLimit: that.data.game.ChatTimeLimit,
        MakeGroupRoundLimit: that.data.game.MakeGroupRoundLimit, // 否决次数
        FullGameMakeGroupRoundLimit: that.data.game.FullGameMakeGroupRoundLimit, // 全局否决计数
        CardEnabled: that.data.game.CardEnabled // 是否开启谋略卡
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        app.globalData.G = res.data.data
        wx.request({
          url: 'http://localhost:5050/api/game/join_game',
          method: 'POST',
          data: {
            tester: app.globalData.T,
            id: app.globalData.G.Id
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            app.globalData.G = res.data.data
            wx.navigateTo({
              url: '../room/room',
            })
          }
        })
      }
    })
  }
})
