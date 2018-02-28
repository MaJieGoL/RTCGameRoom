var app = getApp()

const FREE_CHAT = 1
const WAITING_FOR_LEADER_MAKE_GROUP = 3
const WAITING_FOR_MAKE_GROUP_VOTE = 4
const WAITING_FOR_MISSION_VOTE = 5
const WAITING_FOR_BADGUYS_FREE_CHAT = 20
const WAITING_FOR_KILL_MERLIN = 21

var timePromise

import io from '../../socket.io'
import sortPlayer from '../../utils/sortPlayer'
import ajax from '../../utils/ajax'
import config from './config'

Page({
  data: {
    id: 0,
    game: null,
    conversation: [],
    user: null,
    player: {},
    message: '',
    readyList: [],
    ifMVPed: false,
    interrupt: false,
    getReady: false,
    cancelReady: false,
    start: false,
    waitAllReady: false,
    gameLog: {},
    progressBar: [],
    secondLeft: 0,
    Display: {
      ifshowMakeGroup: false,
      ifShowActions: false,
      ifShowKillMerlin: false,
      ifShowKillQinwang: false,
      ifShowOBSay: true
    },
    ifShowInfo: false,
    mvpVote: 0,
    startKill: false,
    startThrow: false,
    playerToOB: false,
    obOutGame: false,
    OBJoinGame: false,
    out_1: false,
    out_2: false,
    agreeThrow: false,
    disagreeThrow: false,
    isAssassin: false,
    throwing: false,
    throwVoted: false,
    throwingFaction: 0,
    tmpPlayerList: {},
    readyListObj: {},
    ciqinWin: 0,
    ciqinLose: 0,
    avalonWin: 0,
    avalonLose: 0,
    resistanceWin: 0,
    resistanceLose: 0,
    allWinRate: 0,
    playerInfo: {},
    cacheFollow: [],
    showImportant: false,
  },

  onLoad: function (options) {
    this.data.user = app.globalData.U

    if (options.id) {
      this.data.id = options.id
    } else {
      this.data.id = app.globalData.G.Id
    }
    this.data.game = app.globalData.G
    this.data.game.PlayerList = sortPlayer(this.data.game.PlayerList)
    var length = this.data.game.PlayerList.length
    for (let i = 0; i < length; i++) {
      if (this.data.game.PlayerList[i].SystemUser.UserInfo.openid === this.data.user.openid) {
        this.data.player = this.data.game.PlayerList[i]
        break
      }
    }

    if (this.data.game.CreateOpenid !== this.data.user.openid && !app.globalData.OB) {
      this.getReady()
    }

    let that = this

    ajax('POST', 'http://localhost:5050/api/game/get_ready_playerlist', {
      tester: app.globalData.T,
      id: this.data.game.Id
    }, function (res) {
      that.data.readyList = Object.values(res.data.data)
      that.data.readyListObj = {}
      for (let i = 0; i < that.data.readyList.length; i++) {
        that.data.readyListObj[that.data.readyList[i]] = true
      }

      that.setData({
        readyList: that.data.readyList,
        readyListObj: that.data.readyListObj
      })
    })

    this.setData({
      player: this.data.player
    })

    this.updateControlBtn()
    this.init_channel()
  },

  init_channel: function () {
    var that = this

    var socket = io('ws://localhost:3000/?token=' + this.data.game.ChannelName)

    if (this.isPlayer()) {
      ajax('POST', 'http://localhost:5050/api/game/send_command', {
        tester: app.globalData.T,
        command: 'join'
      }, function (response) {

      })
    } else {
      ajax('POST', 'http://localhost:5050/api/game/ob_send_command', {
        tester: app.globalData.T,
        command: 'ob_join'
      }, function (response) {

      })
    }

    socket.on('connect', function () {
      that.onOpened()
    })
    socket.on('message', function (data) {
      that.onMessage(data)
    })
    socket.on('connect_error', function (data) {
      console.log('connect_error')
      console.log(data)
    })
    socket.on('connect_timeout', function (data) {
      console.log('connect_timeout')
      console.log(data)
    })
    socket.on('error', function (data) {
      console.log('error')
      console.log(data)
    })
    socket.on('disconnect', function (data) {
      console.log('disconnect')
      console.log(data)
    })
    socket.on('reconnect', function (data) {
      console.log('reconnect')
      console.log(data)
    })
    socket.on('reconnect_attempt', function (data) {
      console.log('reconnect_attempt')
      console.log(data)
    })
    socket.on('reconnecting', function (data) {
      console.log('reconnecting')
      console.log(data)
    })
    socket.on('reconnect_error', function (data) {
      console.log('reconnect_error')
      console.log(data)
    })
    socket.on('reconnect_failed', function (data) {
      console.log('reconnect_failed')
      console.log(data)
    })
  },

  onOpened: function () {
    if (!this.data.progressBar.length) {
      this.data.progressBar = config[this.data.game.PlayerCountLimit]
    }

    this.setData({
      progressBar: this.data.progressBar
    })
  },

  onMessage: function (data) {
    console.log('来了一条消息看一下：', data)
    let that = this
    if (data._gameInfo !== undefined) {
      this.data.game.GameInfo = data._gameInfo
    }
    ajax('POST', 'http://localhost:5050/api/game/get_game', {
      tester: app.globalData.T,
      id: this.data.game.Id
    }, function (response) {
      var game = response.data.data
      var plist = []

      that.data.game = game

      that.data.game.PlayerList.length = that.data.game.PlayerList.length
      for (let i = 0; i < that.data.game.PlayerList.length; i++) {
        if (that.data.game.PlayerList[i]) {
          plist.push(that.data.game.PlayerList[i])
        }
      }

      that.data.game.PlayerList = plist
      that.data.game.PlayerList = sortPlayer(that.data.game.PlayerList)

      for (let i = 0; i < that.data.game.PlayerList; i++) {
        if (that.data.game.PlayerList[i].SystemUser.UserInfo.openid === that.data.user.openid) {
          that.data.player = that.data.game.PlayerList[i]
          break
        }
      }

      if (!app.globalData.OB) {
        if (that.data.player) {
          that.data.player = that.getPlayerByOpenid(that.data.user.openid)
          if (that.data.player.AvalonRole.Identification === 'D' || that.data.player.CiqinRole.Identification === 'D') {
            that.data.isAssassin = true
          }
        } else {
          that.data.isAssassin = false
        }
      }
      console.log('每次来了一条消息，都会更新一下game对象，看一下game发生了什么变化吧：', that.data.game)
      that.setData({
        game: that.data.game
      })

      that.updateControlBtn()
    })

    if (this.data.game.GameInfo.Finished || !this.data.game.GameInfo.Started && data.action !== 'finishGame' && data.action !== 'finishKillMerlin') {
      if (this.data.game.GameInfo.Finished && this.data.game.GameInfo.Started) {
        let msg = {}

        msg.time = Date.now()
        msg.type = 'mvpVote'
        msg.game = this.data.game
        msg.id = this.generateUUID()
        if (this.data.mvpVote === 0) {
          this.data.conversation.push(msg)
          this.data.mvpVote ++
        }
      }
    }

    this.setData({
      conversation: this.data.conversation
    })

    if (data.message && data.message[0] === '{' && JSON.parse(data.message).id) {
      data.action = JSON.parse(data.message).action
    } else {
      data.action = data.action === 'commandMessage' ? data.message : data.action
    }

    switch (data.action) {
      case 'join':
        {
          let nickname
          let that = this
          ajax('POST', 'http://localhost:5050/api/game/get_game', {
            tester: app.globalData.T,
            id: data._gameId
          }, function (res) {
            res.data.data.PlayerList.map(item => {
              if (item.WeixinUserInfo.openid === data.openid) {
                nickname = item.WeixinUserInfo.nickname
              }
            })
            that.showSystemMessage(`${nickname}加入了房间`)
          })
        }

        break

      case 'all_players_entered':
        {
          this.data.gameLog = {}

          this.data.readyList = []
          this.data.ifMVPed = false

          var time

          for (let i = 0; i < this.data.conversation.length; i++) {
            let n
            if (this.data.conversation[i].message) {
              n = this.data.conversation[i].message.indexOf('成为队长')
            }

            if (n !== undefined && (n + 1)) {
              time = this.data.conversation[i].time
            }
          }

          for (let i = 0; i < this.data.conversation.length; i++) {
            if (this.data.conversation[i].time < time) {
              this.data.conversation[i] = {}
            }
          }

          let that = this

          ajax('POST', 'http://localhost:5050/api/game/get_game', {
            tester: app.globalData.T,
            id: data._gameId
          }, function (response) {
            that.data.game = response.data.data

            that.data.game.PlayerList = sortPlayer(that.data.game.PlayerList)

            if (!that.data.progressBar.length) {
              for (let i in that.data.game.GameConfig.RoundGroupRules) {
                that.data.progressBar.push(that.data.game.GameConfig.RoundGroupRules[i].GroupPlayerCount)
              }
              that.setData({
                progressBar: that.data.progressBar
              })
            }

            if (!app.globalData.OB) {
              that.data.player = that.getPlayerByOpenid(that.data.player.WeixinUserInfo.openid)

              let msg = {}

              if (that.data.game.GameType === 3) {
                switch (that.data.player.CiqinRole.Identification) {
                  case 'A': // 秦王
                    that.showCiqinChoosePanel('A')
                    break

                  case 'B': // 李斯
                    {
                      let merlin = '无'
                      let morgana = '无'

                      for (let i = 0; i < that.data.game.PlayerList.length; i++) {
                        let p = that.data.game.PlayerList[i]
                        if (p.CiqinRole.Identification === 'A') {
                          merlin = p.Identification
                        }
                        if (p.CiqinRole.Identification === 'C') {
                          morgana = p.Identification
                        }
                      }

                      msg.role = '李斯'
                      msg.message = `\n${merlin}号·${morgana}号玩家持有秦王印信。\n秦王和太子丹持有秦王印信。\n祝你好运。`
                      msg.time = Date.now()
                      msg.id = that.generateUUID()
                      msg.type = 'role'
                    }
                    break

                  case 'C': // 太子丹
                    {
                      let f = []
                      let bad = 0

                      for (let i = 0; i < that.data.game.PlayerList.length; i++) {
                        let p = that.data.game.PlayerList[i]
                        if (p.Faction === 0) {
                          bad++
                          if (p.AvalonRole.Identification !== 'E') {
                            f.push(p.Identification + '号')
                          }
                        }
                      }

                      msg.role = '太子丹'
                      msg.message = `\n你的队友是：${f.join('·')}。\n本局游戏共有${bad}名六国阵营玩家，其中秦舞阳与其他队友不能相认。\n持有秦王印信，可被李斯看到。\n祝你好运。`
                      msg.time = Date.now()
                      msg.id = that.generateUUID()
                      msg.type = 'role'
                    }
                    break

                  case 'D': // 刺客
                    that.showCiqinChoosePanel('D')
                    break

                  case 'E': // 秦舞阳
                    {
                      let bad = 0

                      for (let i = 0; i < that.data.game.PlayerList.length; i++) {
                        if (that.data.game.PlayerList[i].Faction === 0) {
                          bad++
                        }
                      }

                      bad--

                      msg.role = '秦舞阳'
                      msg.message = `\n你与其他${bad}名队友不能相认。\n你投出的任务失败会让你得到额外加分。\n祝你好运。`
                      msg.time = Date.now()
                      msg.id = that.generateUUID()
                      msg.type = 'role'
                    }
                    break

                  case 'F': // 苏秦
                    {
                      let f = []
                      let bad = 0

                      for (let i = 0; i < that.data.game.PlayerList.length; i++) {
                        let p = that.data.game.PlayerList[i]
                        if (p.Faction === 0) {
                          bad++
                          if (p.AvalonRole.Identification !== 'F') {
                            f.push(p.Identification + '号')
                          }
                        }
                      }
                      msg.role = '苏秦'
                      msg.message = `\n你的队友是：${f.join('·')}。\n本局游戏共有${bad}名六国阵营玩家，其中秦舞阳与其他队友不能相认。\n嬴政看不到你。\n祝你好运。`
                      msg.time = Date.now()
                      msg.id = that.generateUUID()
                      msg.type = 'role'
                    }
                    break

                  default:
                    if (that.player.Faction === 0) {
                      let f = []
                      let bad = 0

                      for (let i = 0; i < that.game.PlayerList.length; i++) {
                        if (that.game.PlayerList[i].Faction === 0) {
                          bad++
                        }

                        if (that.game.PlayerList[i].Faction === 0 && that.player.Identification !== that.game.PlayerList[i].Identification) {
                          f.push(that.game.PlayerList[i].Identification + '号')
                        }
                      }

                      msg.role = '六国阵营'
                      msg.message = `\n你的队友是：${f.join('·')}。\n本局游戏共有${bad}名六国阵营玩家，其中秦舞阳与其他队友不能相认。\n祝你好运。`
                      msg.time = Date.now()
                      msg.id = that.generateUUID()
                      msg.type = 'role'
                    } else {
                      msg.role = '秦国阵营'
                      msg.message = '\n你的目标是获得3个「任务成功」并保护秦王的身份不被发现。\n祝你好运。'
                      msg.time = Date.now()
                      msg.id = that.generateUUID()
                      msg.type = 'role'
                    }

                    break
                }
              }

              if (that.data.game.GameType === 2) { // 阿瓦隆信息
                switch (that.data.player.AvalonRole.Identification) {
                  case 'A': // 梅林
                    let f = []
                    for (let i = 0; i < that.data.game.PlayerList.length; i++) {
                      let p = that.data.game.PlayerList[i]
                      if (p.Faction === 0) {
                        if (p.AvalonRole.Identification !== 'F') {
                          f.push(p.Identification + '号')
                        }
                      }
                    }

                    msg.role = '梅林'
                    msg.message = `\n莫德雷德爪牙：${f.join('·')}。\n持有梅林的信物，可被派西维尔看到。\n如果梅林被刺客刺杀，则梅林阵营直接失败。\n祝你好运。`
                    msg.time = Date.now()
                    msg.id = that.generateUUID()
                    msg.type = 'role'

                    break

                  case 'B': // 派西维尔
                    let merlin = '无'
                    let morgana = '无'

                    for (let i = 0; i < that.data.game.PlayerList.length; i++) {
                      let p = that.data.game.PlayerList[i]
                      if (p.AvalonRole.Identification === 'A') {
                        merlin = p.Identification
                      }
                      if (p.AvalonRole.Identification === 'C') {
                        morgana = p.Identification
                      }
                    }

                    merlin = parseInt(merlin)
                    morgana = parseInt(morgana)

                    let tmp

                    if (merlin > morgana) {
                      tmp = morgana + '号·' + merlin + '号'
                    } else {
                      tmp = merlin + '号·' + morgana + '号'
                    }

                    msg.role = '派西维尔'
                    msg.message = `\n${tmp}玩家持有梅林的信物。\n梅林和莫甘娜持有梅林的信物。\n祝你好运。`
                    msg.time = Date.now()
                    msg.id = that.generateUUID()
                    msg.type = 'role'

                    break

                  case 'C': // 莫甘娜
                    {
                      let f = []
                      let bad = 0

                      for (let i = 0; i < that.data.game.PlayerList.length; i++) {
                        let p = that.data.game.PlayerList[i]
                        if (p.Faction === 0) {
                          bad++
                          if (p.AvalonRole.Identification !== 'E') {
                            if (p.Identification !== that.data.player.Identification) f.push(p.Identification + '号')
                          }
                        }
                      }

                      msg.role = '莫甘娜'
                      msg.message = `\n你的队友是：${f.join('.')}。\n本局游戏共有${bad}名爪牙阵营玩家，其中奥伯伦与其他队友不能相认。\n持有梅林的信物，可能被派西维尔看到。\n祝你好运。`
                      msg.time = Date.now()
                      msg.id = that.generateUUID()
                      msg.type = 'role'
                    }

                    break

                  case 'D': // 刺客
                    {
                      let f = []
                      let bad = 0

                      for (let i = 0; i < that.data.game.PlayerList.length; i++) {
                        let p = that.data.game.PlayerList[i]
                        if (p.Faction === 0) {
                          bad++
                          if (p.AvalonRole.Identification !== 'E') {
                            if (p.Identification !== that.data.player.Identification) f.push(p.Identification + '号')
                          }
                        }
                      }

                      msg.role = '刺客'
                      msg.message = `\n你的队友是：${f.join('·')}。\n本局游戏共有${bad}名爪牙阵营玩家，其中奥伯伦与其他队友不能相认。\n你在游戏中可选择刺杀梅林以结束游戏。\n祝你好运。`
                      msg.time = Date.now()
                      msg.id = that.generateUUID()
                      msg.type = 'role'
                    }

                    break

                  case 'E': // 奥伯伦
                    {
                      let g = 0

                      for (let i = 0; i < that.data.game.PlayerList.length; i++) {
                        let p = that.data.game.PlayerList[i]
                        if (p.Faction === 1) {
                          g++
                        }
                      }

                      msg.role = '奥伯伦'
                      msg.message = `\n你与其他${g - 1}名队友不能相认。\n你投出的任务失败会让你得到额外加分。\n祝你好运。`
                      msg.time = Date.now()
                      msg.id = that.generateUUID()
                      msg.type = 'role'
                    }

                    break

                  case 'F': // 莫德雷德
                    {
                      let f = []
                      let bad = 0

                      for (let i = 0; i < that.data.game.PlayerList.length; i++) {
                        let p = that.data.game.PlayerList[i]
                        if (p.Faction === 0) {
                          bad++
                          if (p.AvalonRole.Identification !== 'E') {
                            if (p.Identification !== that.data.player.Identification) f.push(p.Identification + '号')
                          }
                        }
                      }

                      msg.role = '莫德雷德'
                      msg.message = `\n你的队友是：${f.join('·')}。\n本局游戏共有${bad}名爪牙阵营玩家，其中奥伯伦与其他队友不能相认。\n梅林看不到你。\n祝你好运。`
                      msg.time = Date.now()
                      msg.id = that.generateUUID()
                      msg.type = 'role'
                    }

                    break

                  default:
                    if (that.data.player.Faction === 0) {
                      let f = []
                      for (let i = 0; i < that.data.game.PlayerList.length; i++) {
                        let p = that.data.game.PlayerList[i]
                        if (p.Faction === 0) {
                          if (p.AvalonRole.Identification !== 'F') {
                            if (p.Identification !== that.data.player.Identification) f.push(p.Identification + '号')
                          }
                        }
                      }
                      msg.role = '莫德雷德的爪牙'
                      msg.message = `\n莫德雷德的爪牙：${f.join('·')}。\n祝你好运。`
                      msg.time = Date.now()
                      msg.id = that.generateUUID()
                      msg.type = 'role'
                    } else {
                      msg.role = '亚瑟的忠臣'
                      msg.message = '\n你的目标是获得3个「任务成功」。\n祝你好运。'
                      msg.time = Date.now()
                      msg.id = that.generateUUID()
                      msg.type = 'role'
                    }

                    break
                }
              }

              if (that.data.game.GameType === 1) {
                if (that.data.player.Faction === 0) {
                  if (that.data.player.AvalonRole.Identification !== 'E') {
                    let f = []

                    for (let i = 0; i < that.data.game.PlayerList.length; i++) {
                      let p = that.data.game.PlayerList[i]

                      if (p.Faction === 0 && p.Identification !== that.data.player.Identification) {
                        f.push(p.Identification + '号')
                      }
                    }
                    msg.role = '间谍'
                    msg.message = `\n你的队友是：${f.join('·')}。\n你的目标是获得3个「任务失败」。\n祝你好运。`
                    msg.time = Date.now()
                    msg.id = that.generateUUID()
                    msg.type = 'role'
                  }
                } else {
                  msg.role = '抵抗组织成员'
                  msg.message = `\n你的目标是获得3个「任务成功」。\n祝你好运。`
                  msg.time = Date.now()
                  msg.id = that.generateUUID()
                  msg.type = 'role'
                }
              }

              if (msg === {}) {
                return
              }
              msg.player = that.data.player
              that.data.conversation.unshift(msg)
              that.setData({
                conversation: that.data.conversation
              })
            }
          })
        }

        break

      case 'chatMessage':
        {
          let player = {}
          let playerSay = false

          for (let i = 0; i < this.data.game.PlayerList.length; i++) {
            if (this.data.game.PlayerList[i].WeixinUserInfo.openid === data.openid) {
              player = this.data.game.PlayerList[i]
              playerSay = true
              break
            }
          }

          if (!playerSay) {
            for (let i = 0; i < this.data.game.OBList.length; i++) {
              if (this.data.game.OBList[i].openid === data.openid) {
                player = this.data.game.OBList[i]
                break
              }
            }
          }

          let msg = {}
          msg.player = player
          msg.message = data.message + ''
          msg.time = data.time
          msg.type = 'chatmsg'
          msg.playerSay = playerSay

          if (playerSay) {
            if (player.WeixinUserInfo.openid === this.data.user.openid) {
              msg.stylename = 'self'
            } else {
              msg.stylename = 'other'
            }
          } else {
            if (player.openid === this.data.user.openid) {
              msg.stylename = 'self'
            } else {
              msg.stylename = 'other'
            }
          }

          msg.id = this.generateUUID()

          this.data.conversation.push(msg)

          this.setData({
            conversation: this.data.conversation
          })
        }

        break

      case 'getReady':
        {
          let that = this

          ajax('POST', 'http://localhost:5050/api/game/get_ready_playerlist', {
            tester: app.globalData.T,
            id: this.data.game.Id
          }, function (res) {
            that.data.readyList = Object.values(res.data.data)
            that.data.readyListObj = {}
            for (let i = 0; i < that.data.readyList.length; i++) {
              that.data.readyListObj[that.data.readyList[i]] = true
            }
            that.setData({
              readyList: that.data.readyList,
              readyListObj: that.data.readyListObj
            })
          })
        }

        break

      case 'cancelReady':
        {
          let that = this

          ajax('POST', 'http://localhost:5050/api/game/get_ready_playerlist', {
            tester: app.globalData.T,
            id: this.data.game.Id
          }, function (res) {
            that.data.readyList = Object.values(res.data.data)
            that.data.readyListObj = {}
            for (let i = 0; i < that.data.readyList.length; i++) {
              that.data.readyListObj[that.data.readyList[i]] = true
            }
            that.setData({
              readyList: that.data.readyList,
              readyListObj: that.data.readyListObj
            })
          })
        }

        break

      case 'roundStart':

        break

      case 'stepChanged':

        break

      case 'groupRoundStart':
        this.groupRoundStart()

        break

      case 'startCountDown':
        this.data.game.GameInfo.CurrentChatPlayerIdentification = data.player.Identification
        this.stopTimePromise()
        this.startTimePromise(data.times)
        if (this.data.player.Identification !== data.player.Identification) {
          this.showSystemMessage(`${this.data.game.GameInfo.CurrentChatPlayerIdentification}号玩家正在发言`)
        } else {
          this.showSystemMessage('轮到你来发言')
        }

        break

      case 'finishCountDown':
        this.stopTimePromise()

        if (data.finish === 0) {
          this.startTimePromise()
        } else {
          if (data.gotoMakeGroup === 1) {
            if (this.data.game.GameInfo.CurrentLeaderId === this.data.player.Identification) {
              this.showMakeGroup()
            }
          }
        }

        break

      case 'waiting_for_leader_make_group':
        if (this.data.player.Identification !== this.data.game.GameInfo.CurrentLeaderId) {
          this.showSystemMessage(`请等待${this.data.game.GameInfo.CurrentLeaderId}号队长选择组队人选`)
        }

        if (this.data.game.GameInfo.CurrentLeaderId === this.data.player.Identification) {
          this.showMakeGroup()
        }

        break

      case 'startMakeGroupVote':
        this.data.Display.ifshowMakeGroup = false
        this.setData({
          Display: this.data.Display
        })
        if (data.list === undefined) {
          return
        }

        let that = this

        ajax('POST', 'http://localhost:5050/api/game/get_game', {
          id: data._gameId,
          tester: app.globalData.T
        }, function (response) {
          var game = response.data.data
          game.PlayerList = sortPlayer(game.PlayerList)
          that.data.game = game

          that.showMakeGroupVote(data)
        })

        break

      case 'makeGroupVote':
        let msg
        let index

        this.data.Display.ifshowVoteBtn = true

        for (let i = this.data.conversation.length - 1; i >= 0; i--) {
          msg = this.data.conversation[i]
          if (msg.type === 'groupVoteMsg') {
            index = i
            break
          }
        }

        if (msg.type === 'groupVoteMsg') {
          for (let i = 0; i < msg.playerList.length; i++) {
            if (msg.playerList[i].Identification === data.player.Identification) {
              this.data.Display.ifshowVoteBtn = false
              this.setData({
                Display: this.data.Display
              })
              msg.playerList[i].style = 'voted'
              msg.makeGroupVotedPlayerCount++
              msg.playerList[i].vote = data.vote
              break
            }
          }
        }
        if (data.player.Identification === this.data.player.Identification) {
          msg.ifVoted = true
        }

        if (msg.makeGroupVotedPlayerCount === msg.playerList.length) {
          msg.ifShowMakeGroupVoteResult = true
        }

        this.data.conversation[index] = msg

        this.setData({
          conversation: this.data.conversation
        })

        break

      case 'finishMakeGroup':
        if (data.showResult === 1) {
          let agree = 0
          let force = false

          let a = []
          let b = []
          let ary = []

          for (let i in data.result) {
            ary.push(i)
          }

          ary.forEach((item) => {
            if (data.result[item] === '1') {
              agree++
              a.push(this.getPlayerByOpenid(item).Identification)
            } else {
              b.push(this.getPlayerByOpenid(item).Identification)
            }
          })

          if (a.length > 0) {
            a = a.sort()
          }

          if (b.length > 0) {
            b = b.sort()
          }

          let isMakeGroupSuccess = false
          let disagree = this.data.game.PlayerCountLimit - agree
          let result = '组队失败'

          if (agree > this.data.game.PlayerCountLimit / 2) {
            result = '组队成功'
            isMakeGroupSuccess = true
          } else {
            if (data.success === 1) {
              result = '因达到最大失败次数，组队成功'
              force = true
              isMakeGroupSuccess = true
            }
          }

          if (!force) {
            if (this.data.game.VotePublishEnabled === 1) {
              this.showSystemMessage(`${a.length ? `${a.join('·')}号玩家同意，` : ''}${b.length ? `${b.join('·')}号玩家反对；` : ''}${result}`, 'important')
            } else {
              this.showSystemMessage(`${agree}人同意，${disagree}人反对；${result}`, 'important')
            }
          }

          if (!isMakeGroupSuccess) {
            if (this.data.game.FullGameMakeGroupRoundLimit === 1) {
              this.showSystemMessage(`全局剩余否决次数：${data.surplusTimes}`)
            } else {
              this.showSystemMessage(`本轮剩余否决次数：${data.surplusTimes}`)
            }
          }
        }

        if (data.gotoMissionVote === 1) {
          if (data.success === 1) {
            var inGroup = false
            for (let i = 0; i < data.group.length; i++) {
              if (data.group[i] === this.data.player.Identification) {
                inGroup = true
                break
              }
            }
            if (inGroup) {
              this.showMissionVote(data)
            } else {
              this.showSystemMessage('请等待队伍中的玩家完成任务投票')
            }
          } else {
            if (parseInt(this.data.game.GameInfo.CurrentLeaderId) === this.data.game.PlayerList.length) {
              this.showSystemMessage(`1号玩家成为队长`)
            } else {
              this.showSystemMessage(`${parseInt(this.data.game.GameInfo.CurrentLeaderId) + 1}号玩家成为队长`)
            }
            this.groupRoundStart()
          }
        } else {
          if (parseInt(this.data.game.GameInfo.CurrentLeaderId) === this.data.game.PlayerList.length) {
            this.showSystemMessage(`1号玩家成为队长`)
          } else {
            this.showSystemMessage(`${parseInt(this.data.game.GameInfo.CurrentLeaderId) + 1}号玩家成为队长`)
          }
        }

        break

      case 'missionVote':
        {
          let msg
          let index

          for (let m = this.data.conversation.length - 1; m >= 0; m--) {
            msg = this.data.conversation[m]

            if (msg.type === 'missionVoteMsg') {
              index = m
              break
            }
          }

          if (msg.type === 'missionVoteMsg') {
            for (let i = 0; i < msg.playerList.length; i++) {
              if (msg.playerList[i].Identification === data.player.Identification) {
                msg.playerList[i].style = 'voted'
                msg.playerList[i].vote = data.vote
                msg.missionVotedPlayerCount++
                break
              }
            }
          }

          if (data.player.Identification === this.data.player.Identification) {
            msg.ifMissionVoted = true
          }

          this.data.conversation[index] = msg
          this.setData({
            conversation: this.data.conversation
          })
        }

        break

      case 'finishMission':
        let agree = 0
        let ary = []

        for (let i in data.result) {
          ary.push(i)
        }

        this.showMissionVoteMessage(data)

        ary.forEach(function (item, index) {
          if (data.result[item] === '1') {
            agree++
          }
        })

        var disagree = data.group.length - agree

        var result = '任务成功'

        if (disagree >= this.data.game.GameConfig.RoundGroupRules[this.data.game.GameInfo.CurrentRound].MissionFailedVoteCount) {
          result = '任务失败'
        }

        if (result === '任务成功') {
          this.data.progressBar[this.data.game.GameInfo.CurrentRound - 1] = 1
        } else {
          this.data.progressBar[this.data.game.GameInfo.CurrentRound - 1] = 0
        }

        this.setData({
          progressBar: this.data.progressBar
        })

        if (this.data.game.GameInfo.Finished && this.data.game.GameInfo.Started) {
          let msg = {}

          msg.time = Date.now()
          msg.type = 'mvpVote'
          msg.game = this.data.game
          msg.id = this.generateUUID()

          if (this.mvpVote === 0) {
            this.conversation.push(msg)
            this.setData({
              conversation: this.data.conversation
            })
            this.mvpVote ++
          }
        }

        break

      case 'finishGame':
        this.data.gameLog.result = data.result
        this.data.gameLog.gameId = data._gameId
        this.data.gameLog.game = this.data.game

        if (data.result === 'lose') {
          if (this.data.game.GameType === 1) {
            this.showSystemMessage(`间谍阵营胜利！`)
          }

          if (this.data.game.GameType === 2) {
            this.showSystemMessage(`莫德雷德阵营胜利！`)
          }

          if (this.data.game.GameType === 3) {
            this.showSystemMessage(`六国阵营胜利！`)
          }
        } else {
          if (this.data.game.GameType === 1) {
            this.showSystemMessage(`抵抗组织阵营胜利！`)
          }

          if (this.data.game.GameType === 2) {
            this.showSystemMessage(`梅林阵营胜利！`)
          }

          if (this.data.game.GameType === 3) {
            this.showSystemMessage(`秦国阵营胜利！`)
          }
        }

        break

      case 'startThrow':
        this.data.game.PlayerList.map(item => {
          if (item.WeixinUserInfo.openid === data.openid) {
            this.data.throwingFaction = item.Faction
          }
        })

        if (this.data.player.Faction === this.data.throwingFaction) {
          this.data.throwing = true

          if (this.data.player.WeixinUserInfo.openid !== data.openid) {
            this.showSystemMessage('您的队友正在行动菜单中进行认输投票')
          }

          if (this.data.player.WeixinUserInfo.openid === data.openid) {
            this.data.throwing = false
          }
        }

        break

      case 'throwVoteFinished':
        this.data.throwing = false
        this.data.throwVoted = false

        this.setData({
          throwing: this.data.throwing,
          throwVoted: this.data.throwVoted
        })

        break

      case 'finishMvpVote':
        {
          // if (this.player.WeixinUserInfo.openid === this.game.CreateOpenid) {
          //   ajax('post', `/api/game/send_command/?${qs.stringify({tester: window.T, command: 'obShowGamelog'})}`, function (res) {})
          // }

          if (!app.globalData.OB && this.data.player.WeixinUserInfo.openid !== this.data.game.CreateOpenid) {
            ajax('POST', 'http://localhost:5050/api/game/unready_game', {
              tester: app.globalData.T,
              id: this.data.game.Id
            }, function (response) {

            })
          }

          let msg = {}

          this.data.gameLog.game = this.data.game
          msg.gameLog = this.data.gameLog
          msg.id = this.generateUUID()
          msg.type = 'gameLog'
          msg.mvp = data.mvp
          this.data.conversation.push(msg)
          this.data.ifMVPed = true
          let msg2 = {}

          msg2.id = this.generateUUID()
          msg2.type = 'outgame'
          this.data.conversation.push(msg2)

          this.setData({
            conversation: this.data.conversation
          })
        }

        break

      case WAITING_FOR_KILL_MERLIN:
        if (this.data.player.AvalonRole.Identification === 'D') {
          this.showKillMerlin()
        }
        if (this.data.player.CiqinRole.Identification === 'D') {
          this.showKillQinwang()
        }

        break

      case 'badguysFreeChat':
        if (this.data.game.GameType === 2) {
          this.showSystemMessage('抵抗组织已取得三轮任务成功，间谍正在讨论，请等待刺客选择目标')
        } else {
          this.showSystemMessage('秦国阵营已取得三轮任务成功，六国阵营正在讨论，请等待刺客选择目标')
        }

        timePromise = undefined

        this.data.secondLeft = 60

        timePromise = setInterval(() => {
          if (this.data.secondLeft <= 0) {
            timePromise = undefined
          } else {
            this.data.secondLeft--
          }
        }, 1000)

        break

      case 'badguysFreeChatFinished':
        {
          let that = this

          ajax('POST', 'http://localhost:5050/api/game/get_game', {
            tester: app.globalData.T,
            id: data._gameId
          }, function (res) {
            let game = res.data.data

            game.PlayerList = sortPlayer(game.PlayerList)
            that.data.game = game
          })
        }

        this.startKillMerlinOr()

        break

      case 'finishKillMerlin':
        if (data.result) {
          if (this.data.game.GameType === 3) {
            this.showSystemMessage(`刺客没有刺中秦王，秦国阵营胜利！`, 'important')
          } else {
            this.showSystemMessage(`刺客没有刺中梅林，抵抗组织胜利！`, 'important')
          }
        } else {
          if (this.data.game.GameType === 3) {
            this.showSystemMessage(`刺客成功刺中秦王，六国阵营胜利！`, 'important')
          } else {
            this.showSystemMessage(`刺客成功刺中梅林，间谍胜利！`, 'important')
          }
        }

        this.data.gameLog.game = this.data.game
        this.data.gameLog.result = data.result ? 'win' : 'lose'
        this.data.gameLog.gameId = this.data.game.Id

        this.data.Display.ifShowKillMerlin = false
        this.data.Display.ifShowKillQinwang = false
        this.setData({
          Display: this.data.Display
        })

        break

      case 'ob_join':
        {
          let that = this

          ajax('POST', 'http://localhost:5050/api/game/get_game', {
            tester: app.globalData.T,
            id: this.data.game.Id
          }, function (res) {
            that.data.game = res.data.data
            that.data.game.PlayerList = sortPlayer(that.data.game.PlayerList)

            that.data.game.OBList.map(item => {
              if (item.openid === data.openid) {
                that.showSystemMessage(`${item.nickname}正在围观`)
              }
            })
          })
        }

        break

      default:
        console.log('这可能是无用的action')
    }
  },

  updateMessage: function (e) {
    this.data.message = e.detail.value
  },

  sendChatMessage: function () {
    if (!(this.data.game.GameInfo.CurrentChatPlayerIdentification === this.data.player.Identification || this.data.game.GameInfo.Finished || !this.data.game.GameInfo.Started || (this.data.game.GameInfo.CurrentStep === WAITING_FOR_BADGUYS_FREE_CHAT && this.data.player.Faction === 0))) {
      wx.showModal({
        title: '提示',
        content: '目前不在发言阶段'
      })
      return
    }

    if (this.data.game.GameInfo.CurrentStep !== FREE_CHAT && this.data.game.GameInfo.CurrentStep !== WAITING_FOR_BADGUYS_FREE_CHAT && !this.data.game.GameInfo.Finished && this.data.game.GameInfo.Started && !app.globalData.OB) {
      wx.showModal({
        title: '提示',
        content: '当前不允许发言'
      })
      return
    }

    if (this.data.game.GameInfo.CurrentStep === WAITING_FOR_BADGUYS_FREE_CHAT) {
      if (this.data.player.Faction !== 0) {
        return
      }
    }

    if (this.data.message === '') {
      return
    }

    var _par

    _par = {
      message: this.data.message,
      tester: app.globalData.T
    }

    var that = this

    let url

    if (app.globalData.OB) {
      url = '/api/game/ob_send_message'
    } else {
      url = '/api/game/send_message'
    }

    ajax('POST', 'http://localhost:5050' + url, _par, function (response) {
      that.data.message = ''
      that.setData({
        message: that.data.message
      })
    })
  },

  showSystemMessage: function (message, style) {
    var player = {}

    player.Identification = 'SYSTEM'

    var msg = {}
    msg.player = player
    msg.time = Date.now()
    msg.message = message
    msg.stylename = 'system'
    msg.type = 'systemmsg'
    msg.id = this.generateUUID()
    msg.style = 'systemmsg-alert'

    if (style === 'important') {
      msg.important = true
    }

    this.data.conversation.push(msg)

    this.setData({
      conversation: this.data.conversation
    })
  },

  generateUUID: function () {
    var d = new Date().getTime()
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      let m = (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
      m = 'a' + m
      return m
    })
  },

  interrupt: function () {
    if (!((this.data.game.GameInfo.CurrentStep === 1 && this.data.game.GameInfo.CurrentChatPlayerIdentification === this.data.player.Identification) || (this.data.game.GameInfo.CurrentStep === 20 && this.data.player.Faction === 0 && (this.data.player.AvalonRole.Identification === 'D' || this.data.player.CiqinRole.Identification==='D')))) {
      this.showSystemMessage('你目前不在发言阶段')
      return
    }

    if (this.data.game.GameInfo.CurrentStep !== FREE_CHAT && this.data.game.GameInfo.CurrentStep !== WAITING_FOR_BADGUYS_FREE_CHAT) {
      this.showSystemMessage('目前不在自由发言阶段')
      return
    }

    var that = this

    ajax('POST', 'http://localhost:5050/api/game/interrupt_countdown/', {
      tester: app.globalData.T
    }, function (response) {
      that.data.message = ''
      if (that.data.game.GameInfo.CurrentStep === WAITING_FOR_BADGUYS_FREE_CHAT) {
        ajax('POST', 'http://localhost:5050/api/game/send_command', {
          tester: app.globalData.T,
          command: 'badguysFreeChatFinished'
        }, function (response) {

        })
      }
    })
  },

  getReady: function () {
    ajax('POST', 'http://localhost:5050/api/game/ready_game', {
      tester: app.globalData.T,
      id: this.data.game.Id
    }, function (response) {
      ajax('POST', 'http://localhost:5050/api/game/send_command', {
        tester: app.globalData.T,
        command: 'getReady'
      }, function (res) {
        if (res.data.err_code === 0) {

        } else {

        }
      })
    })
  },

  cancelReady: function () {
    if (this.data.player.WeixinUserInfo.openid === this.data.game.CreateOpenid) return

    ajax('POST', 'http://localhost:5050/api/game/unready_game', {
      tester: app.globalData.T,
      id: this.data.game.Id
    }, function (res) {
      ajax('POST', 'http://localhost:5050/api/game/send_command', {
        tester: app.globalData.T,
        command: 'cancelReady'
      }, function (res) {
        if (res.data.err_code === 0) {

        } else {
          wx.showModal({
            title: '提示',
            content: '网络错误'
          })
        }
      })
    })
  },

  start: function () {
    if (this.data.readyList.length < this.data.game.PlayerCountLimit - 1) {
      return
    }

    var _par = {
      id: this.data.game.Id,
      tester: app.globalData.T
    }

    ajax('POST', 'http://localhost:5050/api/game/start_game', _par, function (response) {
      ajax('POST', 'http://localhost:5050/api/game/send_command', {
        tester: app.globalData.T,
        command: 'all_players_entered'
      }, function (response) {

      })
    })
  },

  waitAllReady: function () {
    console.log('请等待所有玩家准备')
  },

  updateControlBtn: function () {
    let that = this

    ajax('POST', 'http://localhost:5050/api/game/get_ready_playerlist', {
      tester: app.globalData.T,
      id: this.data.game.Id
    }, function (res) {
      if (res.data.err_code === -3) return
      that.data.readyList = Object.values(res.data.data)
      that.setData({
        readyList: that.data.readyList
      })
      that.data.interrupt = !app.globalData.OB && that.data.game.GameInfo.Started && !that.data.game.GameInfo.Finished
      that.data.getReady = !app.globalData.OB && (!(that.data.readyList.indexOf(that.data.player.WeixinUserInfo.openid) + 1) && that.data.user.openid !== that.data.game.CreateUser.UserInfo.openid) && ((!that.data.game.GameInfo.Started && !that.data.game.GameInfo.Finished) || (that.data.game.GameInfo.Started && that.data.game.GameInfo.Finished && that.data.ifMVPed))
      that.data.cancelReady = !app.globalData.OB && ((that.data.readyList.indexOf(that.data.player.WeixinUserInfo.openid) + 1) && that.data.user.openid !== that.data.game.CreateUser.UserInfo.openid) && (!that.data.game.GameInfo.Started || (that.data.game.GameInfo.Started && that.data.game.GameInfo.Finished))
      that.data.start = !app.globalData.OB && that.data.game.PlayerList.length >= that.data.game.PlayerCountLimit && that.data.game.CreateOpenid === that.data.user.openid && (!that.data.game.GameInfo.Started || (that.data.game.GameInfo.Started && that.data.game.GameInfo.Finished)) && (that.data.game.PlayerCountLimit - 1 <= that.data.readyList.length)
      that.data.waitAllReady = !(!app.globalData.OB && that.data.game.PlayerList.length >= that.data.game.PlayerCountLimit && that.data.game.CreateOpenid === that.data.user.openid && (!that.data.game.GameInfo.Started || (that.data.game.GameInfo.Started && that.data.game.GameInfo.Finished)) && (that.data.game.PlayerCountLimit - 1 <= that.data.readyList.length)) && that.data.user.openid === that.data.game.CreateOpenid && (!that.data.game.GameInfo.Started || (that.data.game.GameInfo.Started && that.data.game.GameInfo.Finished))

      that.data.startKill = !app.globalData.OB && that.data.isAssassin && that.data.game.GameInfo.Started && !that.data.game.GameInfo.Finished
      that.data.startThrow = !app.globalData.OB && !that.data.throwing && !that.data.throwVoted && that.data.game.GameInfo.Started && !that.data.game.GameInfo.Finished
      that.data.playerToOB = !app.globalData.OB && !that.data.readyList.some(item => item === that.data.player.WeixinUserInfo.openid) && !app.globalData.OB && (!that.data.game.GameInfo.Started || (that.data.game.GameInfo.Started && that.data.game.GameInfo.Finished)) && (that.data.game.PlayerList.length > 1) && (that.data.game.CreateOpenid !== that.data.player.WeixinUserInfo.openid)
      that.data.obOutGame = app.globalData.OB
      that.data.OBJoinGame = app.globalData.OB && (that.data.game.PlayerList.length < that.data.game.PlayerCountLimit) && (!that.data.game.GameInfo.Started || (that.data.game.GameInfo.Started && that.data.game.GameInfo.Finished))
      that.data.out_1 = !app.globalData.OB && (that.data.user.openid === that.data.game.CreateOpenid) && !that.data.game.GameInfo.Started
      that.data.out_2 = !app.globalData.OB && !that.data.readyList.some(item => item === that.data.player.WeixinUserInfo.openid) && (that.data.user.openid !== that.data.game.CreateOpenid) && !that.data.game.GameInfo.Started
      that.data.agreeThrow = !app.globalData.OB && that.data.throwing && that.data.game.GameInfo.Started && !that.data.game.GameInfo.Finished
      that.data.disagreeThrow = !app.globalData.OB && that.data.throwing && that.data.game.GameInfo.Started && !that.data.game.GameInfo.Finished

      that.setData({
        game: that.data.game,
        interrupt: that.data.interrupt,
        getReady: that.data.getReady,
        cancelReady: that.data.cancelReady,
        start: that.data.start,
        waitAllReady: that.data.waitAllReady,
        startKill: that.data.startKill,
        startThrow: that.data.startThrow,
        playerToOB: that.data.playerToOB,
        obOutGame: that.data.obOutGame,
        OBJoinGame: that.data.OBJoinGame,
        out_1: that.data.out_1,
        out_2: that.data.out_2,
        agreeThrow: that.data.agreeThrow,
        disagreeThrow: that.data.disagreeThrow,
      })
    })
  },

  getPlayerByOpenid: function (openid) {
    var player
    this.data.game.PlayerList.forEach((p) => {
      if (p.WeixinUserInfo.openid === openid) {
        player = p
      }
    })
    return player
  },

  groupRoundStart: function () {
    this.showSystemMessage(`第${this.data.game.GameInfo.CurrentRound}轮游戏开始`, 'important')
    this.showSystemMessage(`${this.data.game.GameInfo.CurrentLeaderId}号玩家成为队长`)
  },

  stopTimePromise: function () {
    clearInterval(timePromise)
    timePromise = undefined
  },

  startTimePromise: function (times) {
    this.data.secondLeft = this.data.game.ChatTimeLimit
    var that = this

    if (times) {
      this.data.secondLeft = parseInt(times)
    }

    timePromise = undefined

    timePromise = setInterval(function () {
      if (that.data.secondLeft <= 0) {
        that.stopTimePromise()
      } else {
        that.data.secondLeft--
      }
    }, 1000)
  },

  showMakeGroup: function () {
    this.data.Display.ifshowMakeGroup = true
    this.setData({
      Display: this.data.Display
    })
  },

  showMakeGroupVote: function (data) {
    var that = this

    ajax('GET', 'http://localhost:5050/api/game/get_current_group_vote_status', {tester: app.globalData.T}, function (response) {
      var votedList = response.data.data

      var list

      if (Array.isArray(data)) {
        list = data
      } else {
        list = data.list
      }

      that.showSystemMessage(`${that.data.game.GameInfo.CurrentLeaderId}号队长选择：${list.sort().join('·')}号玩家组队`, 'important')
      that.showSystemMessage(`「组队投票」`, 'important')

      var msg = {}
      msg.time = Date.now()
      msg.CurrentRound = data._gameInfo.CurrentRound
      msg.CurrentGroupRound = data._gameInfo.CurrentGroupRound
      msg.CurrentLeaderId = that.data.game.GameInfo.CurrentLeaderId
      msg.type = 'groupVoteMsg'
      msg.playerList = that.data.game.PlayerList
      msg.makeGroupVotedPlayerCount = 0
      msg.playerListToMakeGroup = list

      for (let i = 0; i < msg.playerList.length; i++) {
        msg.playerList[i].style = 'un-vote'
        if (msg.playerListToMakeGroup.indexOf(msg.playerList[i].Identification) + 1) {
          msg.playerList[i].inGroup = true
        } else {
          msg.playerList[i].inGroup = false
        }

        if (msg.CurrentLeaderId === msg.playerList[i].Identification) {
          msg.playerList[i].isLeader = true
        } else {
          msg.playerList[i].isLeader = false
        }

        if (votedList !== undefined) {
          if (votedList[msg.playerList[i].WeixinUserInfo.openid] === '1') {
            msg.playerList[i].style = 'voted'
          }
        }
      }

      msg.id = that.generateUUID()

      that.data.conversation.push(msg)

      that.setData({
        conversation: that.data.conversation
      })
    })
  },

  showMissionVote: function (data) {
    var that = this
    ajax('POST', 'http://localhost:5050/api/game/get_game', {
      id: this.data.game.Id,
      tester: app.globalData.T
    }, function (response) {
      var game = response.data.data
      game.PlayerList = sortPlayer(game.PlayerList)
      that.data.game = game

      var group = that.data.game.GameLog.RoundLog[that.data.game.GameInfo.CurrentRound][that.data.game.GameInfo.CurrentGroupRound].Group

      var inGroup = false

      for (let i = 0; i < group.length; i++) {
        if (group[i] === that.data.player.Identification) {
          inGroup = true
          break
        }
      }

      that.showSystemMessage(`「任务投票」`, 'important')

      let msg = {}
      msg.time = Date.now()
      msg.type = 'missionVoteMsg'
      msg.showVote = inGroup
      msg.playerList = []
      msg.missionVotedPlayerCount = 0
      msg.CurrentRound = data._gameInfo.CurrentRound

      let tmpList = []
      let player

      for (let i = 0; i < group.length; i++) {
        player = that.getPlayerById(group[i])
        player.style = 'un-vote'
        tmpList.push(player)
      }

      tmpList = sortPlayer(tmpList)

      tmpList.forEach(function (value, key) {
        if (value !== undefined) {
          msg.playerList.push(value)
        }
      })

      msg.id = that.generateUUID()

      that.data.conversation.push(msg)
      that.setData({
        conversation: that.data.conversation
      })
    })
  },

  getPlayerById: function (id) {
    var player

    this.data.game.PlayerList.forEach(function (p) {
      if (p.Identification === id) {
        player = p
      }
    })

    return player
  },

  showMissionVoteMessage: function (data) {
    let agree = 0
    let ary = []
    let result

    for (let i in data.result) {
      ary.push(i)
    }

    ary.forEach(function (item, index) {
      if (data.result[item] === '1') {
        agree++
      }
    })

    var disagree = data.group.length - agree

    if (disagree >= this.data.game.GameConfig.RoundGroupRules[this.data.game.GameInfo.CurrentRound].MissionFailedVoteCount) {
      result = 0
    } else {
      result = 1
    }

    var msg = {}

    msg.playerList = []

    data.group.map(item => {
      msg.playerList.push(this.getPlayerById(item))
    })

    msg.playerList = sortPlayer(msg.playerList)

    let array = []

    for (let i = 0; i < msg.playerList.length; i++) {
      if (msg.playerList[i]) {
        array.push(msg.playerList[i])
      }
    }

    msg.playerList = array

    for (let key in data.result) {
      msg.playerList.map(item => {
        if (item.WeixinUserInfo.openid === key) {
          item.vote = parseInt(data.result[key])
        }
      })
    }

    msg.time = Date.now()
    msg.type = 'finishMissionVoteMsg'
    msg.CurrentRound = data._gameInfo.CurrentRound
    msg.id = this.generateUUID()
    msg.result = result
    msg.agree = agree
    msg.disagree = disagree
    this.data.conversation.push(msg)
    this.setData({
      conversation: this.data.conversation
    })
  },

  startThrow: function () {
    var that = this

    ajax('POST', 'http://localhost:5050/api/game/throw', {
      tester: app.globalData.T
    }, function (response) {
      that.data.throwing = true
      ajax('POST', 'http://localhost:5050/api/game/send_command', {
        tester: app.globalData.T,
        command: 'startThrow'
      }, function (response) {

      })
    })
  },

  agreeThrow: function () {
    var that = this
    ajax('POST', 'http://localhost:5050/api/game/throw_vote', {
      tester: app.globalData.T,
      vote: 1
    }, function (response) {
      that.data.throwing = false
      that.data.throwVoted = true
    })
  },

  disagreeThrow: function () {
    var that = this
    ajax('POST', 'http://localhost:5050/api/game/throw_vote', {
      tester: app.globalData.T,
      vote: 0
    }, function (response) {
      that.data.throwing = false
      that.data.throwVoted = true
    })
  },

  showActions: function () {
    this.data.Display.ifShowActions = !this.data.Display.ifShowActions
    this.setData({
      Display: this.data.Display
    })
  },

  showGameRule: function () {
    let msg = {}
    msg.type = 'gamerule'
    msg.gameType = this.data.game.GameType
    msg.playerCount = this.data.game.PlayerCountLimit
    msg.public = this.data.game.public
    msg.votePublish = this.data.game.VotePublishEnabled
    msg.chatTime = this.data.game.ChatTimeLimit
    msg.FullGameMakeGroupRoundLimit = this.data.game.FullGameMakeGroupRoundLimit
    msg.MakeGroupRoundLimit = this.data.game.MakeGroupRoundLimit

    this.data.conversation.push(msg)
    this.setData({
      conversation: this.data.conversation
    })
  },

  out: function () {
    let that = this
    let api = ''

    if (this.data.user.openid === this.data.game.CreateOpenid) {
      api = '/api/game/dismiss_game'
    } else {
      api = '/api/game/out_game'
    }

    if (api === '/api/game/dismiss_game') {
      ajax('POST', 'http://localhost:5050/api/game/send_command', {
        tester: app.globalData.T,
        command: 'dismiss_game'
      }, function (response) {
        ajax('POST', 'http://localhost:5050' + api, {
          tester: app.globalData.T
        }, function (res) {
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
      })
    }

    if (api === '/api/game/out_game') {
      ajax('POST', 'http://localhost:5050' + api, {
        tester: app.globalData.T
      }, function (res) {
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
    }
  },

  showKillMerlin: function () {
    this.data.tmpPlayerList = {}

    this.data.game.PlayerList.forEach((player) => {
      if (player.Faction === 1) {
        this.data.tmpPlayerList[player.Identification] = player
      }
    })

    this.data.Display.ifShowKillMerlin = true
    this.setData({
      Display: this.data.Display,
      tmpPlayerList: this.data.tmpPlayerList
    })
  },

  showKillQinwang: function () {
    this.data.tmpPlayerList = {}

    this.data.game.PlayerList.forEach(player => {
      if (player.Faction === 1) {
        this.data.tmpPlayerList[player.Identification] = player
      }
    })

    this.data.Display.ifShowKillQinwang = true
    this.setData({
      Display: this.data.Display,
      tmpPlayerList: this.data.tmpPlayerList
    })
  },

  startKillMerlinOr: function () {
    if (this.data.player.AvalonRole.Identification === 'D') {
      if (this.data.game.GameType === 2) {
        this.showKillMerlin()
      }
    }

    if (this.data.player.CiqinRole.Identification === 'D') {
      if (this.data.game.GameType === 3) {
        this.showKillQinwang()
      }
    }
  },

  getReady: function () {
    ajax('POST', 'http://localhost:5050/api/game/ready_game', {
      tester: app.globalData.T,
      id: this.data.game.Id
    }, function (res) {
      ajax('POST', 'http://localhost:5050/api/game/send_command', {
        tester: app.globalData.T,
        command: 'getReady'
      }, function (res) {
        if (res.data.err_code === 0) {

        } else {
          wx.showModal({
            title: '提示',
            content: '网络错误'
          })
        }
      })
    })
  },

  playerToOB: function () {
    var that = this
    ajax('POST', 'http://localhost:5050/api/game/out_game', {
      tester: app.globalData.T
    }, function (response) {
      that.data.player = {}
      app.globalData.OB = true
      ajax('POST', 'http://localhost:5050/api/game/ob_join_game', {
        tester: app.globalData.T,
        id: that.data.game.Id
      }, function (response) {
        ajax('POST', 'http://localhost:5050/api/game/ob_send_command', {
          tester: app.globalData.T,
          command: 'ob_join'
        }, function (response) {

        })
      })
    })
  },

  obOutGame: function () {
    var that = this
    ajax('POST', 'http://localhost:5050/api/game/ob_send_command', {
      tester: app.globalData.T,
      command: 'ob_out'}, function (response) {
      var self = that
      ajax('POST', 'http://localhost:5050/api/game/ob_out_game', {
        tester: app.globalData.T,
        id: self.data.game.id
      }, function (response) {
        wx.navigateTo({
          url: '../index/index',
        })
      })
    })
  },

  OBJoinGame: function () {
    var that = this

    ajax('POST', 'http://localhost:5050/api/game/ob_out_game', {
      tester: app.globalData.T,
      id: this.data.game.Id
    }, function (response) {
      ajax('POST', 'http://localhost:5050/api/game/join_game', {
        tester: app.globalData.T,
        id: that.data.game.Id
      }, function (response) {
        ajax('POST', 'http://localhost:5050/api/game/send_command', {
          tester: app.globalData.T,
          command: 'join'
        }, function (response) {
          app.globalData.OB = false
        })
      })
    })
  },

  isPlayer: function () {
    let list = this.data.game.PlayerList
    let myId = app.globalData.U.openid

    return list.some((item) => {
      return item.WeixinUserInfo.openid === myId
    })
  },

  showInfo: function (e) {
    let p = e.currentTarget.dataset.player
    this.data.ifShowInfo = true

    var su = p.SystemUser
    var info = {}

    var ciqin = su.Analytics.Ciqin ? su.Analytics.Ciqin : {}
    var avalon = su.Analytics.Avalon ? su.Analytics.Avalon : {}
    var resistance = su.Analytics.Resistance ? su.Analytics.Resistance : {}

    this.data.ciqinWin = (ciqin['六国阵营'] ? ciqin['六国阵营'].Win : 0) + (ciqin['秦国阵营'] ? ciqin['秦国阵营'].Win : 0)
    this.data.ciqinLose = (ciqin['六国阵营'] ? ciqin['六国阵营'].Lose : 0) + (ciqin['秦国阵营'] ? ciqin['秦国阵营'].Lose : 0)
    this.data.avalonWin = (avalon['抵抗组织'] ? avalon['抵抗组织'].Win : 0) + (avalon['间谍'] ? avalon['间谍'].Win : 0)
    this.data.avalonLose = (avalon['抵抗组织'] ? avalon['抵抗组织'].Lose : 0) + (avalon['间谍'] ? avalon['间谍'].Lose : 0)
    this.data.resistanceWin = (resistance['抵抗军'] ? resistance['抵抗军'].Win : 0) + (resistance['间谍'] ? resistance['间谍'].Win : 0)
    this.data.resistanceLose = (resistance['抵抗军'] ? resistance['抵抗军'].Lose : 0) + (resistance['间谍'] ? resistance['间谍'].Lose : 0)

    this.data.allWinRate = (((this.data.ciqinWin + this.data.avalonWin + this.data.resistanceWin) / (this.data.ciqinWin + this.data.avalonWin + this.data.resistanceWin + this.data.ciqinLose + this.data.avalonLose + this.data.resistanceLose)) * 100).toFixed(0) + '%'

    info.allWinRate = this.data.allWinRate
    info.nickname = su.UserInfo.nickname
    info.headimgurl = su.UserInfo.headimgurl
    info.score = su.Score
    info.openid = su.Openid

    this.data.playerInfo = info

    if (!this.data.cacheFollow.length) {
      this.data.cacheFollow.push(this.data.playerInfo)
    }

    if (this.data.cacheFollow.length === 1) {
      this.data.cacheFollow.push(this.data.playerInfo)
    }

    this.setData({
      ifShowInfo: this.data.ifShowInfo,
      playerInfo: this.data.playerInfo
    })
  },

  hideInfo: function () {
    this.data.ifShowInfo = false

    this.setData({
      ifShowInfo: this.data.ifShowInfo
    })
  },

  showMessageImportant: function () {
    this.data.showImportant = !this.data.showImportant
    this.setData({
      showImportant: this.data.showImportant
    })
  },
})
