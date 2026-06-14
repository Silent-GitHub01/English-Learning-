# 英语打字学习项目（TypeWords / Qwerty Learner）深度拆解与微信小程序复刻方案

---

## 1. 项目基础信息

| 维度 | 详情 |
|------|------|
| **项目名称** | Qwerty Learner（TypeWords） |
| **项目类型** | Web 单页应用（SPA） |
| **原始仓库** | GitHub: Kaiyiwing/qwerty-learner |
| **技术栈** | Vue 3 + TypeScript + Vite + Pinia + Vue Router + UnoCSS + idb-keyval |
| **目标用户** | 英语学习者（小学→大学→考研→出国考试全覆盖） |
| **核心功能** | 键盘打字背单词、文章打字练习、词典浏览与管理、单词测试、学习统计、自定义词库、发音播放 |

### 核心功能清单
1. **单词打字练习** - 通过键盘打字记忆单词，实时显示正确/错误
2. **文章打字练习** - 整段文章打字，逐字符校验
3. **词典管理** - 100+ 内置词库（CET-4/6、IELTS、TOEFL、GRE、考研、中小学……）
4. **单词测试** - 基于释义的4选1选择题
5. **学习统计** - 速度(WPM)、正确率、用时、错词记录
6. **错词本** - 自动收集错误单词，支持复练
7. **生词本/收藏** - 用户自定义收藏单词
8. **多语言发音** - Web Speech API 实现单词朗读
9. **键盘音效** - 打字时播放机械键盘音效
10. **暗黑模式** - 支持亮/暗主题切换
11. **用户系统** - 注册/登录/会员（可选）
12. **自定义词库** - 用户可导入/导出 JSON 词库

---

## 2. 目录结构（树形）

