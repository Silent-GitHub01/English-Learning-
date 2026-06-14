// app.js - 英语打字学习小程序全局入口
const STORAGE_KEYS = {
  SETTING: 'typing-setting',
  WRONG_WORDS: 'typing-wrong-words',
  COLLECT_WORDS: 'typing-collect-words',
  PRACTICE_RECORDS: 'typing-practice-records',
  DICT_PROGRESS: 'typing-dict-progress',
  CURRENT_DICT: 'typing-current-dict'
}

const DEFAULT_SETTING = {
  theme: 'light',           // light | dark | auto
  chapterSize: 20,          // 每章单词数
  keyboardSound: true,      // 键盘音效开关
  keyboardSoundFile: '机械键盘2',
  keyboardSoundVolume: 80,
  effectSound: true,        // 效果音效
  effectSoundVolume: 80,
  wordSoundVolume: 80,      // 单词发音音量
  wordSoundSpeed: 1,        // 发音速度
  soundType: 'us',          // us | uk
  showWord: true,           // 显示单词（非盲打）
  loopMode: false,          // 循环模式
  randomMode: false,        // 随机模式
  reverseMode: false        // 翻转模式(先看释义)
}

App({
  globalData: {
    // 词库列表缓存
    dictList: null,
    // 用户设置
    setting: null,
    // 错词本
    wrongWords: [],
    // 收藏词
    collectWords: [],
    // 练习记录
    practiceRecords: [],
    // 词典进度 { dictId: { chapterIndex, lastLearnIndex } }
    dictProgress: {},
    // 当前加载的词典数据缓存
    dictCache: {},
    // 当前主题
    currentTheme: 'light',
    // 是否播放键盘音效
    keyboardAudioPlaying: false,
    // 临时练习数据（错词复习传参）
    tempPracticeWords: null,
    // 当前选中的词典
    currentDict: null
  },

  onLaunch() {
    // 加载本地存储数据
    this.loadSetting()
    this.loadWrongWords()
    this.loadCollectWords()
    this.loadPracticeRecords()
    this.loadDictProgress()
    this.loadCurrentDict()
    // 应用主题
    this.applyTheme()
  },

  // ===== 设置相关 =====
  loadSetting() {
    try {
      const saved = wx.getStorageSync(STORAGE_KEYS.SETTING)
      this.globalData.setting = saved ? { ...DEFAULT_SETTING, ...saved } : { ...DEFAULT_SETTING }
    } catch (e) {
      this.globalData.setting = { ...DEFAULT_SETTING }
    }
  },

  saveSetting() {
    try {
      wx.setStorageSync(STORAGE_KEYS.SETTING, this.globalData.setting)
    } catch (e) {
      console.error('保存设置失败', e)
    }
  },

  getSetting() {
    return this.globalData.setting || DEFAULT_SETTING
  },

  updateSetting(key, value) {
    if (!this.globalData.setting) this.loadSetting()
    this.globalData.setting[key] = value
    this.saveSetting()
  },

  // ===== 错词本 =====
  loadWrongWords() {
    try {
      this.globalData.wrongWords = wx.getStorageSync(STORAGE_KEYS.WRONG_WORDS) || []
    } catch (e) {
      this.globalData.wrongWords = []
    }
  },

  saveWrongWords() {
    try {
      wx.setStorageSync(STORAGE_KEYS.WRONG_WORDS, this.globalData.wrongWords)
    } catch (e) {
      console.error('保存错词失败', e)
    }
  },

  addWrongWord(word, dictId) {
    const exists = this.globalData.wrongWords.find(
      w => w.name === word.name && w.dictId === dictId
    )
    if (!exists) {
      this.globalData.wrongWords.unshift({
        name: word.name,
        trans: word.trans,
        usphone: word.usphone,
        ukphone: word.ukphone,
        dictId: dictId,
        wrongCount: 1,
        wrongAt: Date.now()
      })
    } else {
      exists.wrongCount++
      exists.wrongAt = Date.now()
    }
    this.saveWrongWords()
  },

  removeWrongWord(name, dictId) {
    this.globalData.wrongWords = this.globalData.wrongWords.filter(
      w => !(w.name === name && w.dictId === dictId)
    )
    this.saveWrongWords()
  },

  getWrongWords(dictId) {
    if (dictId) {
      return this.globalData.wrongWords.filter(w => w.dictId === dictId)
    }
    return this.globalData.wrongWords
  },

  // ===== 收藏词 =====
  loadCollectWords() {
    try {
      this.globalData.collectWords = wx.getStorageSync(STORAGE_KEYS.COLLECT_WORDS) || []
    } catch (e) {
      this.globalData.collectWords = []
    }
  },

  saveCollectWords() {
    try {
      wx.setStorageSync(STORAGE_KEYS.COLLECT_WORDS, this.globalData.collectWords)
    } catch (e) {
      console.error('保存收藏失败', e)
    }
  },

  toggleCollectWord(word, dictId) {
    const idx = this.globalData.collectWords.findIndex(
      w => w.name === word.name && w.dictId === dictId
    )
    if (idx > -1) {
      this.globalData.collectWords.splice(idx, 1)
    } else {
      this.globalData.collectWords.unshift({
        name: word.name,
        trans: word.trans,
        usphone: word.usphone,
        ukphone: word.ukphone,
        dictId: dictId,
        collectAt: Date.now()
      })
    }
    this.saveCollectWords()
    return idx === -1
  },

  isWordCollected(name, dictId) {
    return this.globalData.collectWords.some(
      w => w.name === name && w.dictId === dictId
    )
  },

  // ===== 练习记录 =====
  loadPracticeRecords() {
    try {
      this.globalData.practiceRecords = wx.getStorageSync(STORAGE_KEYS.PRACTICE_RECORDS) || []
    } catch (e) {
      this.globalData.practiceRecords = []
    }
  },

  savePracticeRecords() {
    try {
      wx.setStorageSync(STORAGE_KEYS.PRACTICE_RECORDS, this.globalData.practiceRecords)
    } catch (e) {
      console.error('保存练习记录失败', e)
    }
  },

  addPracticeRecord(record) {
    this.globalData.practiceRecords.unshift({
      ...record,
      date: Date.now()
    })
    if (this.globalData.practiceRecords.length > 500) {
      this.globalData.practiceRecords.length = 500
    }
    this.savePracticeRecords()
  },

  getTodayRecords() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return this.globalData.practiceRecords.filter(
      r => r.date >= today.getTime()
    )
  },

  // ===== 词典进度 =====
  loadDictProgress() {
    try {
      this.globalData.dictProgress = wx.getStorageSync(STORAGE_KEYS.DICT_PROGRESS) || {}
    } catch (e) {
      this.globalData.dictProgress = {}
    }
  },

  saveDictProgress() {
    try {
      wx.setStorageSync(STORAGE_KEYS.DICT_PROGRESS, this.globalData.dictProgress)
    } catch (e) {
      console.error('保存进度失败', e)
    }
  },

  getDictProgress(dictId) {
    return this.globalData.dictProgress[dictId] || { chapterIndex: 0, completedChapters: [] }
  },

  updateDictProgress(dictId, chapterIndex, completed) {
    if (!this.globalData.dictProgress[dictId]) {
      this.globalData.dictProgress[dictId] = { chapterIndex: 0, completedChapters: [] }
    }
    if (completed) {
      if (!this.globalData.dictProgress[dictId].completedChapters.includes(chapterIndex)) {
        this.globalData.dictProgress[dictId].completedChapters.push(chapterIndex)
      }
    }
    this.globalData.dictProgress[dictId].chapterIndex = chapterIndex
    this.saveDictProgress()
  },

  // ===== 当前词典 =====
  loadCurrentDict() {
    try {
      this.globalData.currentDict = wx.getStorageSync(STORAGE_KEYS.CURRENT_DICT) || null
    } catch (e) {
      this.globalData.currentDict = null
    }
  },

  saveCurrentDict() {
    try {
      wx.setStorageSync(STORAGE_KEYS.CURRENT_DICT, this.globalData.currentDict)
    } catch (e) {
      console.error('保存当前词典失败', e)
    }
  },

  setCurrentDict(dict) {
    this.globalData.currentDict = dict
    this.saveCurrentDict()
  },

  getCurrentDict() {
    return this.globalData.currentDict
  },

  // ===== 主题相关 =====
  applyTheme() {
    const setting = this.getSetting()
    let theme = setting.theme
    if (theme === 'auto') {
      const systemInfo = wx.getSystemInfoSync()
      theme = systemInfo.theme || 'light'
    }
    // 存储当前实际主题供页面使用
    this.globalData.currentTheme = theme
    const pages = getCurrentPages()
    pages.forEach(page => {
      if (page.setData) {
        page.setData({ _theme: theme })
      }
    })
  },

  toggleTheme() {
    const setting = this.getSetting()
    const current = this.globalData.currentTheme || 'light'
    const newTheme = current === 'light' ? 'dark' : 'light'
    // 始终设置为具体值而非 auto
    this.updateSetting('theme', newTheme)
    this.globalData.currentTheme = newTheme
    this.applyTheme()
    return newTheme
  },

  getTheme() {
    return this.globalData.currentTheme || 'light'
  }
})
