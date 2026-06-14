// pages/setting/setting.js
const app = getApp()

Page({
  data: {
    setting: {},
    _theme: 'light'
  },

  onShow() {
    this.loadSetting()
    this.setData({ _theme: app.globalData.currentTheme || 'light' })
  },

  loadSetting() {
    this.setData({ setting: app.getSetting() })
  },

  // 主题
  onSetTheme(e) {
    const theme = e.currentTarget.dataset.theme
    app.updateSetting('theme', theme)
    app.applyTheme()
    this.loadSetting()
  },

  // 每章单词数
  onSetChapterSize() {
    wx.showActionSheet({
      itemList: ['10个', '20个', '30个', '50个'],
      success: (res) => {
        const sizes = [10, 20, 30, 50]
        app.updateSetting('chapterSize', sizes[res.tapIndex])
        this.loadSetting()
      }
    })
  },

  // 显示单词
  onToggleShowWord(e) {
    app.updateSetting('showWord', e.detail.value)
    this.loadSetting()
  },

  // 随机模式
  onToggleRandom(e) {
    app.updateSetting('randomMode', e.detail.value)
    this.loadSetting()
  },

  // 循环模式
  onToggleLoop(e) {
    app.updateSetting('loopMode', e.detail.value)
    this.loadSetting()
  },

  // 翻转模式
  onToggleReverse(e) {
    app.updateSetting('reverseMode', e.detail.value)
    this.loadSetting()
  },

  // 键盘音效
  onToggleKeyboardSound(e) {
    app.updateSetting('keyboardSound', e.detail.value)
    this.loadSetting()
  },

  onKeyboardVolumeChange(e) {
    app.updateSetting('keyboardSoundVolume', e.detail.value)
  },

  // 效果音效
  onToggleEffectSound(e) {
    app.updateSetting('effectSound', e.detail.value)
    this.loadSetting()
  },

  onEffectVolumeChange(e) {
    app.updateSetting('effectSoundVolume', e.detail.value)
  },

  // 发音偏好
  onSetSoundType() {
    wx.showActionSheet({
      itemList: ['美式发音 🇺🇸', '英式发音 🇬🇧'],
      success: (res) => {
        app.updateSetting('soundType', res.tapIndex === 0 ? 'us' : 'uk')
        this.loadSetting()
      }
    })
  },

  onWordVolumeChange(e) {
    app.updateSetting('wordSoundVolume', e.detail.value)
  },

  // 清除数据
  onClearData() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有本地数据吗？包括错词本、收藏、练习记录和设置。此操作不可恢复。',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync()
            app.globalData.wrongWords = []
            app.globalData.collectWords = []
            app.globalData.practiceRecords = []
            app.globalData.dictProgress = {}
            app.loadSetting()
            this.loadSetting()
            wx.showToast({ title: '已清除', icon: 'success' })
          } catch (e) {
            wx.showToast({ title: '清除失败', icon: 'none' })
          }
        }
      }
    })
  }
})