```
TypeWords-master/
├── index.html                         # 入口 HTML
├── package.json                       # 依赖管理（Vue3/Vite/Pinia/UnoCSS）
├── vite.config.mts                    # Vite 构建配置
├── tsconfig.json                      # TypeScript 配置
├── uno.config.ts                      # UnoCSS 配置
├── postcss.config.mjs                 # PostCSS 配置
├── README.md                          # 项目说明
├── public/
│   ├── favicon.png
│   ├── logo-text-black.png / white.png
│   ├── manifest.json                  # PWA manifest
│   ├── service-worker.js              # PWA Service Worker
│   ├── robots.txt
│   ├── privacy-policy.html            # 隐私政策
│   ├── user-agreement.html            # 用户协议
│   ├── static-home.html               # 静态首页
│   ├── sound/
│   │   ├── beep.wav                   # 提示音
│   │   ├── correct.wav                # 正确音效
│   │   ├── key-sounds/                # 键盘音效（笔记本/机械/老式）
│   │   └── article/                   # 文章配音（NCE 课文音频）
│   ├── dicts/en/
│   │   ├── word/                      # 词库 JSON 文件（100+词库）
│   │   └── article/                   # 文章 JSON 文件（NCE 1-4）
│   ├── list/
│   │   ├── word.json                  # 词库索引（词库列表配置）
│   │   ├── article.json               # 文章库索引
│   │   ├── recommend_word.json        # 推荐词库
│   │   └── recommend_article.json     # 推荐文章
│   └── imgs/                          # 引导图片
│
└── src/
    ├── main.ts                        # 应用入口
    ├── App.vue                        # 根组件
    ├── router.ts                      # 路由配置
    ├── vite-env.d.ts                  # Vite 类型声明
    │
    ├── apis/                          # API 层
    │   ├── index.ts                   # API 入口
    │   ├── user.ts                    # 用户相关 API
    │   └── member.ts                  # 会员相关 API
    │
    ├── assets/
    │   ├── css/
    │   │   ├── style.scss             # 全局样式（CSS变量、布局）
    │   │   ├── anim.scss              # 动画样式（过渡、抖动）
    │   │   └── shepherd.css           # 引导样式
    │   └── img/
    │       └── 缺省页_空白页-通用.svg
    │
    ├── components/                    # 通用组件
    │   ├── base/                      # 基础UI组件
    │   │   ├── Audio.vue              # 音频播放器（含波形）
    │   │   ├── BaseInput.vue          # 输入框
    │   │   ├── InputNumber.vue        # 数字输入
    │   │   ├── Pagination.vue         # 分页
    │   │   ├── Progress.vue           # 进度条
    │   │   ├── Slider.vue             # 滑块
    │   │   ├── Switch.vue             # 开关
    │   │   ├── Textarea.vue           # 文本域
    │   │   ├── Tooltip.vue            # 气泡提示
    │   │   ├── checkbox/Checkbox.vue  # 复选框
    │   │   ├── form/Form.vue          # 表单容器（含校验）
    │   │   ├── form/FormItem.vue      # 表单项
    │   │   ├── form/types.ts          # 表单类型
    │   │   ├── radio/Radio.vue        # 单选框
    │   │   ├── radio/RadioGroup.vue   # 单选组
    │   │   ├── select/Select.vue      # 下拉选择
    │   │   ├── select/Option.vue      # 选项
    │   │   └── toast/                 # 消息提示（函数式调用）
    │   │       ├── Toast.ts
    │   │       ├── Toast.vue
    │   │       └── type.ts
    │   ├── dialog/                    # 对话框
    │   │   ├── Dialog.vue             # 通用对话框
    │   │   └── MiniDialog.vue         # 迷你对话框
    │   ├── icon/                      # 图标组件
    │   │   ├── Close.vue
    │   │   ├── DeleteIcon.vue
    │   │   └── VolumeIcon.vue         # 发音喇叭图标
    │   ├── list/                      # 列表组件
    │   │   ├── BaseList.vue           # 基础列表
    │   │   ├── List.vue               # 可拖拽排序列表
    │   │   ├── WordList.vue           # 单词列表（含发音按钮）
    │   │   ├── ArticleList.vue        # 文章列表
    │   │   ├── DictList.vue           # 词典列表
    │   │   └── DictGroup.vue          # 词典分组
    │   ├── slide/                     # 滑动组件
    │   │   ├── SlideHorizontal.vue
    │   │   ├── SlideItem.vue
    │   │   ├── common.js
    │   │   └── data.js
    │   ├── BackIcon.vue               # 返回图标
    │   ├── BaseButton.vue             # 通用按钮
    │   ├── BaseIcon.vue               # 通用图标容器
    │   ├── BasePage.vue               # 通用页面容器
    │   ├── BaseTable.vue              # 通用表格
    │   ├── Book.vue                   # 书籍展示组件
    │   ├── ChannelIcons.vue           # 渠道图标（QQ/微信等）
    │   ├── ConflictNotice.vue         # 冲突提示
    │   ├── EditAbleText.vue           # 可编辑文本
    │   ├── Empty.vue                  # 空状态
    │   ├── Header.vue                 # 顶部导航
    │   ├── Logo.vue                   # Logo
    │   ├── MigrateDialog.vue          # 数据迁移对话框
    │   ├── Panel.vue                  # 面板容器
    │   ├── PopConfirm.vue             # 气泡确认
    │   ├── PracticeLayout.vue         # 练习页布局（双栏）
    │   ├── Slide.vue                  # 滑动容器
    │   └── WordItem.vue               # 单词项
    │
    ├── config/
    │   ├── auth.ts                    # 认证配置
    │   └── env.ts                     # 环境配置（API地址、词库列表）
    │
    ├── directives/
    │   └── loading.tsx                # 加载指令
    │
    ├── hooks/                         # 组合式函数（核心业务逻辑）
    │   ├── article.ts                 # 文章学习核心逻辑
    │   ├── dict.ts                    # 词典管理逻辑
    │   ├── event.ts                   # 键盘事件处理（最核心）
    │   ├── export.ts                  # 数据导入导出
    │   ├── sound.ts                   # 发音播放逻辑
    │   ├── theme.ts                   # 主题切换逻辑
    │   └── translate.ts               # 翻译逻辑
    │
    ├── libs/
    │   ├── qs.ts                      # 查询字符串解析
    │   └── translate/
    │       └── baidu.ts               # 百度翻译 API 封装
    │
    ├── locales/                       # 国际化
    │   ├── zh-CN.ts                   # 中文语言包
    │   └── i18n.json                  # i18n 配置
    │
    ├── pages/                         # 页面组件
    │   ├── layout.vue                 # 主布局（侧边栏+移动端导航）
    │   ├── article/
    │   │   ├── ArticlesPage.vue       # 文章主页
    │   │   ├── BatchEditArticlePage.vue # 批量编辑文章
    │   │   ├── BookDetail.vue         # 书籍详情
    │   │   ├── BookList.vue           # 书籍列表
    │   │   └── PracticeArticles.vue   # 文章练习（核心）
    │   ├── setting/
    │   │   ├── Setting.vue            # 设置页（含暗黑模式/键盘音效/练习设置）
    │   │   └── SettingItem.vue        # 设置项
    │   ├── word/
    │   │   ├── WordsPage.vue          # 单词主页
    │   │   ├── DictList.vue           # 词典列表
    │   │   ├── DictDetail.vue         # 词典详情+编辑
    │   │   ├── PracticeWords.vue      # 单词练习（核心）
    │   │   ├── Statistics.vue         # 学习统计
    │   │   └── WordTest.vue           # 单词测试
    │   ├── user/
    │   │   ├── login.vue              # 登录/注册/找回密码
    │   │   ├── Code.vue               # 验证码发送
    │   │   ├── Notice.vue             # 协议提示
    │   │   ├── User.vue               # 用户中心
    │   │   └── VipIntro.vue           # 会员介绍
    │   └── test/
    │       ├── test.vue               # 测试页面
    │       └── data.json              # 测试数据
    │
    ├── stores/                        # Pinia 状态管理
    │   ├── base.ts                    # 基础状态（用户认证、通用设置）
    │   ├── practice.ts                # 练习状态
    │   ├── runtime.ts                 # 运行时状态
    │   ├── setting.ts                 # 设置状态
    │   └── user.ts                    # 用户状态
    │
    ├── types/                         # TypeScript 类型定义
    │   ├── types.ts                   # 核心类型（Word/Dict/Article/Book）
    │   ├── func.ts                    # 函数类型
    │   └── global.d.ts               # 全局声明
    │
    └── utils/                         # 工具函数
        ├── index.ts                   # 通用工具（499行）
        ├── http.ts                    # HTTP 请求封装
        ├── eventBus.ts                # 事件总线
        ├── validation.ts              # 校验工具
        └── gm.js                      # Greasemonkey 兼容
```

