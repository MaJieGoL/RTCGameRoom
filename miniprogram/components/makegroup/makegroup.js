const WAITING_FOR_LEADER_MAKE_GROUP = 3
var app = getApp()
import ajax from '../../utils/ajax'

Component({
  properties: {
    game: {
      type: Object,
      value: {}
    },
    Display: {
      type: Object,
      value: {}
    }
  },

  data: {
    ifselected: false,
    beSelectedPeopleNow: [],
    viewList: []
  },

  methods: {
    selectPlayerToMakeGroup: function (e) {
      let identification = e.currentTarget.dataset.identification
      var haveThisPlayer = false
      var i = -1

      this.data.ifselected = !this.data.ifselected
      this.data.beSelectedPeopleNow.map((item, index) => {
        if (this.data.beSelectedPeopleNow[index] === identification) {
          haveThisPlayer = true
          i = index
        }
      })

      if (!haveThisPlayer) {
        if (this.data.beSelectedPeopleNow.length >= this.properties.game.GameConfig.RoundGroupRules[this.properties.game.GameInfo.CurrentRound].GroupPlayerCount) {
          console.log('已达到最大组队人数')
          return
        }
        this.data.beSelectedPeopleNow.push(identification)
      } else {
        this.data.beSelectedPeopleNow.splice(i, 1)
      }

      this.data.viewList.length = this.properties.game.PlayerList.length
      this.data.viewList.fill(false)
      for (let i = 0; i < this.data.beSelectedPeopleNow.length; i++) {
        this.data.viewList[this.data.beSelectedPeopleNow[i] - 1] = true
      }
      this.setData({
        viewList: this.data.viewList
      })
    },

    sendMakeGroup: function () {
      if (this.properties.game.GameInfo.CurrentStep !== WAITING_FOR_LEADER_MAKE_GROUP) {
        console.log('目前不在选则组队阶段')
        return
      }

      if (this.data.beSelectedPeopleNow.length < this.properties.game.GameConfig.RoundGroupRules[this.properties.game.GameInfo.CurrentRound].GroupPlayerCount) {
        console.log('未达到规定组队人数')
        return
      }

      var _par = {
        list: this.data.beSelectedPeopleNow.join(','),
        tester: app.globalData.T
      }

      this.properties.Display.ifshowMakeGroup = false

      ajax('POST', 'http://localhost:5050/api/game/leader_make_group', _par, function (response) {
        console.log(response)
        console.log('已将队长组队信息发送')
      })
    }
  }
})
