// pages/wrong-book/wrong-book.js
const audioUtils = require('../../utils/audio')

const app = getApp()

Page({
  data: {
    wrongWords: [],
    _theme: 'light'
  },

  onShow() {
    this.loadWrongWords()
    this.setData({ _theme: app.globalData.currentTheme || 'light' })
  },

  loadWrongWords() {
    const words = app.getWrongWords()
    this.setData({ wrongWords: words })
  },

  onPlaySound(e) {
    const word = e.currentTarget.dataset.word
    audioUtils.playWordPronunciation(word)
  },

  onDelete(e) {
    const { name, dictid } = e.currentTarget.dataset
    app.removeWrongWord(name, dictid)
    this.loadWrongWords()
  },

  onClearAll() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有错词吗？',
      success: (res) => {
        if (res.confirm) {
          app.globalData.wrongWords = []
          app.saveWrongWords()
          this.setData({ wrongWords: [] })
        }
      }
    })
  },

  onStartPractice() {
    const words = this.data.wrongWords
    if (words.length === 0) return

    // 将错词转化为练习格式并跳转
    const practiceWords = words.map(w => ({
      name: w.name,
      trans: w.trans,
      usphone: w.usphone,
      ukphone: w.ukphone
    }))

    // 通过全局临时数据传递
    app.globalData.tempPracticeWords = practiceWords
    wx.navigateTo({
      url: '/pages/practice/practice?dictId=__wrong__&dictName=' + encodeURIComponent('错词复习')
    })
  }
})