---

## 3. 整体架构

### 3.1 架构模式：MVVM（Vue 3 Composition API）

```
┌──────────────────────────────────────────────────────────────┐
│                        用户界面层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Pages    │  │Components│  │ Layout   │  │ Directives   │ │
│  │ 页面组件  │  │ 通用组件  │  │ 布局组件  │  │ 指令         │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │
└───────┼──────────────┼─────────────┼───────────────┼─────────┘
        │              │             │               │
┌───────┼──────────────┼─────────────┼───────────────┼─────────┐
│       ▼              ▼             ▼               ▼         │
│                      业务逻辑层 (Hooks)                        │
│  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐ │
│  │ event.ts  │ │ dict.ts  │ │article.ts│ │ sound.ts      │ │
│  │ 键盘事件   │ │ 词典管理  │ │ 文章管理  │ │ 发音          │ │
│  └─────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬───────┘ │
│        │             │           │                │         │
│  ┌─────┴─────┐ ┌─────┴─────┐ ┌──┴──────┐  ┌──────┴───────┐ │
│  │translate  │ │ export.ts │ │theme.ts │  │  useOnline   │ │
│  │ 翻译      │ │ 导入导出   │ │ 主题     │  │  在线状态     │ │
│  └───────────┘ └───────────┘ └─────────┘  └──────────────┘ │
└───────┬─────────────────────────────────────────────────────┘
        │
┌───────┼─────────────────────────────────────────────────────┐
│       ▼             状态管理层 (Pinia Stores)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ base.ts  │ │practice  │ │runtime   │ │ setting.ts   │   │
│  │ 基础状态  │ │ 练习状态  │ │ 运行时   │ │ 设置         │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│                    ┌──────────┐                              │
│                    │ user.ts  │                              │
│                    │ 用户     │                              │
│                    └──────────┘                              │
└───────┬─────────────────────────────────────────────────────┘
        │
┌───────┼─────────────────────────────────────────────────────┐
│       ▼              数据持久层                               │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │ IndexedDB   │  │ localStorage│  │   Remote JSON (CDN)  │ │
│  │ (idb-keyval)│  │ (设置/缓存) │  │   (词库/文章数据)     │ │
│  └─────────────┘  └─────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 数据流

```
用户键盘输入 → event.ts (hook) → practice store → 页面渲染
                                        ↓
                              触发判分 / 发音 / 章节切换
                                        ↓
                              更新 IndexedDB 学习记录
```

### 3.3 路由表

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | WordsPage | 单词主页（默认） |
| `/article` | ArticlesPage | 文章主页 |
| `/dict` | DictList | 词典浏览 |
| `/dict/:id` | DictDetail | 词典详情与编辑 |
| `/word/:id` | PracticeWords | 单词练习（核心） |
| `/article/:id` | PracticeArticles | 文章练习（核心） |
| `/test/:id` | WordTest | 单词测试 |
| `/book` | BookList | 书籍列表 |
| `/book/:id` | BookDetail | 书籍详情 |
| `/user` | User | 用户中心 |
| `/login` | login | 登录注册 |
| `/setting` | Setting | 设置页 |
| `/vip` | VipIntro | 会员介绍 |
| `/batch-edit-articles` | BatchEditArticlePage | 批量编辑 |
| `/test-page` | test | 测试页 |

---

## 4. 核心业务模块（英语专项）

### 4.1 单词打字练习（最核心模块）

**功能说明：**
用户通过键盘逐字母输入屏幕上显示的英文单词，输入正确则自动进入下一个词，输入错误则字母变红并回弹重置。支持盲打模式（单词不显示）、翻转模式（先看中文再打英文）、循环模式、随机模式。

**代码入口：**
- 页面：`/pages/word/PracticeWords.vue`（773行）
- 路由：`/word/:id`
- 核心 hook：`/hooks/event.ts`（352行，键盘事件处理）
- 核心 hook：`/hooks/dict.ts`（191行，词典加载与章节管理）
- 核心 hook：`/hooks/sound.ts`（144行，发音）
- Store：`/stores/practice.ts`

**核心流程：**

```
1. 路由进入 → 从 URL params 获取 dict id
2. dict.ts: 加载词典 JSON (fetch → IndexedDB 缓存)
3. dict.ts: 分组（每 chapterSize 个词为一章）→ 取当前章节词列表
4. PracticeWords.vue: 渲染第一个单词
5. event.ts: 监听 keydown 事件
   ├─ 字母/数字键 → 与当前 word 逐字符比对
   │  ├─ 匹配 → index++ ，字符变绿色，播放打字音效
   │  ├─ 错误 → 所有已输入字符重置，当前字符变红+抖动
   │  └─ 全部匹配 → 进入下一个词
   └─ 空格键 → 跳过/重置当前词
