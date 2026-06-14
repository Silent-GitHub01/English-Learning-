// utils/storage.js - 本地存储工具
/**
 * 安全读取本地存储
 */
function get(key, defaultValue = null) {
  try {
    const val = wx.getStorageSync(key)
    return val !== '' && val !== undefined ? val : defaultValue
  } catch (e) {
    return defaultValue
  }
}

/**
 * 安全写入本地存储
 */
function set(key, value) {
  try {
    wx.setStorageSync(key, value)
    return true
  } catch (e) {
    console.error(`存储 ${key} 失败:`, e)
    return false
  }
}

/**
 * 安全删除
 */
function remove(key) {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (e) {
    return false
  }
}

/**
 * 获取存储信息
 */
function getInfo() {
  try {
    return wx.getStorageInfoSync()
  } catch (e) {
    return { keys: [], currentSize: 0, limitSize: 10240 }
  }
}

/**
 * 清除所有存储
 */
function clear() {
  try {
    wx.clearStorageSync()
    return true
  } catch (e) {
    return false
  }
}

module.exports = {
  get,
  set,
  remove,
  getInfo,
  clear
}
