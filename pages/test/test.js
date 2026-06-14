// pages/test/test.js - 单词4选1测试
const dictUtils = require('../../utils/dict')
const audioUtils = require('../../utils/audio')

const app = getApp()

Page({
  data: {
    dictId: '',
    dictName: '',
    chapterSize: 20,
    allWords: [],
    currentIndex: 0,
    totalQuestions: 0,
    correctCount: 0,
    currentWord: {},
    options: [],
    optionLabels: ['A', 'B', 'C', 'D'],
    answered: false,
    loading: true,
    finished: false,
    accuracy: 0,
    _theme: 'light'
  },

  onLoad(options) {
    const { dictId, dictName } = options
    this.setData({
      dictId: dictId || '',
      dictName: decodeURIComponent(dictName || '单词测试'),
      _theme: app.globalData.currentTheme || 'light'
    })
    this.loadWords()
  },

  async loadWords() {
    this.setData({ loading: true })
    try {
      const words = await dictUtils.loadDictData(this.data.dictId)
      // 随机选取20题
      const selected = dictUtils.shuffleArray(words).slice(0, 20)
      this.data.allWords = selected

      this.setData({
        totalQuestions: selected.length,
        loading: false
      })

      this.renderQuestion()
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  renderQuestion() {
    const { currentIndex, allWords } = this.data
    if (currentIndex >= allWords.length) {
      this.onFinished()
      return
    }

    const word = allWords[currentIndex]
    // 生成4个选项（1个正确 + 3个干扰项）
    const correctTrans = word.trans[0]?.cn || ''
    const allTrans = allWords
      .filter(w => w.name !== word.name)
      .map(w => w.trans[0]?.cn || '')
      .filter(Boolean)

    // 随机选3个干扰项
    const distractors = dictUtils.shuffleArray(allTrans).slice(0, 3)
    const options = [
      { cn: correctTrans, isCorrect: true },
      ...distractors.map(cn => ({ cn, isCorrect: false }))
    ]

    this.setData({
      currentWord: word,
      options: dictUtils.shuffleArray(options),
      answered: false
    })
  },

  onSelectOption(e) {
    if (this.data.answered) return

    const index = e.currentTarget.dataset.index
    const option = this.data.options[index]

    if (option.isCorrect) {
      audioUtils.playCorrectSound()
    } else {
      audioUtils.playErrorSound()
    }

    // 标记选中状态
    option.selected = true
    const options = [...this.data.options]
    options[index] = option

    this.setData({
      options,
      answered: true,
      correctCount: option.isCorrect ? this.data.correctCount + 1 : this.data.correctCount
    })
  },

  onNextQuestion() {
    this.setData({
      currentIndex: this.data.currentIndex + 1
    })
    setTimeout(() => this.renderQuestion(), 200)
  },

  onFinished() {
    const accuracy = Math.round((this.data.correctCount / this.data.totalQuestions) * 100)
    this.setData({
      finished: true,
      accuracy
    })
  },

  onPlayWord() {
    audioUtils.playWordPronunciation(this.data.currentWord.name)
  },

  onRetry() {
    // 重新随机选词
    const words = dictUtils.shuffleArray(this.data.allWords)
    this.setData({
      currentIndex: 0,
      correctCount: 0,
      finished: false,
      answered: false,
      allWords: words
    })
    this.renderQuestion()
  },

  onBackHome() {
    wx.switchTab({ url: '/pages/index/index' }).catch(() => {
      wx.navigateBack()
    })
  }
})