6. 章节完成 → Statistics 弹窗（WPM/正确率/用时/错词）
7. 自动进入下一章 或 循环练习
```

**核心数据结构 (Word):**

```typescript
interface Word {
  name: string          // 单词本体，如 "abandon"
  trans: Translation[]  // 释义数组
  usphone: string       // 美式音标
  ukphone: string       // 英式音标
  // 扩展字段：
  id?: string
  chapter?: number
  // 用户数据：
  isCollect?: boolean   // 是否收藏
  isWrong?: boolean     // 是否在错词本
}

interface Translation {
  pos: string           // 词性，如 "vt."
  cn: string            // 中文释义
}

// 词典索引
interface DictInfo {
  id: string
  name: string
  description: string
  category: string      // "中国考试" | "国际考试" | "青少年英语" | "代码练习"
  tags: string[]
  url: string           // JSON 文件路径
  length: number        // 单词总数
  language: string      // "en"
  translateLanguage: string // "zh-CN"
}
```

**练习状态 (practice store):**

```typescript
interface PracticeState {
  currentWordIndex: number     // 当前单词在章节中的索引
  currentCharIndex: number     // 当前单词已输入的字符位置
  wrongWords: Word[]           // 本章节错词
  correctWords: Word[]         // 本章节正确词
  totalTime: number            // 累计用时(ms)
  chapterIndex: number         // 当前章节号
  inputHistory: string[]       // 输入历史
  // ...
}
```

**第三方能力：**
- **发音**：Web Speech API (`SpeechSynthesisUtterance`) - 浏览器原生 TTS
- **翻译**：百度翻译 API（可选，用于自定义词库翻译）
- **键盘音效**：本地 .wav/.mp3 文件播放（机械键盘/笔记本键盘/老式键盘）

---

### 4.2 文章打字练习

**功能说明：**
用户在左侧显示英文文章，逐字符输入，实时反馈正确/错误状态。类似 MonkeyType 体验，支持全文滚动、逐句练习。

**代码入口：**
- 页面：`/pages/article/PracticeArticles.vue`（797行）
- 路由：`/article/:id`
- 核心 hook：`/hooks/article.ts`（381行）

**数据结构 (Article):**

```typescript
interface Article {
  id: string
  title: string             // 文章标题
  titleTranslate: string    // 标题翻译
  content: string           // 英文原文
  // 预处理后的数据结构：
  words: ArticleWord[]      // 按单词拆分后的数组
  translate?: string        // 全文翻译
}

