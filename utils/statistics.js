// utils/statistics.js - 统计计算工具

/**
 * 格式化时间（毫秒 → mm:ss）
 */
function formatTime(ms) {
  if (!ms || ms < 0) return '00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * 格式化时间（毫秒 → 人类可读）
 */
function formatDuration(ms) {
  if (!ms || ms < 0) return '0秒'
  const totalSeconds = Math.floor(ms / 1000)
  if (totalSeconds < 60) return `${totalSeconds}秒`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes < 60) return `${minutes}分${seconds}秒`
  const hours = Math.floor(minutes / 60)
  const remainMin = minutes % 60
  return `${hours}小时${remainMin}分`
}

/**
 * 计算 WPM (Words Per Minute)
 * 标准：5个字符 = 1个词
 */
function calcWPM(totalChars, timeMs) {
  if (!timeMs || timeMs <= 0) return 0
  const minutes = timeMs / 60000
  const words = totalChars / 5
  return Math.round(words / minutes)
}

/**
 * 计算正确率
 */
function calcAccuracy(correct, total) {
  if (!total || total <= 0) return 0
  return Math.round((correct / total) * 100)
}

/**
 * 计算练习统计结果
 */
function calcPracticeStats(chapterWords, correctWords, wrongWords, totalTimeMs, totalChars) {
  const total = chapterWords.length
  const correct = correctWords.length
  const wrong = wrongWords.length

  return {
    total: total,
    correct: correct,
    wrong: wrong,
    accuracy: calcAccuracy(correct, total),
    wpm: calcWPM(totalChars, totalTimeMs),
    time: totalTimeMs,
    timeFormatted: formatTime(totalTimeMs)
  }
}

/**
 * 格式化日期
 */
function formatDate(timestamp) {
  const d = new Date(timestamp)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${min}`
}

/**
 * 格式化短日期
 */
function formatShortDate(timestamp) {
  const d = new Date(timestamp)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${month}/${day}`
}

/**
 * 获取本周起始日期
 */
function getWeekStart() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * 获取本月起始日期
 */
function getMonthStart() {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * 获取累计统计数据
 */
function getSummaryStats(records) {
  if (!records || records.length === 0) {
    return {
      totalPractices: 0,
      totalWords: 0,
      totalCorrect: 0,
      totalTime: 0,
      avgAccuracy: 0,
      avgWPM: 0,
      bestWPM: 0,
      bestAccuracy: 0
    }
  }

  const totalPractices = records.length
  const totalWords = records.reduce((sum, r) => sum + (r.total || 0), 0)
  const totalCorrect = records.reduce((sum, r) => sum + (r.correct || 0), 0)
  const totalTime = records.reduce((sum, r) => sum + (r.time || 0), 0)
  const avgAccuracy = calcAccuracy(totalCorrect, totalWords)
  const avgWPM = Math.round(records.reduce((sum, r) => sum + (r.wpm || 0), 0) / totalPractices)
  const bestWPM = Math.max(...records.map(r => r.wpm || 0))
  const bestAccuracy = Math.max(...records.map(r => r.accuracy || 0))

  return {
    totalPractices,
    totalWords,
    totalCorrect,
    totalTime,
    avgAccuracy,
    avgWPM,
    bestWPM,
    bestAccuracy
  }
}

module.exports = {
  formatTime,
  formatDuration,
  calcWPM,
  calcAccuracy,
  calcPracticeStats,
  formatDate,
  formatShortDate,
  getWeekStart,
  getMonthStart,
  getSummaryStats
}
