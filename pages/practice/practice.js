// pages/practice/practice.js - 单词打字练习核心逻辑
const dictUtils = require('../../utils/dict')
const audioUtils = require('../../utils/audio')
const statsUtils = require('../../utils/statistics')

const app = getApp()

Page({
  data: {
    // 词典与进度
    dictId: '',
    dictName: '',
    chapterIndex: 0,
    chapterSize: 20,
    totalChapters: 0,
    
    // 当前章节单词
    chapterWords: [],
    currentWordIndex: 0,
    currentWordChars: [],  // [{char, status}] 当前单词的字符状态
    currentWordName: '',
    currentWordTrans: [],
    currentWordPhonetic: '',
    
    // 输入状态
    currentCharIndex: 0,
    inputValue: '',
    inputFocus: true,
    
    // 计时
    startTime: 0,
    elapsedTime: 0,
    timeStr: '00:00',
    timerInterval: null,
    
    // 统计
    correctWords: [],
    wrongWords: [],
    totalChars: 0,
    wpm: 0,
    progressPercent: 0,
    
    // 模式
    showWord: true,
    reverseMode: false,
    loopMode: false,
    randomMode: false,
    soundType: 'us',
    
    // 状态
    loading: true,
    finished: false,
    isShaking: false,
    wordVisible: true,  // 单词字母是否可见
    stats: null,
    wrongWordList: [],
    hasNextChapter: false,
    
    // 主题
    _theme: 'light'
  },

  onLoad(options) {
    const { dictId, dictName, chapterIndex, chapterSize, mode } = options
    
    const setting = app.getSetting()
    
    this.setData({
      dictId: dictId || '',
      dictName: decodeURIComponent(dictName || '单词练习'),
      chapterIndex: parseInt(chapterIndex) || 0,
      chapterSize: parseInt(chapterSize) || setting.chapterSize || 20,
      showWord: setting.showWord !== undefined ? setting.showWord : true,
      reverseMode: mode === 'reverse' || false,
      randomMode: mode === 'random' || setting.randomMode || false,
      soundType: setting.soundType || 'us',
      _theme: app.globalData.currentTheme || 'light'
    })
    
    this.loadDict()
  },

  onUnload() {
    this.stopTimer()
    audioUtils.destroyAllAudio()
  },

  onShow() {
    this.setData({
      _theme: app.globalData.currentTheme || 'light',
      inputFocus: true
    })
  },

  // ===== 数据加载 =====
  async loadDict() {
    this.setData({ loading: true })
    
    try {
      // 特殊处理错词复习
      if (this.data.dictId === '__wrong__') {
        const tempWords = app.globalData.tempPracticeWords || []
        app.globalData.tempPracticeWords = null
        
        if (tempWords.length === 0) {
          wx.showToast({ title: '没有错词需要复习', icon: 'none' })
          setTimeout(() => wx.navigateBack(), 1500)
          return
        }
        
        let chapterWords = tempWords.slice(0, this.data.chapterSize)
        if (this.data.randomMode) {
          chapterWords = dictUtils.shuffleArray(chapterWords)
        }
        
        this.setData({
          chapterWords,
          totalChapters: 1,
          loading: false,
          hasNextChapter: false
        })
        
        setTimeout(() => {
          this.renderCurrentWord()
          this.setData({ inputFocus: true })
        }, 300)
        return
      }
      
      const words = await dictUtils.loadDictData(this.data.dictId, (progress) => {
        // 可在此显示加载进度
      })
      
      let chapterWords = dictUtils.getChapterWords(
        words, 
        this.data.chapterIndex, 
        this.data.chapterSize
      )
      
      if (this.data.randomMode) {
        chapterWords = dictUtils.shuffleArray(chapterWords)
      }
      
      const totalChapters = dictUtils.getTotalChapters(words, this.data.chapterSize)
      
      this.setData({
        chapterWords,
        totalChapters,
        loading: false,
        hasNextChapter: this.data.chapterIndex + 1 < totalChapters
      })
      
      // 加载完成后渲染第一个单词
      setTimeout(() => {
        this.renderCurrentWord()
        this.setData({ inputFocus: true })
      }, 300)
      
    } catch (err) {
      console.error('加载词库失败:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
    }
  },

  // ===== 单词渲染 =====
  renderCurrentWord() {
    const { chapterWords, currentWordIndex } = this.data
    if (currentWordIndex >= chapterWords.length) {
      this.onChapterFinished()
      return
    }
    
    const word = chapterWords[currentWordIndex]
    if (!word) return
    
    // 构建字符状态数组
    const chars = (word.name || '').split('').map(char => ({
      char,
      status: 'pending' // pending | correct | error | current
    }))
    
    // 如果有音标字段
    let phonetic = word.usphone || word.ukphone || ''
    if (this.data.soundType === 'uk' && word.ukphone) {
      phonetic = word.ukphone
    }
    
    // 统一 trans 格式：字符串数组 -> 对象数组
    const rawTrans = word.trans || []
    let currentWordTrans = []
    if (Array.isArray(rawTrans)) {
      if (typeof rawTrans[0] === 'string') {
        // ["v. 放弃；遗弃"] -> [{pos: "v.", cn: "放弃；遗弃"}]
        currentWordTrans = rawTrans.map(t => {
          if (typeof t !== 'string') return { pos: '', cn: '' }
          const match = t.match(/^([a-z]+[\.\s]*)\s+(.+)$/i)
          if (match) {
            return { pos: match[1].trim(), cn: match[2].trim() }
          }
          return { pos: '', cn: t.trim() }
        })
      } else {
        // 已是对象数组，直接使用
        currentWordTrans = rawTrans
      }
    }
    
    this.setData({
      currentWordChars: chars,
      currentWordName: word.name,
      currentWordTrans,
      currentWordPhonetic: phonetic,
      currentCharIndex: 0,
      inputValue: '',
      progressPercent: Math.round((currentWordIndex / chapterWords.length) * 100)
    })
  },

  // ===== 键盘输入处理（核心） =====
  onKeyboardInput(e) {
    // 已完成或加载中则忽略
    if (this.data.finished || this.data.loading) return
    
    const value = e.detail.value
    if (!value) return
    
    // 取最后一个字符
    const newChar = value[value.length - 1]
    if (!newChar) return
    
    // 首次输入开始计时
    if (!this.data.startTime) {
      this.startTimer()
    }
    
    // 处理字符匹配
    this.processCharInput(newChar)
    
    // 清空 input，确保每次都触发 input 事件
    setTimeout(() => {
      this.setData({ inputValue: '' })
    }, 10)
  },

  processCharInput(inputChar) {
    const { currentCharIndex, currentWordChars, currentWordName } = this.data
    
    const targetChar = currentWordName[currentCharIndex]
    if (!targetChar) return
    
    // 播放键盘音效
    audioUtils.playKeyboardSound()
    
    if (inputChar === targetChar) {
      // 正确输入
      const newChars = [...currentWordChars]
      newChars[currentCharIndex] = { ...newChars[currentCharIndex], status: 'correct' }
      
      const newCharIndex = currentCharIndex + 1
      this.data.totalChars++
      
      // 下一个字符高亮
      if (newCharIndex < newChars.length) {
        newChars[newCharIndex] = { ...newChars[newCharIndex], status: 'current' }
      }
      
      this.setData({
        currentWordChars: newChars,
        currentCharIndex: newCharIndex
      })
      
      // 单词完成
      if (newCharIndex >= newChars.length) {
        this.onWordComplete(true)
      }
    } else {
      // 错误输入 - 整个单词标红并重置
      this.onWordError()
    }
  },

  onWordComplete(isCorrect) {
    const word = this.data.chapterWords[this.data.currentWordIndex]
    
    // 播放正确音效
    audioUtils.playCorrectSound()
    
    // 自动播放单词发音
    setTimeout(() => {
      audioUtils.playWordPronunciation(word.name, this.data.soundType)
    }, 100)
    
    // 更新统计数据
    const correctWords = [...this.data.correctWords]
    const wrongWords = [...this.data.wrongWords]
    
    if (isCorrect) {
      correctWords.push(word)
    } else {
      wrongWords.push(word)
      app.addWrongWord(word, this.data.dictId)
    }
    
    // 计算 WPM
    const wpm = this.calcCurrentWPM()
    
    this.setData({
      correctWords,
      wrongWords,
      wpm,
      currentWordIndex: this.data.currentWordIndex + 1
    })
    
    // 短暂延迟后渲染下一个单词
    setTimeout(() => {
      this.renderCurrentWord()
      this.setData({ inputFocus: true })
    }, 200)
  },

  onWordError() {
    // 播放错误音效
    audioUtils.playErrorSound()
    
    // 标记所有字符为错误（红色）
    const newChars = this.data.currentWordChars.map(c => ({
      ...c,
      status: 'error'
    }))
    
    this.setData({
      currentWordChars: newChars,
      isShaking: true,
      inputValue: ''
    })
    
    // 短暂显示错误后重置
    setTimeout(() => {
      // 重置当前单词
      const resetChars = (this.data.chapterWords[this.data.currentWordIndex].name || '')
        .split('')
        .map(char => ({ char, status: 'pending' }))
      
      this.setData({
        currentWordChars: resetChars,
        currentCharIndex: 0,
        isShaking: false,
        inputValue: ''
      })
    }, 500)
  },

  // ===== 计时 =====
  startTimer() {
    const startTime = Date.now()
    this.setData({ startTime })
    
    this.data.timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const timeStr = statsUtils.formatTime(elapsed)
      const wpm = this.calcCurrentWPM()
      this.setData({ elapsedTime: elapsed, timeStr, wpm })
    }, 1000)
  },

  stopTimer() {
    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval)
      this.data.timerInterval = null
    }
  },

  calcCurrentWPM() {
    const { elapsedTime, totalChars } = this.data
    if (!elapsedTime || elapsedTime <= 0) return 0
    return statsUtils.calcWPM(totalChars, elapsedTime)
  },

  // ===== 章节完成 =====
  onChapterFinished() {
    this.stopTimer()
    
    const { chapterWords, correctWords, wrongWords, elapsedTime, totalChars } = this.data
    
    const stats = statsUtils.calcPracticeStats(
      chapterWords, correctWords, wrongWords, elapsedTime, totalChars
    )
    
    // 保存练习记录
    app.addPracticeRecord({
      dictId: this.data.dictId,
      chapterIndex: this.data.chapterIndex,
      type: 'word',
      ...stats
    })
    
    // 更新词典进度
    app.updateDictProgress(this.data.dictId, this.data.chapterIndex, true)
    
    this.setData({
      finished: true,
      stats,
      wrongWordList: wrongWords,
      hasNextChapter: this.data.chapterIndex + 1 < this.data.totalChapters
    })
  },

  // ===== 用户操作 =====
  onTapPronunciation() {
    const word = this.data.chapterWords[this.data.currentWordIndex]
    if (word) {
      audioUtils.playWordPronunciation(word.name, this.data.soundType)
    }
    // 恢复输入焦点
    setTimeout(() => { this.setData({ inputFocus: true }) }, 100)
  },

  onTapSkip() {
    const word = this.data.chapterWords[this.data.currentWordIndex]
    if (!word) return

    // 跳过视为错误
    const wrongWords = [...this.data.wrongWords, word]
    app.addWrongWord(word, this.data.dictId)

    this.setData({
      wrongWords,
      currentWordIndex: this.data.currentWordIndex + 1,
      inputValue: ''
    })

    setTimeout(() => {
      this.renderCurrentWord()
      this.setData({ inputFocus: true })
    }, 100)
  },

  onTapHide() {
    this.setData({
      wordVisible: !this.data.wordVisible
    })
    // 恢复输入焦点
    setTimeout(() => { this.setData({ inputFocus: true }) }, 100)
  },

  onRetryChapter() {
    this.stopTimer()
    
    // 重置所有状态
    const { chapterWords, randomMode } = this.data
    let words = [...chapterWords]
    if (randomMode) words = dictUtils.shuffleArray(words)
    
    this.setData({
      chapterWords: words,
      currentWordIndex: 0,
      currentCharIndex: 0,
      inputValue: '',
      startTime: 0,
      elapsedTime: 0,
      timeStr: '00:00',
      correctWords: [],
      wrongWords: [],
      totalChars: 0,
      wpm: 0,
      progressPercent: 0,
      finished: false,
      isShaking: false,
      wordVisible: true,
      stats: null,
      wrongWordList: [],
      inputFocus: true
    })
    
    setTimeout(() => this.renderCurrentWord(), 300)
  },

  onNextChapter() {
    const nextIndex = this.data.chapterIndex + 1
    if (nextIndex >= this.data.totalChapters) {
      wx.showToast({ title: '已是最后一章', icon: 'none' })
      return
    }
    
    this.stopTimer()
    
    wx.redirectTo({
      url: `/pages/practice/practice?dictId=${this.data.dictId}&dictName=${encodeURIComponent(this.data.dictName)}&chapterIndex=${nextIndex}&chapterSize=${this.data.chapterSize}${this.data.reverseMode ? '&mode=reverse' : ''}`
    })
  },

  onBackToList() {
    wx.reLaunch({ url: '/pages/index/index' })
  },

  onBackToHome() {
    this.stopTimer()
    wx.reLaunch({ url: '/pages/index/index' })
  },

  onInputBlur() {
    // 失去焦点时重新获取焦点
    if (!this.data.finished && !this.data.loading) {
      setTimeout(() => {
        this.setData({ inputFocus: true })
      }, 100)
    }
  },
  
  // 点击页面任意处重新聚焦
  onTapPage() {
    this.setData({ inputFocus: true })
  }
})