interface ArticleWord {
  id: string
  chars: string[]           // 单词拆分为字符数组
  status: 'correct' | 'wrong' | 'current' | 'pending'
  index: number
  // 含空格/标点的字符拆分...
}
```

**核心流程：**
```
1. 加载文章 JSON → 预解析 content 为 words 数组
2. 渲染所有字符（每个字符一个 span，含灰色占位）
3. 监听 keydown → 逐字符匹配
4. 正确 → 字符绿色高亮
5. 错误 → 字符红色高亮 + 抖动动画
6. 全文完成 → 统计（WPM/准确率/用时）
```

---

### 4.3 单词测试

**功能说明：**
4选1释义选择题，测试对单词的掌握程度。

**代码入口：**
- 页面：`/pages/word/WordTest.vue`（249行）
- 路由：`/test/:id`

**核心流程：**
```
1. 从词典取当前章节词
2. 随机选1个正确词 + 3个干扰词（从同词典随机取）
3. 显示单词和4个中文释义选项
4. 用户选择 → 判断对错
5. 全部完成 → 统计
```

---

### 4.4 错词本

**功能说明：**
自动收集练习中的错误单词，支持重练。

**实现方式：**
- PracticeWords.vue 中 `wrongWords` ref 收集本章错词
- 练习结束后通过 `indexedDB` 持久化到 `SAVE_DICT_KEY`（idb-keyval）
- 存放路径：`dictName + '_wrong'`（如 `cet4_wrong`）

---

### 4.5 学习记录 / 打卡

**实现方式：**
- 本地 `localStorage` 存储每日练习记录
- 记录维度：日期、练习词典、单词数、正确率、用时
- Web 端未接入后端打卡系统（小程序可接入）

---

### 4.6 词库管理

**功能说明：**
浏览、搜索、编辑、导入/导出词库。

**代码入口：**
- 词典列表：`/pages/word/DictList.vue`
- 词典详情：`/pages/word/DictDetail.vue`（773行，含单词增删改）
- 导入导出：`/hooks/export.ts`

**词库数据来源：**
- 内置 100+ 词库 JSON 文件（放置在 `public/dicts/en/word/` 或通过 CDN 加载）
- 词库索引配置在 `src/config/env.ts`（`DICT_LIST` 常量）
- 用户自定义词库存放在 IndexedDB

---

## 5. 公共能力

### 5.1 工具函数（`utils/index.ts`，499行）

| 函数 | 功能 |
|------|------|
| `debounce` / `throttle` | 防抖/节流 |
| `cloneDeep` | 深拷贝 |
| `formatTime` | 时间格式化 |
| `_getDictDataByUrl` | 远程加载词库 JSON |
| `LRU` 类 | LRU 缓存实现 |
| `getWordPath` | 获取词典存储路径 |
| `shuffleArray` | Fisher-Yates 洗牌算法 |
| `splitWord` | 按音节拆分单词 |
| `isLegalWord` | 校验单词合法性 |
| `getChapterWords` | 获取某章节单词列表 |

### 5.2 HTTP 请求封装（`utils/http.ts`）

```typescript
// 基于 fetch 封装
const http = {
  get(url, params): Promise,
  post(url, data): Promise,
  // 自动处理 Authorization header
  // 自动处理错误响应
}
```

### 5.3 缓存策略（三层）

```
1. 内存缓存：LRU 缓存字典数据（hooks/dict.ts）
2. IndexedDB 缓存：通过 idb-keyval 持久化词库 JSON
3. localStorage 缓存：设置项、用户偏好
```

### 5.4 通用组件清单

| 组件 | 功能 |
|------|------|
| `PracticeLayout` | 练习页通用双栏布局 |
| `WordList` | 单词列表（含发音按钮） |
| `BaseTable` | 通用表格 |
| `Pagination` | 分页器 |
| `Toast` | 函数式消息提示 |
| `Dialog` / `MiniDialog` | 对话框 |
| `Form` / `FormItem` | 表单+校验 |
| `PopConfirm` | 气泡确认 |
| `Empty` | 空状态 |
| `Progress` | 进度条 |
| `Slider` / `Switch` / `BaseInput` | 基础表单控件 |

---

## 6. 数据库 / 存储

### 6.1 数据表清单（Web→小程序映射）

| 数据 | Web 存储方式 | 小程序存储方式 |
|------|-------------|--------------|
| 词库数据 (JSON) | IndexedDB + CDN JSON | 云存储 CDN + 本地缓存 |
| 用户自定义词库 | IndexedDB (`SAVE_DICT_KEY`) | wx.setStorage / 云数据库 |
| 错词本 | IndexedDB | wx.setStorage / 云数据库 |
| 收藏词 | IndexedDB | wx.setStorage / 云数据库 |
| 练习记录 | localStorage | wx.setStorage / 云数据库 |
| 用户设置 | localStorage | wx.setStorageSync |
| 用户信息 | 远程 API + localStorage | wx.login + 云数据库 |
| 学习进度 | IndexedDB | 云数据库 |

### 6.2 核心数据结构

**词库 JSON 格式（CET4_T.json 示例）：**

```json
[
  {
    "name": "abandon",
    "trans": [
      {"pos": "vt.", "cn": "放弃；遗弃；抛弃"}
    ],
    "usphone": "əˈbændən",
    "ukphone": "əˈbændən"
  },
  ...
]
```

**IndexedDB key 设计：**
```
SAVE_DICT_KEY = "SAVE_DICT_MAP"  →  { dictName: Word[] }  // 自定义词库
dictName + "_wrong"             →  Word[]                  // 错词本
dictName + "_collect"           →  Word[]                  // 收藏
```

---

## 7. 前端页面 & 交互

### 7.1 路由与页面跳转

```
首页 (/) → 选择词典 → 点击"开始练习" → /word/:id
       → 选择文章 → /article → /article/:id
       → 浏览词典 → /dict → /dict/:id
       → 测试 → /test/:id
       → 设置 → /setting
       → 登录 → /login → /user
