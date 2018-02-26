// pages/multiroom/joinroom/joinroom.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gameRoomNum: '',
    roomID: '',
    userName: '',
    tapTime: ''
  },

  //绑定输入框
  bindGameRoomNum(e) {
    var self = this;
    var gameRoomNum = e.detail.value;
    var roomID = this.genRoomID(gameRoomNum);
    self.setData({
      gameRoomNum: gameRoomNum,
      roomID: roomID
    })
  },

  //根据游戏房间号gameRoomNum生成roomID
  genRoomID(gameRoomNum) {
    return 'room_' + gameRoomNum;
  },

  //进入rtcroom页面
  join: function () {
    var self = this;
    // 防止两次点击操作间隔太快
    var nowTime = new Date();
    if (nowTime - this.data.tapTime < 1000) {
      return;
    };
    if (/[<>*{}()^%$#@!~&= ]/.test(self.data.gameRoomNum) || !self.data.gameRoomNum) {
      wx.showModal({
        title: '提示',
        content: '房间号不能为空或包含特殊字符',
        showCancel: false
      });
      return;
    };
    var url = '../room/room?type=join&roomID=' + self.data.roomID + '&roomName=' + self.data.roomName + '&userName=' + self.data.userName;
    wx.redirectTo({
      url: url
    });
    wx.showToast({
      title: '进入房间',
      icon: 'success',
      duration: 1000
    })
    self.setData({ 'tapTime': nowTime });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userName: options.userName || ''
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
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
    return {
      title: '输入房间号加入房间',
      path: '/pages/multiroom/joinroom/joinroom',
      imageUrl: '../../Resources/share.png'
    }
  }
})