// pages/dict-detail/dict-detail.js
const dictUtils = require('../../utils/dict')

const app = getApp()

Page({
  data: {
    dictId: '',
    dictName: '',
    dictInfo: {},
    chapters: [],
    completedChapters: [],
    loading: true,
    _theme: 'light'
  },

  onLoad(options) {
    const { dictId, dictName } = options
    this.setData({
      dictId: dictId || '',
      dictName: decodeURIComponent(dictName || '词典详情'),
      _theme: app.globalData.currentTheme || 'light'
    })
    this.loadDictDetail()
  },

  onShow() {
    this.setData({ _theme: app.globalData.currentTheme || 'light' })
    if (this.data.dictId) {
      this.loadProgress()
    }
  },

  async loadDictDetail() {
    this.setData({ loading: true })
    try {
      const dictInfo = dictUtils.getDictInfo(this.data.dictId)
      const setting = app.getSetting()

      // 设置为当前选中的词典
      app.setCurrentDict({
        id: this.data.dictId,
        name: this.data.dictName,
        length: dictInfo.length,
        description: dictInfo.description || ''
      })

      // 生成章节列表
      const totalChapters = Math.ceil(dictInfo.length / (setting.chapterSize || 20))
      const chapters = []
      for (let i = 0; i < totalChapters; i++) {
        const start = i * (setting.chapterSize || 20) + 1
        const end = Math.min((i + 1) * (setting.chapterSize || 20), dictInfo.length)
        chapters.push({ start, end })
      }

      this.setData({ dictInfo, chapters, loading: false })
      this.loadProgress()
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  loadProgress() {
    const progress = app.getDictProgress(this.data.dictId)
    this.setData({
      completedChapters: progress.completedChapters || []
    })
  },

  onTapChapter(e) {
    const index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: `/pages/practice/practice?dictId=${this.data.dictId}&dictName=${encodeURIComponent(this.data.dictName)}&chapterIndex=${index}`
    })
  },

  onStartPractice() {
    let startIndex = 0
    const progress = app.getDictProgress(this.data.dictId)
    if (progress.chapterIndex > 0) {
      startIndex = progress.chapterIndex
    }
    wx.navigateTo({
      url: `/pages/practice/practice?dictId=${this.data.dictId}&dictName=${encodeURIComponent(this.data.dictName)}&chapterIndex=${startIndex}`
    })
  },

  onStartTest() {
    wx.navigateTo({
      url: `/pages/test/test?dictId=${this.data.dictId}&dictName=${encodeURIComponent(this.data.dictName)}`
    })
  }
})