```

### 7.2 核心交互逻辑

#### 单词练习交互流程

```
┌─────────────────────────────────────────────────────┐
│  [进度条] 第 X/Y 个词    ⏱ 00:25    WPM: 42        │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│   abandon            │  vt. 放弃；遗弃；抛弃         │
│   ─────────          │                              │
│   a b a n █          │  [喇叭] 发音                  │
│                      │                              │
│   [已输入绿色正显示]   │  进度条：                     │
│                      │  ████████░░░░ 70%            │
│                      │                              │
│                      │  [章节切换]                   │
├──────────────────────┴──────────────────────────────┤
│  键盘输入区（隐藏，实际监听全局 keydown）              │
└─────────────────────────────────────────────────────┘
```

#### 判分逻辑（`hooks/event.ts`）

```
keydown → 获取 key 值
  ├─ 非字母/数字/引号/连字符 → 忽略
  ├─ key === 当前字符
  │  ├─ currentCharIndex++
  │  ├─ 播放打字音效
  │  ├─ 字符标记为正确（绿色）
  │  └─ currentCharIndex === word.length → 单词完成
  │      ├─ 推入 correctWords
  │      ├─ 播放正确音效 (correct.wav)
  │      ├─ 自动读词发音
  │      └─ 进入下一个词
  └─ key !== 当前字符
     ├─ 当前单词推入 wrongWords
     ├─ 所有字符重置（变红+抖动动画）
     ├─ 播放错误提示音
     └─ currentCharIndex = 0
```

#### 计时逻辑

- 用户按下第一个键时开始计时
- 章节最后一个词输入完毕时停止计时
- 实时计算 WPM（字符数 / 5 / 分钟）

---

## 8. 接口文档（后端）

### 8.1 接口清单

原始项目提供了用户系统后端，接口如下：

| 接口 | 方法 | 路径 | 参数 | 说明 |
|------|------|------|------|------|
| 登录 | POST | `/api/user/login` | `{account, password}` | 账号密码登录 |
| 注册 | POST | `/api/user/register` | `{account, password, code, email?}` | 注册 |
| 忘记密码 | POST | `/api/user/forgot` | `{account, password, code}` | 重置密码 |
| 发送验证码 | POST | `/api/user/sendCode` | `{email, type:'login'\|'register'\|'forget'}` | 发邮箱验证码 |
| 获取用户信息 | GET | `/api/user/info` | - | 需 Authorization |
| 修改用户信息 | PUT | `/api/user/info` | `{nickname?, avatar?}` | 更新昵称/头像 |
| 会员信息 | GET | `/api/member/info` | - | 会员状态 |
| 创建支付订单 | POST | `/api/member/createOrder` | `{productId}` | 生成订单 |
| Google 登录 | POST | `/api/user/googleLogin` | `{credential}` | Google OAuth |

### 8.2 小程序简化方案

小程序复刻时，建议使用**微信云开发**替代后端：

| 原接口 | 小程序替代 |
|--------|-----------|
| 注册/登录 | `wx.login()` + 云函数自动注册 |
| 用户信息 | 云数据库 `users` 集合 |
| 学习记录同步 | 云数据库 `records` 集合 |
| 词库数据 | 云存储 CDN |

---

## 9. 运行 & 部署

### 9.1 原 Web 项目运行

```bash
# 安装依赖
cd TypeWords-master
npm install

# 开发运行
npm run dev          # 启动在 localhost:5173

# 构建生产
npm run build        # 输出到 dist/
npm run preview      # 预览构建产物
```

### 9.2 环境配置

```typescript
// src/config/env.ts
export const IS_DEV = import.meta.env.DEV
export const API_BASE = IS_DEV
  ? 'http://localhost:3100'
  : 'https://api.qwerty-learner.com'

