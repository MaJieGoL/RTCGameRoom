const app = getApp()
import ajax from '../../utils/ajax'

Component({
  properties: {
    playerInfo: {
      type: Object,
      value: {}
    },

    cacheFollow: {
      type: Array,
      value: []
    }
  },

  data: {
    ifFollowed: false
  },

  attached: function () {
    this.playerChange()
  },

  methods: {
    follow: function (e) {
      let openid = e.currentTarget.dataset.openid
      var that = this
      ajax('POST', 'http://localhost:5050/api/user/follow', {
        tester: app.globalData.T,
        openid: openid
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

    unfollow: function (e) {
      let openid = e.currentTarget.dataset.openid
      var that = this
      ajax('POST', 'http://localhost:5050/api/user/unfollow', {
        tester: app.globalData.T,
        openid: openid
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

    playerChange: function () {
      var flist = []
      var that = this
      ajax('GET', 'http://localhost:5050/api/user/follow_list', {
        tester: app.globalData.T
      }, function (res) {
        flist = res.data.data

        if (flist.some(item => {return item.ToOpenid === that.properties.playerInfo.openid})) {
          that.data.ifFollowed = true
        } else {
          that.data.ifFollowed = false
        }

        that.setData({
          ifFollowed: that.data.ifFollowed
        })
      })
    }
  }
})
