import ajax from '../../utils/ajax'
var app = getApp()

Component({
  properties: {
    game: {
      type: Object,
      value: {}
    },

    Display: {
      type: Object,
      value: {}
    },

    tmpPlayerList: {
      type: Object,
      value: {}
    }
  },

  data: {
    playerIdToKillMerlin: ''
  },

  methods: {
    selectPlayerToKillMerlin: function (e) {
      let id = e.currentTarget.dataset.identification
      this.data.playerIdToKillMerlin = id
      this.setData({
        playerIdToKillMerlin: this.data.playerIdToKillMerlin
      })
    },

    selectPlayerToKillQinwang: function (e) {
      let id = e.currentTarget.dataset.identification
      this.data.playerIdToKillQinwang = id
      this.setData({
        playerIdToKillMerlin: this.data.playerIdToKillQinwang
      })
    },

    killMerlin: function () {
      var _par = {}

      if (this.properties.game.GameType === 2) {
        _par = {
          merlinId: this.data.playerIdToKillMerlin,
          tester: app.globalData.T
        }
      } else {
        _par = {
          merlinId: this.data.playerIdToKillQinwang,
          tester: app.globalData.T
        }
      }

      var that = this

      ajax('POST', 'http://localhost:5050/api/game/kill_merlin', _par, function (response) {
        that.closeKillMerlin()
      })
    },

    closeKillMerlin: function () {
      this.properties.Display.ifShowKillMerlin = false
      this.properties.Display.ifShowKillQinwang = false
    }
  }
})