// 词库 CDN 地址
export const DICT_BASE_URL = 'https://your-cdn.com/dicts/'
```

---

## 10. 复刻开发方案（重点）

### 10.1 技术选型建议

| 维度 | 原 Web 项目 | 小程序复刻推荐 |
|------|-----------|---------------|
| **框架** | Vue 3 Composition API | 微信原生框架（WXML+WXSS+JS/TS） |
| **状态管理** | Pinia | 全局 App + Behavior / 简易 Store |
| **路由** | Vue Router | 小程序 app.json pages 配置 |
| **样式** | UnoCSS + SCSS | WXSS（可直接复用 CSS 变量体系） |
| **存储** | IndexedDB + localStorage | wx.setStorageSync / 云数据库 |
| **发音** | Web Speech API | `wx.createInnerAudioContext` + 云存储音频 |
| **网络请求** | fetch | `wx.request` |
| **组件库** | 自研 | 自研 + TDesign 小程序组件 |
| **后端/云** | Express + MySQL | 微信云开发（云函数+云数据库+云存储） |
| **音效** | 本地 .wav/.mp3 | 云存储音频文件 + InnerAudioContext |

**推荐技术栈：**
- **前端**：微信小程序原生（TS）
- **组件库**：TDesign WeChat（可选，简化 UI 开发）
- **云服务**：微信云开发（CloudBase）
  - 云函数：核心业务逻辑
  - 云数据库：用户、学习记录、自定义词库
  - 云存储：词库 JSON、音频文件
  - CDN：静态资源加速

### 10.2 新项目目录结构

```
miniprogram-2/
├── app.js                     # 入口，全局数据
├── app.json                   # 页面路由、窗口配置
├── app.wxss                   # 全局样式
├── project.config.json        # 项目配置
├── sitemap.json
│
├── miniprogram_npm/           # npm 构建产物（如 TDesign）
│
├── cloudfunctions/            # 云函数
│   ├── login/                 # 用户登录
│   ├── getDicts/              # 获取词库列表
│   ├── getUserData/           # 获取用户数据
│   └── syncRecord/            # 同步学习记录
│
├── components/                # 自定义组件
│   ├── word-card/             # 单词卡片（核心）
│   ├── progress-bar/          # 进度条
│   ├── chapter-selector/      # 章节选择器
│   ├── statistics-dialog/     # 统计弹窗
│   ├── audio-player/          # 音频播放器
│   ├── dict-item/             # 词典列表项
│   ├── empty-state/           # 空状态
│   └── loading/               # 加载
│
├── pages/
│   ├── index/                 # 首页（单词/文章入口）
│   ├── practice/              # 练习页
│   │   ├── word/              # 单词练习
│   │   └── article/           # 文章练习
│   ├── dict/                  # 词典管理
│   │   ├── list/              # 词典列表
│   │   └── detail/            # 词典详情
│   ├── test/                  # 单词测试
│   ├── stats/                 # 学习统计
│   ├── wrong-book/            # 错词本
│   ├── setting/               # 设置
│   └── user/                  # 用户中心
│       ├── login/             # 登录
│       └── profile/           # 个人信息
│
├── utils/
│   ├── request.js             # 请求封装
│   ├── storage.js             # 存储工具
│   ├── audio.js               # 音频管理
│   ├── keyboard.js            # 键盘处理（小程序原生 input）
│   ├── dict.js                # 词典工具
│   └── statistics.js          # 统计工具
│
├── store/                     # 简易状态管理
│   ├── practice.js            # 练习状态
│   └── user.js                # 用户状态
│
└── styles/                    # 公共样式
    ├── variables.wxss         # CSS 变量
    ├── common.wxss            # 通用样式
    └── animation.wxss         # 动画样式
```

### 10.3 模块开发顺序 & 优先级

| 优先级 | 模块 | 预估工时 | 说明 |
|--------|------|---------|------|
| **P0** | 项目初始化 + 路由配置 | 0.5天 | app.json, 页面骨架 |
| **P0** | 词典数据加载与管理 | 1天 | 加载 JSON、章节分组、缓存 |
| **P0** | 单词练习核心 | 3天 | 键盘输入、逐字匹配、判分、发音、章节切换 |
| **P0** | 练习统计 | 0.5天 | 完成弹窗、WPM/正确率 |
| **P1** | 词典选择页 | 1天 | 分类、搜索、选择 |
| **P1** | 文章练习 | 2天 | 文章加载、逐字符匹配、滚动 |
| **P1** | 错词本 | 0.5天 | 收集、存储、重练 |
| **P1** | 单词测试 | 1天 | 4选1、判分 |
| **P1** | 设置页 | 1天 | 主题、音效、练习参数 |
| **P2** | 用户系统 | 1天 | wx.login、云开发登录 |
| **P2** | 学习记录同步 | 1天 | 云数据库同步 |
| **P2** | 自定义词库 | 1天 | 导入 JSON、编辑 |
| **P2** | 发音优化 | 1天 | 云存储音频文件 |
| **P3** | UI 美化 | 2天 | 动画、主题切换 |
| **P3** | 数据统计图表 | 1天 | 学习趋势图表 |

### 10.4 数据库设计（云数据库）

```javascript
// users 集合
{
  _id: string,
  _openid: string,          // 微信 openid
  nickName: string,
  avatarUrl: string,
  createdAt: Date,
  totalWords: number,       // 累计练习词数
  totalTime: number,        // 累计练习时间(秒)
  continuousDays: number    // 连续打卡天数
}

// records 集合（学习记录）
{
  _id: string,
  _openid: string,
  dictId: string,           // 词典ID
  chapterIndex: number,     // 章节
  type: 'word' | 'article', // 练习类型
  totalCount: number,       // 总词数
  correctCount: number,     // 正确数
  wrongCount: number,       // 错误数
  time: number,             // 用时(ms)
  wpm: number,              // 速度
  accuracy: number,         // 正确率
  createdAt: Date
}

// wrong_words 集合（错词本）
{
  _id: string,
  _openid: string,
  word: string,             // 单词
  dictId: string,
  wrongCount: number,       // 累计错误次数
  lastWrongAt: Date,
  mastered: boolean         // 是否已掌握
}

