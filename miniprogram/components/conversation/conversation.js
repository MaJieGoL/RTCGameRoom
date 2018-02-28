const WAITING_FOR_MAKE_GROUP_VOTE = 4
const WAITING_FOR_MISSION_VOTE = 5

import ajax from '../../utils/ajax'
var app = getApp()

Component({
  properties: {
    conversation: {
      type: Array,
      value: []
    },

    Display: {
      type: Object,
      value: {}
    },

    game: {
      type: Object,
      value: {}
    },

    player: {
      type: Object,
      value: {}
    },

    showImportant: {
      type: Boolean,
      value: {}
    }
  },

  data: {
    choose: '',
    myMvpVote: '',
    ifVotedMvp: false,
    game: null,
    player: null,
    OB: false
  },

  attached: function () {
    this.data.game = this.properties.game
    this.data.player = this.properties.player
    this.data.OB = app.globalData.OB
    this.setData({
      game: this.data.game,
      player: this.data.player,
      OB: this.data.OB
    })
  },

  methods: {
    agreeMakeGroup: function () {
      var _par = {
        vote: 1,
        tester: app.globalData.T
      }

      var that = this

      ajax('POST', 'http://localhost:5050/api/game/make_group_vote', _par, function (response) {
        that.closeMakeGroupVote()

        if (response.data.data.GameInfo.CurrentStep === WAITING_FOR_MAKE_GROUP_VOTE) {
          console.log('投票成功，等待其他玩家投票')
        }
      })
    },

    disagreeMakeGroup: function () {
      var _par = {
        vote: 0,
        tester: app.globalData.T
      }

      var that = this

      ajax('POST', 'http://localhost:5050/api/game/make_group_vote', _par, function (response) {
        that.closeMakeGroupVote()

        if (response.data.data.GameInfo.CurrentStep === WAITING_FOR_MAKE_GROUP_VOTE) {
          console.log('投票成功，等待其他玩家投票')
        }
      })
    },

    closeMakeGroupVote: function () {
      this.properties.ifShowMakeGroupVote = false
    },

    agreeMission: function () {
      var _par = {
        vote: 1,
        tester: app.globalData.T
      }

      var that = this
      console.log(this.properties)
      ajax('POST', 'http://localhost:5050/api/game/mission_vote', _par, function (response) {
        // that.closeMissionVote()
        if (response.data.data.GameInfo.CurrentStep === WAITING_FOR_MISSION_VOTE) {
          if (!that.properties.game.GameInfo.Finished && that.properties.game.GameInfo.Started) {
            console.log('投票成功，等待其他玩家投票')
          }
        }
      })
    },

    disagreeMission: function () {
      var _par = {
        vote: 0,
        tester: app.globalData.T
      }

      var that = this

      ajax('POST', 'http://localhost:5050/api/game/mission_vote', _par, function (response) {
        // that.closeMissionVote()
        if (response.data.data.GameInfo.CurrentStep === WAITING_FOR_MISSION_VOTE) {
          console.log('投票成功，等待其他玩家投票')
        }
      })
    },

    chooseMvp: function (e) {
      let id = e.currentTarget.dataset.identification
      console.log(this.properties)
      if (this.properties.player.Identification === id) {
        console.log('不能选自己')
        return
      }

      this.data.choose = id
      this.data.myMvpVote = id
      console.log(this.data)
      this.setData({
        choose: this.data.choose,
        myMvpVote: this.data.myMvpVote
      })
    },

    sendMvp: function () {
      if (!this.data.myMvpVote || this.data.myMvpVote === this.properties.player.Identification) {
        return
      }

      var _par = {
        playerId: this.data.myMvpVote,
        tester: app.globalData.T,
        gameId: this.properties.game.Id
      }

      var that = this

      ajax('POST', 'http://localhost:5050/api/game/mvp_vote', _par, function (response) {
        that.data.ifVotedMvp = true

        that.setData({
          ifVotedMvp: that.data.ifVotedMvp
        })
      })
    },

    outgame: function () {
      let that = this
      if (this.properties.player.WeixinUserInfo.openid !== this.properties.game.CreateOpenid) {
        ajax('POST', 'http://localhost:5050/api/game/out_game', {
          tester: app.globalData.T
        }, function (response) {
          if (res.data.err_code === -3) {
            wx.showModal({
              title: '提示',
              content: '退出游戏失败'
            })
          } else {
            app.globalData.G = ''
            wx.navigateTo({
              url: '../index/index',
            })
          }
        })
      } else {
        ajax('POST', 'http://localhost:5050/api/game/send_command', {
          tester: app.globalData.T,
          command: 'dismiss_game'
        }, function (response) {
          app.globalData.G = ''
          wx.navigateTo({
            url: '../index/index',
          })
        })
      }
    }
  }
})
