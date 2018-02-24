const CONF = {
  port: '5757',
  rootPathname: '',

  // 微信小程序 App ID
  appId: 'wx72faf0a41a541e0d',

  // 微信小程序 App Secret
  appSecret: '1ee600add0d66ea80ab9546fb6283e00',

  // 是否使用腾讯云代理登录小程序
  useQcloudLogin: false,

  /**
   * 需要开通云直播服务 
   * 参考指引 @https://cloud.tencent.com/document/product/454/7953#1.-.E8.A7.86.E9.A2.91.E7.9B.B4.E6.92.AD.EF.BC.88lvb.EF.BC.89
   * 有介绍bizid 和 pushSecretKey的获取方法。
   */
  live: {
    // 云直播 appid 
    appID: 1255946708,

    // 云直播 bizid 
    bizid: 20231,

    // 云直播 推流防盗链key
    pushSecretKey: '48bbbc4782e4570022a7d9b337561299',

    // 云直播 API鉴权key
    APIKey: '364e4538b70567d8dbb700d92cc609cd',

    // 云直播 推流有效期单位秒 默认7天 
    validTime: 3600 * 24 * 7
  },

  /**
   * 需要开通云通信服务
   * 参考指引 @https://cloud.tencent.com/document/product/454/7953#3.-.E4.BA.91.E9.80.9A.E8.AE.AF.E6.9C.8D.E5.8A.A1.EF.BC.88im.EF.BC.89
   * 有介绍appid 和 accType的获取方法。以及私钥文件的下载方法。
   */
  im: {
    // 云通信 sdkappid
    sdkAppID: 1400063010,

    // 云通信 账号集成类型
    accountType: "21846",

    // 云通信 管理员账号
    administrator: "admin",

    // 云通信 派发usersig的RSA 私钥
    privateKey: "-----BEGIN PRIVATE KEY-----\r\n" +
    "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgbTa5JsSAwYSTfA6/\r\n" +
    "pmuK+Ngavy8soMnZqbBWnPNKuT+hRANCAAQm1I91oq1cGEMcVEFEwMbBDA/rQ1aV\r\n" +
    "jRdaFIEArdbaXuE3jYTO4eMo3mzzEGXQam9VOgOvBpObjH6WpMgICmOU\r\n" +
    "-----END PRIVATE KEY-----\r\n"
  },

  /**
   * MySQL 配置，用来存储 session 和用户信息
   * 若使用了腾讯云微信小程序解决方案
   * 开发环境下，MySQL 的初始密码为您的微信小程序 appid
   */
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    db: 'cAuth',
    pass: '',
    char: 'utf8mb4'
  },

  cos: {
    /**
     * 区域
     * 华北：cn-north
     * 华东：cn-east
     * 华南：cn-south
     * 西南：cn-southwest
     * 新加坡：sg
     * @see https://www.qcloud.com/document/product/436/6224
     */
    region: 'cn-south',
    // Bucket 名称
    fileBucket: 'wximg',
    // 文件夹
    uploadFolder: ''
  },

  /**
   * 多人音视频房间相关参数
   */
  multi_room: {
    // 房间容量上限
    maxMembers: 4,

    // 心跳超时 单位秒
    heartBeatTimeout: 20,

    // 空闲房间超时 房间创建后一直没有人进入，超过给定时间将会被后台回收，单位秒
    maxIdleDuration: 30
  },

  /**
   * 双人音视频房间相关参数
   */
  double_room: {
    // 心跳超时 单位秒
    heartBeatTimeout: 20,

    // 空闲房间超时 房间创建后一直没有人进入，超过给定时间将会被后台回收，单位秒
    maxIdleDuration: 30
  },

  /**
   * 直播连麦房间相关参数
   */
  live_room: {
    // 房间容量上限
    maxMembers: 4,

    // 心跳超时 单位秒
    heartBeatTimeout: 20,

    // 空闲房间超时 房间创建后一直没有人进入，超过给定时间将会被后台回收，单位秒
    maxIdleDuration: 30
  },

  /**
   * 辅助功能 后台日志文件获取相关 当前后台服务的访问域名。
   */
  selfHost: "https://drourwkp.qcloud.la",

  // 微信登录态有效期
  wxLoginExpires: 7200
}

module.exports = process.env.NODE_ENV === 'local' ? Object.assign({}, CONF, require('./config.local')) : CONF;
