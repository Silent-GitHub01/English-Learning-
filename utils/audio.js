// utils/audio.js - 音频管理工具（完全防崩溃版）
const app = getApp()

// 音效文件 CDN 基础路径
const SOUND_CDN_BASE = 'https://cdn.jsdelivr.net/gh/Kaiyiwing/qwerty-learner@master/public/sound/'

// 有道发音 API
const PRONUNCIATION_API = 'https://dict.youdao.com/dictvoice?audio='

// 音效实例缓存
let keyboardAudioCtx = null
let wordAudioCtx = null

// 标记：CDN 音频是否可用
let cdnAudioAvailable = true

/**
 * 安全创建音频上下文（自动绑定错误处理）
 */
function createAudioContext(src) {
  try {
    const audio = wx.createInnerAudioContext()
    // 必须在设置 src 之前绑定 onError，防止解码错误崩溃
    audio.onError(() => {
      cdnAudioAvailable = false
      try { audio.destroy() } catch (e) { /* ignore */ }
    })
    audio.src = src
    return audio
  } catch (e) {
    return null
  }
}

/**
 * 安全销毁音频上下文
 */
function safeDestroy(audio) {
  try {
    if (audio) {
      audio.stop()
      audio.destroy()
    }
  } catch (e) { /* ignore */ }
}

/**
 * 初始化键盘音效
 */
function initKeyboardSound(soundFile) {
  const file = soundFile || '机械键盘2'
  safeDestroy(keyboardAudioCtx)
  keyboardAudioCtx = null
  
  if (!cdnAudioAvailable) return
  
  try {
    const url = SOUND_CDN_BASE + 'key-sounds/' + file + '.mp3'
    keyboardAudioCtx = createAudioContext(url)
    if (keyboardAudioCtx) {
      keyboardAudioCtx.volume = 0.6
    }
  } catch (e) {
    keyboardAudioCtx = null
  }
}

/**
 * 播放键盘音效
 */
function playKeyboardSound() {
  if (!cdnAudioAvailable) return
  
  try {
    const setting = app.getSetting()
    if (!setting || !setting.keyboardSound) return

    if (!keyboardAudioCtx) {
      initKeyboardSound(setting.keyboardSoundFile)
    }
    
    if (!keyboardAudioCtx) return

    keyboardAudioCtx.volume = ((setting.keyboardSoundVolume || 80) / 100)
    keyboardAudioCtx.seek(0)
    keyboardAudioCtx.play()
  } catch (e) {
    // 静默失败，不影响打字体验
    keyboardAudioCtx = null
  }
}

/**
 * 播放效果音（正确/错误提示音）- 一次性播放
 */
function playEffectSound(soundName, volume) {
  if (!cdnAudioAvailable) return
  
  try {
    const setting = app.getSetting()
    if (!setting || !setting.effectSound) return

    const url = SOUND_CDN_BASE + soundName + '.wav'
    const audio = createAudioContext(url)
    if (!audio) return
    
    audio.volume = (volume || 80) / 100

    audio.onEnded(() => {
      safeDestroy(audio)
    })

    audio.play()
  } catch (e) {
    // 静默失败
  }
}

/**
 * 播放正确音效
 */
function playCorrectSound() {
  playEffectSound('correct', 80)
}

/**
 * 播放错误音效
 */
function playErrorSound() {
  playEffectSound('beep', 60)
}

/**
 * 播放单词发音（使用有道API）
 * @param {string} word 单词
 * @param {string} type 'us'(美式) | 'uk'(英式)
 */
function playWordPronunciation(word, type) {
  if (!word) return
  
  try {
    const setting = app.getSetting()
    const soundType = type || (setting ? setting.soundType : 'us') || 'us'
    const typeParam = soundType === 'uk' ? '1' : '2'
    const url = `${PRONUNCIATION_API}${encodeURIComponent(word)}&type=${typeParam}`

    safeDestroy(wordAudioCtx)
    wordAudioCtx = null

    wordAudioCtx = createAudioContext(url)
    if (!wordAudioCtx) return

    wordAudioCtx.volume = ((setting ? setting.wordSoundVolume : 80) || 80) / 100
    wordAudioCtx.playbackRate = (setting ? setting.wordSoundSpeed : 1) || 1
    wordAudioCtx.play()
  } catch (e) {
    // 静默失败
  }
}

/**
 * 停止当前单词发音
 */
function stopWordPronunciation() {
  try {
    if (wordAudioCtx) {
      wordAudioCtx.stop()
    }
  } catch (e) { /* ignore */ }
}

/**
 * 销毁所有音频
 */
function destroyAllAudio() {
  safeDestroy(keyboardAudioCtx)
  safeDestroy(wordAudioCtx)
  keyboardAudioCtx = null
  wordAudioCtx = null
}

module.exports = {
  initKeyboardSound,
  playKeyboardSound,
  playEffectSound,
  playCorrectSound,
  playErrorSound,
  playWordPronunciation,
  stopWordPronunciation,
  destroyAllAudio
}
