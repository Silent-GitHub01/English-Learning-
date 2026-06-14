// pages/dict-list/dict-list.js
const dictUtils = require('../../utils/dict')

const app = getApp()

Page({
  data: {
    categories: [],
    filteredCategories: [],
    searchText: '',
    _theme: 'light'
  },

  onLoad() {
    const groups = dictUtils.getDictsByCategory()
    const categories = Object.keys(groups).map(name => ({
      name,
      dicts: groups[name]
    }))
    this.setData({ categories, filteredCategories: categories })
    this.setData({ _theme: app.globalData.currentTheme || 'light' })
  },

  onShow() {
    this.setData({ _theme: app.globalData.currentTheme || 'light' })
  },

  onSearchInput(e) {
    const text = e.detail.value.toLowerCase()
    if (!text) {
      this.setData({
        filteredCategories: this.data.categories,
        searchText: ''
      })
      return
    }

    const filtered = this.data.categories
      .map(cat => ({
        name: cat.name,
        dicts: cat.dicts.filter(d => 
          d.name.toLowerCase().includes(text) ||
          d.description.toLowerCase().includes(text) ||
          (d.tags || []).some(t => t.toLowerCase().includes(text))
        )
      }))
      .filter(cat => cat.dicts.length > 0)

    this.setData({ filteredCategories: filtered, searchText: text })
  },

  onTapDict(e) {
    const dict = e.currentTarget.dataset.dict
    wx.navigateTo({
      url: `/pages/dict-detail/dict-detail?dictId=${dict.id}&dictName=${encodeURIComponent(dict.name)}`
    })
  }
})
