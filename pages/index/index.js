// pages/index/index.js - 首页逻辑
const dictUtils = require('../../utils/dict')
const statsUtils = require('../../utils/statistics')

const app = getApp()

Page({
  data: {
    categories: [],
    currentDict: null,
    wrongCount: 0,
    todayTask: {
      newWords: 0,
      reviewWords: 0
    },
    summaryStats: {
      totalPractices: 0,
      avgAccuracy: 0,
      bestWPM: 0,
      todayDuration: 0,
      totalDays: 0,
      totalDuration: 0
    },
    _theme: 'light'
  },

  onLoad() {
    this.loadDictList()
    this.loadStats()
  },

  onShow() {
    this.setData({ _theme: app.globalData.currentTheme || 'light' })
    this.loadStats()
    this.loadCurrentDict()
    this.loadTodayTask()
  },

  loadCurrentDict() {
    const currentDict = app.globalData.currentDict || null
    this.setData({ currentDict })
  },

  loadDictList() {
    const groups = dictUtils.getDictsByCategory()
    const categories = Object.keys(groups).map(name => ({
      name,
      dicts: groups[name]
    }))
    this.setData({ categories })
  },

  loadStats() {
    const wrongWords = app.getWrongWords()
    const records = app.globalData.practiceRecords || []
    const summaryStats = statsUtils.getSummaryStats(records)

    // 补充时长和天数统计
    summaryStats.todayDuration = this._calcTodayDuration(records)
    summaryStats.totalDays = this._calcTotalDays(records)
    summaryStats.totalDuration = this._calcTotalDuration(records)

    this.setData({
      wrongCount: wrongWords.length,
      summaryStats
    })
  },

  loadTodayTask() {
    // 根据当前词库和学习进度计算今日任务
    const currentDict = app.globalData.currentDict
    const todayTask = {
      newWords: currentDict ? Math.min(20, currentDict.length || 0) : 0,
      reviewWords: (app.getWrongBooks && app.getWrongBooks().length) || 0
    }
    this.setData({ todayTask })
  },

  _calcTodayDuration(records) {
    if (!records.length) return '0'
    const todayStr = new Date().toISOString().slice(0, 10)
    const todayRecords = records.filter(r => r.date === todayStr)
    const totalSec = todayRecords.reduce((sum, r) => sum + (r.duration || 0), 0)
    return totalSec > 60 ? Math.round(totalSec / 60) + 'min' : totalSec + 's'
  },

  _calcTotalDays(records) {
    if (!records.length) return '0'
    const days = new Set(records.map(r => r.date))
    return days.size.toString()
  },

  _calcTotalDuration(records) {
    if (!records.length) return '0'
    const totalSec = records.reduce((sum, r) => sum + (r.duration || 0), 0)
    return totalSec > 3600 ? (totalSec / 3600).toFixed(1) + 'h' : Math.round(totalSec / 60) + 'min'
  },

  onTapDict(e) {
    const dict = e.currentTarget.dataset.dict
    wx.navigateTo({
      url: `/pages/practice/practice?dictId=${dict.id}&dictName=${encodeURIComponent(dict.name)}`
    })
  },

  onTapWrongBook() {
    wx.navigateTo({ url: '/pages/wrong-book/wrong-book' })
  },

  onTapDictList() {
    wx.navigateTo({ url: '/pages/dict-list/dict-list' })
  },

  onTapContinueLearning() {
    const currentDict = app.globalData.currentDict
    if (!currentDict) {
      wx.showToast({ title: '请先选择词典', icon: 'none' })
      return
    }

    const dictInfo = dictUtils.getDictInfo(currentDict.id)
    if (!dictInfo) {
      wx.showToast({ title: '词典信息不存在', icon: 'none' })
      return
    }

    // 计算总章数
    const setting = app.getSetting()
    const chapterSize = setting.chapterSize || 20
    const totalChapters = Math.ceil(dictInfo.length / chapterSize)

    // 获取当前学习进度
    const progress = app.getDictProgress(currentDict.id)

    // 检查是否全部学完（所有章节都在 completedChapters 中）
    const isAllCompleted = progress.completedChapters &&
      progress.completedChapters.length >= totalChapters

    if (isAllCompleted) {
      wx.showModal({
        title: '已完成',
        content: `${currentDict.name} 已学完，请更换词典继续学习`,
        showCancel: true,
        confirmText: '更换词典',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/dict-list/dict-list' })
          }
        }
      })
      return
    }

    // 从上次学习的章节继续（chapterIndex 或下一个未完成的章节）
    let startIndex = progress.chapterIndex || 0

    wx.navigateTo({
      url: `/pages/practice/practice?dictId=${currentDict.id}&dictName=${encodeURIComponent(currentDict.name)}&chapterIndex=${startIndex}`
    })
  },

  onTapStats() {
    wx.navigateTo({ url: '/pages/stats/stats' })
  },

  onTapSetting() {
    wx.navigateTo({ url: '/pages/setting/setting' })
  }
})
