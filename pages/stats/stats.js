// pages/stats/stats.js
const statsUtils = require('../../utils/statistics')

const app = getApp()

Page({
  data: {
    records: [],
    filteredRecords: [],
    filterType: 'all',
    summary: {
      totalPractices: 0,
      totalWords: 0,
      avgAccuracy: 0,
      bestWPM: 0
    },
    _theme: 'light'
  },

  onShow() {
    this.loadRecords()
    this.setData({ _theme: app.globalData.currentTheme || 'light' })
  },

  loadRecords() {
    const records = (app.globalData.practiceRecords || []).map(r => ({
      ...r,
      dateStr: statsUtils.formatShortDate(r.date)
    }))

    const summary = statsUtils.getSummaryStats(records)

    this.setData({
      records,
      summary,
      filterType: 'all',
      filteredRecords: records
    })
  },

  onFilter(e) {
    const type = e.currentTarget.dataset.type
    let filteredRecords = this.data.records

    if (type === 'week') {
      const weekStart = statsUtils.getWeekStart()
      filteredRecords = this.data.records.filter(r => r.date >= weekStart)
    } else if (type === 'month') {
      const monthStart = statsUtils.getMonthStart()
      filteredRecords = this.data.records.filter(r => r.date >= monthStart)
    }

    this.setData({ filterType: type, filteredRecords })
  }
})