// custom_dicts 集合（自定义词库）
{
  _id: string,
  _openid: string,
  name: string,
  description: string,
  words: Word[],            // 单词数组
  createdAt: Date
}
```

### 10.5 重难点 & 避坑点

| 难点 | 说明 | 解决方案 |
|------|------|---------|
| **键盘输入处理** | 小程序没有全局 keydown 事件 | 使用 `<input>` 组件聚焦模式，`bindinput` 逐字符捕获 |
| **逐字符渲染** | 需实时展示字符级的正确/错误状态 | 用 `<text>` 循环渲染每个字母，通过 class 控制颜色 |
| **发音功能** | 小程序不支持 Web Speech API | 方案1：云存储预录单词音频；方案2：插件（微信同声传译）；方案3：云函数调用 TTS API |
| **词库体积大** | 单个词库 JSON 可达 10MB+ | 只加载当前章节数据到内存，使用分页/navigateTo 传参 |
| **性能** | 大量词频繁渲染 | 使用 `wx:key` 优化列表渲染，虚拟列表 |
| **离线能力** | 小程序存储限制 10MB | 词库存云存储CDN+本地缓存，不全部下载 |
| **输入法干扰** | 中文输入法会影响 keydown 捕获 | 设置 input `type="text"`，处理 compositionstart/end 事件 |

### 10.6 键盘输入处理方案（小程序核心难点）

小程序中没有全局 `keydown` 事件，**这是最大的技术差异**。解决方案：

**方案A（推荐）：隐藏 Input 聚焦**
```xml
<!-- practice.wxml -->
<input 
  focus="{{true}}"
  bindinput="onInput"
  bindconfirm="onConfirm"
  adjust-position="{{false}}"
  style="position:fixed;top:-9999rpx;"
/>
```

```javascript
// practice.js
onInput(e) {
  const value = e.detail.value
  const newChar = value[value.length - 1]  // 取最后一个字符
  this.matchChar(newChar)
  // 关键：每次只保留一个字符，用完立即清空
  this.setData({ inputValue: '' })
}
```

**方案B：textarea 替代**
- 类似方案A，但支持多行输入
- 适合文章练习模式

### 10.7 功能对齐清单

| 原 Web 功能 | 小程序复刻 | 实现难度 |
|------------|-----------|---------|
| 单词打字练习 | ✅ 完全复刻 | ★★★★ |
| 文章打字练习 | ✅ 可复刻 | ★★★★★ |
| 词典选择 | ✅ 完全复刻 | ★★ |
| 章节选择 | ✅ 完全复刻 | ★★ |
| 随机/循环/盲打模式 | ✅ 完全复刻 | ★★ |
| 发音朗读 | ⚠️ 需改用插件/预录音频 | ★★★★ |
| 键盘音效 | ✅ 可复刻(InnerAudioContext) | ★★ |
| 错词本 | ✅ 完全复刻 | ★ |
| 收藏 | ✅ 完全复刻 | ★ |
| 单词测试(4选1) | ✅ 完全复刻 | ★★ |
| 学习统计 | ✅ 完全复刻 | ★★ |
| 暗黑模式 | ✅ 完全复刻 | ★ |
| 100+词库 | ✅ 全量迁移 | ★ |
| 英式/美式发音 | ⚠️ 需预录 | ★★★ |
| 用户系统 | ✅ 微信原生 | ★ |
| 自定义词库导入 | ⚠️ 文件选择有限制 | ★★★ |
| 数据导出 | ⚠️ 小程序文件分享限制 | ★★ |
| 会员支付 | ⚠️ 需接入微信支付 | ★★★ |
| 文章音频播放 | ✅ InnerAudioContext | ★★ |
| PWA 离线 | ✅ 小程序天然支持 | ★ |

### 10.8 测试要点

| 测试项 | 检查点 |
|--------|--------|
| **词库加载** | 所有词库 JSON 正常加载、解析、分组 |
| **键盘输入** | 逐字匹配正确/错误、大小写敏感性、标点处理 |
| **章节切换** | 前一章/后一章/指定章节、边界条件 |
| **发音** | 每个单词可正常发音、英式/美式切换 |
| **错词收集** | 错误词正确记录、可重练 |
| **计时统计** | 首键开始计时、末键停止、WPM 计算准确 |
| **深色模式** | 全局颜色变量正确切换 |
| **离线缓存** | 断网后仍可使用已缓存的词库 |
| **性能** | 大批量词（20000+）不卡顿 |
| **不同机型** | iOS/Android 各尺寸适配 |
| **输入法** | 中文输入法不干扰（composition 事件处理） |

---

### 总结：核心开发路径

```
Phase 1（1周）：搭建框架 → 词典数据 → 单词练习 MVP
Phase 2（1周）：文章练习 → 统计 → 错词本 → 测试模式
Phase 3（1周）：用户系统 → 云同步 → 发音优化 → 设置
Phase 4（1周）：UI打磨 → 动画 → 测试 → 发布
```

**最关键3个文件需要完整迁移逻辑：**
1. `src/hooks/event.ts` - 键盘事件处理（352行，逐字匹配核心）
2. `src/hooks/dict.ts` - 词典加载与章节管理（191行）
3. `src/hooks/article.ts` - 文章练习逻辑（381行）

如需要，我可以进一步提供任意模块的**逐行代码迁移方案**（Vue → 小程序 WXML/JS）。