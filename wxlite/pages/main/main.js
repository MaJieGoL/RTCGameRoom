// pages/main/main.js
var getlogininfo = require('../../getlogininfo.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    isGetLoginInfo: false,
    canShow: 0,
    tapTime: '',		// 防止两次点击操作间隔太快
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("onLoad");
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("onReady");
    if (!wx.createLivePlayerContext) {
      setTimeout(function () {
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后再试。',
          showCancel: false
        });
      }, 0);
    } else {
      // 版本正确，允许进入
      this.data.canShow = 1;
    };

    // 登录
    wx.showLoading({
      title: '登录信息获取中',
    })
    // rtcroom初始化
    var self = this;
    console.log(this.data);
    getlogininfo.getLoginInfo({
      type: 'multi_room',
      success: function (ret) {
        self.data.firstshow = false;
        self.data.isGetLoginInfo = true;
        console.log("getLoginInfo收到信息：",ret);
        self.setData({
          userInfo: ret
        });
        wx.hideLoading();
      },
      fail: function (ret) {
        self.data.isGetLoginInfo = false;
        wx.hideLoading();
        wx.showModal({
          title: '获取登录信息失败',
          content: ret.errMsg,
          showCancel: false,
          complete: function () {
            wx.navigateBack({});
          }
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})