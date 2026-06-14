// utils/dict.js - 词典数据加载与管理工具
const app = getApp()

// 内置词库列表（精简版，常用考试词库）
const BUILT_IN_DICT_LIST = [
  { id: 'cet4', name: 'CET-4', description: '大学英语四级词库', category: '中国考试', tags: ['大学英语'], url: 'CET4_T.json', length: 2607, language: 'en', translateLanguage: 'zh-CN' },
  { id: 'cet6', name: 'CET-6', description: '大学英语六级词库', category: '中国考试', tags: ['大学英语'], url: 'CET6_T.json', length: 2345, language: 'en', translateLanguage: 'zh-CN' },
  { id: 'kaoyan', name: '考研', description: '研究生英语入学考试词库', category: '中国考试', tags: ['考研'], url: 'KaoYan_3_T.json', length: 3728, language: 'en', translateLanguage: 'zh-CN' },
  { id: 'ielts', name: 'IELTS', description: '雅思词库', category: '国际考试', tags: ['雅思'], url: 'IELTS_3_3_T.json', length: 3575, language: 'en', translateLanguage: 'zh-CN' },
  { id: 'toefl', name: 'TOEFL', description: '托福词库', category: '国际考试', tags: ['托福'], url: 'TOEFL_3_T.json', length: 4266, language: 'en', translateLanguage: 'zh-CN' },
  { id: 'gre', name: 'GRE', description: 'GRE词库', category: '国际考试', tags: ['GRE'], url: 'GRE_3_T.json', length: 6512, language: 'en', translateLanguage: 'zh-CN' },
  { id: 'gaokao', name: '高考', description: '高考英语词库', category: '中国考试', tags: ['高考'], url: 'GaoKao_3_T.json', length: 3535, language: 'en', translateLanguage: 'zh-CN' },
  { id: 'zhongkao', name: '中考', description: '中考英语词库', category: '中国考试', tags: ['中考'], url: 'ZhongKao_3_T.json', length: 2133, language: 'en', translateLanguage: 'zh-CN' },
  { id: 'chuzhong', name: '初中', description: '初中英语词库', category: '青少年英语', tags: ['初中'], url: 'ChuZhong_3_T.json', length: 1555, language: 'en', translateLanguage: 'zh-CN' },
  { id: 'xiaoxue', name: '小学', description: '小学英语词库', category: '青少年英语', tags: ['小学'], url: 'XiaoXue_3_T.json', length: 638, language: 'en', translateLanguage: 'zh-CN' },
  { id: 'bec2', name: 'BEC 中级', description: '商务英语中级词库', category: '国际考试', tags: ['商务英语'], url: 'BEC_2_T.json', length: 2759, language: 'en', translateLanguage: 'zh-CN' },
  { id: 'bec3', name: 'BEC 高级', description: '商务英语高级词库', category: '国际考试', tags: ['商务英语'], url: 'BEC_3_T.json', length: 2838, language: 'en', translateLanguage: 'zh-CN' },
  { id: 'coca20000', name: 'COCA 20000', description: '美国当代语料库20000词', category: '国际考试', tags: ['语料库'], url: 'COCA20000.json', length: 20199, language: 'en', translateLanguage: 'zh-CN' },
  { id: 'pte', name: 'PTE', description: 'PTE学术英语考试词库', category: '国际考试', tags: ['PTE'], url: 'PTE_3_T.json', length: 3389, language: 'en', translateLanguage: 'zh-CN' },
  { id: 'sat', name: 'SAT', description: '美国高考词库', category: '国际考试', tags: ['SAT'], url: 'SAT_3_T.json', length: 4371, language: 'en', translateLanguage: 'zh-CN' }
]

// 本地内置备用词库（当 CDN 不可用时的 fallback，覆盖多章节练习）
const LOCAL_FALLBACK_WORDS = [
  // 基础动词
  { "name": "abandon", "trans": ["v. 放弃；遗弃"], "usphone": "əˈbændən" },
  { "name": "ability", "trans": ["n. 能力；才能"], "usphone": "əˈbɪləti" },
  { "name": "able", "trans": ["adj. 有能力的"], "usphone": "ˈeɪbl" },
  { "name": "accept", "trans": ["v. 接受；承认"], "usphone": "əkˈsept" },
  { "name": "access", "trans": ["n./v. 进入；访问"], "usphone": "ˈækses" },
  { "name": "achieve", "trans": ["v. 实现；达成"], "usphone": "əˈtʃiːv" },
  { "name": "act", "trans": ["v. 行动；表演 n. 行为"], "usphone": "ækt" },
  { "name": "add", "trans": ["v. 增加；添加"], "usphone": "æd" },
  { "name": "admire", "trans": ["v. 钦佩；赞赏"], "usphone": "ədˈmaɪər" },
  { "name": "admit", "trans": ["v. 承认；准许进入"], "usphone": "ədˈmɪt" },
  { "name": "adopt", "trans": ["v. 采用；收养"], "usphone": "əˈdɑːpt" },
  { "name": "advance", "trans": ["v./n. 前进；进步"], "usphone": "ədˈvæns" },
  { "name": "affect", "trans": ["v. 影响；感动"], "usphone": "əˈfekt" },
  { "name": "afford", "trans": ["v. 买得起；承担"], "usphone": "əˈfɔːrd" },
  { "name": "agree", "trans": ["v. 同意；赞成"], "usphone": "əˈɡriː" },
  { "name": "allow", "trans": ["v. 允许；准予"], "usphone": "əˈlaʊ" },
  { "name": "answer", "trans": ["v./n. 回答；答复"], "usphone": "ˈænsər" },
  { "name": "appear", "trans": ["v. 出现；似乎"], "usphone": "əˈpɪr" },
  { "name": "apply", "trans": ["v. 申请；应用"], "usphone": "əˈplaɪ" },
  { "name": "argue", "trans": ["v. 争论；辩论"], "usphone": "ˈɑːrɡjuː" },
  { "name": "arrive", "trans": ["v. 到达；抵达"], "usphone": "əˈraɪv" },
  { "name": "ask", "trans": ["v. 问；请求"], "usphone": "æsk" },
  { "name": "avoid", "trans": ["v. 避免；避开"], "usphone": "əˈvɔɪd" },
  // 基础名词
  { "name": "background", "trans": ["n. 背景"], "usphone": "ˈbækɡraʊnd" },
  { "name": "balance", "trans": ["n./v. 平衡"], "usphone": "ˈbæləns" },
  { "name": "basis", "trans": ["n. 基础；根据"], "usphone": "ˈbeɪsɪs" },
  { "name": "behavior", "trans": ["n. 行为；举止"], "usphone": "bɪˈheɪvjər" },
  { "name": "belief", "trans": ["n. 信念；信仰"], "usphone": "bɪˈliːf" },
  { "name": "benefit", "trans": ["n./v. 利益；有益于"], "usphone": "ˈbenɪfɪt" },
  { "name": "birth", "trans": ["n. 出生；诞生"], "usphone": "bɜːrθ" },
  { "name": "blood", "trans": ["n. 血；血液"], "usphone": "blʌd" },
  { "name": "body", "trans": ["n. 身体；躯体"], "usphone": "ˈbɑːdi" },
  { "name": "brain", "trans": ["n. 大脑；头脑"], "usphone": "breɪn" },
  { "name": "breath", "trans": ["n. 呼吸；气息"], "usphone": "breθ" },
  { "name": "business", "trans": ["n. 商业；生意"], "usphone": "ˈbɪznis" },
  { "name": "campus", "trans": ["n. 校园"], "usphone": "ˈkæmpəs" },
  { "name": "career", "trans": ["n. 职业；事业"], "usphone": "kəˈrɪr" },
  { "name": "cause", "trans": ["n./v. 原因；导致"], "usphone": "kɔːz" },
  { "name": "cell", "trans": ["n. 细胞；电池"], "usphone": "sel" },
  { "name": "center", "trans": ["n. 中心；中央"], "usphone": "ˈsentər" },
  { "name": "century", "trans": ["n. 世纪；百年"], "usphone": "ˈsentʃuri" },
  { "name": "chance", "trans": ["n. 机会；可能性"], "usphone": "tʃæns" },
  { "name": "change", "trans": ["v./n. 改变；变化"], "usphone": "tʃeɪndʒ" },
  { "name": "character", "trans": ["n. 性格；字符；角色"], "usphone": "ˈkærəktər" },
  { "name": "choice", "trans": ["n. 选择；抉择"], "usphone": "tʃɔɪs" },
  { "name": "class", "trans": ["n. 班级；阶级；课程"], "usphone": "klæs" },
  { "name": "climate", "trans": ["n. 气候；风气"], "usphone": "ˈklaɪmɪt" },
  { "name": "close", "trans": ["adj. 接近的 v. 关闭"], "usphone": "kloʊs" },
  { "name": "coffee", "trans": ["n. 咖啡"], "usphone": "ˈkɔːfi" },
  { "name": "common", "trans": ["adj. 共同的；常见的"], "usphone": "ˈkɑːmən" },
  { "name": "community", "trans": ["n. 社区；社群"], "usphone": "kəˈmjuːnəti" },
  { "name": "condition", "trans": ["n. 条件；状况"], "usphone": "kənˈdɪʃn" },
  { "name": "conference", "trans": ["n. 会议；协商"], "usphone": "ˈkɑːnfərəns" },
  { "name": "content", "trans": ["n. 内容；目录 adj. 满足的"], "usphone": "ˈkɑːntent" },
  { "name": "context", "trans": ["n. 上下文；背景"], "usphone": "ˈkɑːntekst" },
  { "name": "control", "trans": ["v./n. 控制；管理"], "usphone": "kənˈtroʊl" },
  { "name": "conversation", "trans": ["n. 对话；交谈"], "usphone": "ˌkɑːnvərˈseɪʃn" },
  { "name": "culture", "trans": ["n. 文化；培养"], "usphone": "ˈkʌltʃər" },
  { "name": "danger", "trans": ["n. 危险；威胁"], "usphone": "ˈdeɪndʒər" },
  { "name": "death", "trans": ["n. 死亡；逝世"], "usphone": "deθ" },
  { "name": "depth", "trans": ["n. 深度；深处"], "usphone": "depθ" },
  { "name": "detail", "trans": ["n. 细节；详情"], "usphone": "ˈdiːteɪl" },
  { "name": "direction", "trans": ["n. 方向；指导"], "usphone": "daɪˈrekʃn" },
  { "name": "director", "trans": ["n. 导演；主任；董事"], "usphone": "daɪˈrektər" },
  { "name": "discovery", "trans": ["n. 发现；发觉"], "usphone": "dɪˈskʌvəri" },
  { "name": "distance", "trans": ["n. 距离；远处"], "usphone": "ˈdɪstəns" },
  { "name": "dream", "trans": ["n./v. 梦；梦想"], "usphone": "driːm" },
  { "name": "earth", "trans": ["n. 地球；土地"], "usphone": "ɜːrθ" },
  { "name": "economy", "trans": ["n. 经济；节约"], "usphone": "ɪˈkɑːnəmi" },
  { "name": "edge", "trans": ["n. 边缘；优势"], "usphone": "edʒ" },
  { "name": "education", "trans": ["n. 教育；培养"], "usphone": "ˌedʒuˈkeɪʃn" },
  { "name": "effect", "trans": ["n. 效果；影响"], "usphone": "ɪˈfekt" },
  { "name": "emotion", "trans": ["n. 情感；情绪"], "usphone": "ɪˈmoʊʃn" },
  { "name": "energy", "trans": ["n. 能量；精力"], "usphone": "ˈenərdʒi" },
  { "name": "environment", "trans": ["n. 环境；周围"], "usphone": "ɪnˈvaɪrənmənt" },
  { "name": "example", "trans": ["n. 例子；榜样"], "usphone": "ɪɡˈzæmpl" },
  { "name": "experience", "trans": ["n./v. 经验；经历"], "usphone": "ɪkˈspɪriəns" },
  { "name": "expert", "trans": ["n. 专家 adj. 熟练的"], "usphone": "ˈekspɜːrt" },
  { "name": "explanation", "trans": ["n. 解释；说明"], "usphone": "ˌekspləˈneɪʃn" },
  { "name": "factor", "trans": ["n. 因素；要素"], "usphone": "ˈfæktər" },
  { "name": "failure", "trans": ["n. 失败；故障"], "usphone": "ˈfeɪljər" },
  { "name": "family", "trans": ["n. 家庭；家人"], "usphone": "ˈfæməli" },
  { "name": "father", "trans": ["n. 父亲；创始人"], "usphone": "ˈfɑːðər" },
  { "name": "favorite", "trans": ["adj./n. 最喜爱的(事物)"], "usphone": "ˈfeɪvərɪt" },
  { "name": "feature", "trans": ["n. 特征；特色 v. 以...为特色"], "usphone": "ˈfiːtʃər" },
  { "name": "field", "trans": ["n. 田野；领域"], "usphone": "fiːld" },
  { "name": "figure", "trans": ["n. 数字；人物；图形 v. 计算"], "usphone": "ˈfɪɡjər" },
  { "name": "flight", "trans": ["n. 航班；飞行"], "usphone": "flaɪt" },
  { "name": "flower", "trans": ["n. 花；花卉"], "usphone": "ˈflaʊər" },
  { "name": "focus", "trans": ["v./n. 集中；焦点"], "usphone": "ˈfoʊkəs" },
  { "name": "food", "trans": ["n. 食物；食品"], "usphone": "fuːd" },
  { "name": "freedom", "trans": ["n. 自由；自由权"], "usphone": "ˈfriːdəm" },
  { "name": "friend", "trans": ["n. 朋友；友人"], "usphone": "frend" },
  { "name": "function", "trans": ["n. 功能；函数 v. 运行"], "usphone": "ˈfʌŋkʃn" },
  { "name": "future", "trans": ["n./adj. 未来(的)"], "usphone": "ˈfjuːtʃər" },
  { "name": "garden", "trans": ["n. 花园；菜园"], "usphone": "ˈɡɑːrdn" },
  { "name": "generation", "trans": ["n. 一代；产生"], "usphone": "ˌdʒenəˈreɪʃn" },
  { "name": "government", "trans": ["n. 政府；治理"], "usphone": "ˈgʌvərnmənt" },
  { "name": "ground", "trans": ["n. 地面；理由"], "usphone": "ɡraʊnd" },
  { "name": "growth", "trans": ["n. 生长；增长"], "usphone": "ɡroʊθ" },
  { "name": "habit", "trans": ["n. 习惯；习性"], "usphone": "ˈhæbɪt" },
  { "name": "health", "trans": ["n. 健康；卫生"], "usphone": "helθ" },
  { "name": "heart", "trans": ["n. 心；心脏"], "usphone": "hɑːrt" },
  { "name": "history", "trans": ["n. 历史；履历"], "usphone": "ˈhɪstri" },
  { "name": "home", "trans": ["n. 家；家乡 adv. 在家"], "usphone": "hoʊm" },
  { "name": "hope", "trans": ["n./v. 希望"], "usphone": "hoʊp" },
  { "name": "hour", "trans": ["n. 小时；时间"], "usphone": "aʊər" },
  { "name": "house", "trans": ["n. 房子；住宅"], "usphone": "haʊs" },
  { "name": "human", "trans": ["adj./n. 人类(的)"], "usphone": "ˈhjuːmən" },
  { "name": "idea", "trans": ["n. 主意；想法"], "usphone": "aɪˈdiːə" },
  { "name": "image", "trans": ["n. 图像；形象"], "usphone": "ˈɪmɪdʒ" },
  { "name": "importance", "trans": ["n. 重要(性)"], "usphone": "ɪmˈpɔːrtns" },
  { "name": "industry", "trans": ["n. 工业；产业"], "usphone": "ˈɪndəstri" },
  { "name": "information", "trans": ["n. 信息；消息"], "usphone": "ˌɪnfərˈmeɪʃn" },
  { "name": "injury", "trans": ["n. 伤害；损害"], "usphone": "ˈɪndʒəri" },
  { "name": "instance", "trans": ["n. 例子；实例"], "usphone": "ˈɪnstəns" },
  { "name": "internet", "trans": ["n. 互联网；因特网"], "usphone": "ˈɪntərnet" },
  { "name": "interview", "trans": ["n./v. 面试；采访"], "usphone": "ˈɪntərvjuː" },
  { "name": "knowledge", "trans": ["n. 知识；学问"], "usphone": "ˈnɑːlɪdʒ" },
  { "name": "language", "trans": ["n. 语言"], "usphone": "ˈlæŋɡwɪdʒ" },
  { "name": "leader", "trans": ["n. 领导者；领袖"], "usphone": "ˈliːdər" },
  { "name": "lesson", "trans": ["n. 课程；教训"], "usphone": "ˈlesn" },
  { "name": "level", "trans": ["n. 水平；等级"], "usphone": "ˈlevl" },
  { "name": "market", "trans": ["n. 市场 v. 营销"], "usphone": "ˈmɑːrkɪt" },
  { "name": "memory", "trans": ["n. 记忆；存储器"], "usphone": "ˈmeməri" },
  { "name": "method", "trans": ["n. 方法；办法"], "usphone": "ˈmeθəd" },
  { "name": "moment", "trans": ["n. 片刻；瞬间"], "usphone": "ˈmoʊmənt" },
  { "name": "mother", "trans": ["n. 母亲"], "usphone": "ˈmʌðər" },
  { "name": "mountain", "trans": ["n. 山；山脉"], "usphone": "ˈmaʊntn" },
  { "name": "music", "trans": ["n. 音乐；乐曲"], "usphone": "ˈmjuːzɪk" },
  { "name": "nature", "trans": ["n. 自然；本性"], "usphone": "ˈneɪtʃər" },
  { "name": "nation", "trans": ["n. 国家；民族"], "usphone": "ˈneɪʃn" },
  { "name": "neighbor", "trans": ["n. 邻居"], "usphone": "ˈneɪbər" },
  { "name": "news", "trans": ["n. 新闻；消息"], "usphone": "nuːz" },
  { "name": "note", "trans": ["n. 笔记；音符 v. 注意"], "usphone": "noʊt" },
  { "name": "object", "trans": ["n. 物体；对象 v. 反对"], "usphone": "ˈɑːbdʒekt" },
  { "name": "office", "trans": ["n. 办公室；办事处"], "usphone": "ˈɔːfɪs" },
  { "name": "opinion", "trans": ["n. 意见；看法"], "usphone": "əˈpɪnjən" },
  { "name": "option", "trans": ["n. 选择；选项"], "usphone": "ˈɑːpʃn" },
  { "name": "order", "trans": ["n./v. 命令；订单；顺序"], "usphone": "ˈɔːrdər" },
  { "name": "origin", "trans": ["n. 起源；出身"], "usphone": "ˈɔːrɪdʒɪn" },
  { "name": "paper", "trans": ["n. 纸；论文；文件"], "usphone": "ˈpeɪpər" },
  { "name": "part", "trans": ["n. 部分；角色 v. 分离"], "usphone": "pɑːrt" },
  { "name": "party", "trans": ["n. 聚会；政党"], "usphone": "ˈpɑːrti" },
  { "name": "passenger", "trans": ["n. 乘客；旅客"], "usphone": "ˈpæsɪndʒər" },
  { "name": "pattern", "trans": ["n. 模式；图案"], "usphone": "ˈpætərn" },
  { "name": "peace", "trans": ["n. 和平；平静"], "usphone": "piːs" },
  { "name": "people", "trans": ["n. 人民；人们"], "usphone": "ˈpiːpl" },
  { "name": "percent", "trans": ["n. 百分比；百分号"], "usphone": "pərˈsent" },
  { "name": "period", "trans": ["n. 时期；周期；句号"], "usphone": "ˈpɪriəd" },
  { "name": "person", "trans": ["n. 人；个人"], "usphone": "ˈpɜːrsn" },
  { "name": "physics", "trans": ["n. 物理学"], "usphone": "ˈfɪzɪks" },
  { "name": "planet", "trans": ["n. 行星"], "usphone": "ˈplænɪt" },
  { "name": "pleasure", "trans": ["n. 快乐；乐事"], "usphone": "ˈpleʒər" },
  { "name": "point", "trans": ["n. 点；要点 v. 指向"], "usphone": "pɔɪnt" },
  { "name": "police", "trans": ["n. 警察；警方"], "usphone": "pəˈliːs" },
  { "name": "policy", "trans": ["n. 政策；方针"], "usphone": "ˈpɑːləsi" },
  { "name": "position", "trans": ["n. 位置；职位；立场"], "usphone": "pəˈzɪʃn" },
  { "name": "power", "trans": ["n. 力量；权力；电力"], "usphone": "ˈpaʊər" },
  { "name": "practice", "trans": ["n./v. 练习；实践"], "usphone": "ˈpræktɪs" },
  { "name": "pressure", "trans": ["n. 压力；压强"], "usphone": "ˈpreʃər" },
  { "name": "problem", "trans": ["n. 问题；难题"], "usphone": "ˈprɑːbləm" },
  { "name": "process", "trans": ["n. 过程；工序 v. 处理"], "usphone": "ˈprɑːses" },
  { "name": "product", "trans": ["n. 产品；结果"], "usphone": "ˈprɑːdʌkt" },
  { "name": "progress", "trans": ["n./v. 进步；进展"], "usphone": "ˈprɑːɡres" },
  { "name": "project", "trans": ["n. 项目；工程 v. 投射"], "usphone": "ˈprɑːdʒekt" },
  { "name": "purpose", "trans": ["n. 目的；意图"], "usphone": "ˈpɜːrpəs" },
  { "name": "quality", "trans": ["n. 质量；品质"], "usphone": "ˈkwɑːləti" },
  { "name": "question", "trans": ["n. 问题；疑问 v. 询问"], "usphone": "ˈkwestʃən" },
  { "name": "range", "trans": ["n. 范围；山脉 v. 变动"], "usphone": "reɪndʒ" },
  { "name": "reason", "trans": ["n. 原因；理性 v. 推理"], "usphone": "ˈriːzn" },
  { "name": "record", "trans": ["n. 记录；唱片 v. 记录"], "usphone": "ˈrekərd" },
  { "name": "relationship", "trans": ["n. 关系；关联"], "usphone": "rɪˈleɪʃnʃɪp" },
  { "name": "result", "trans": ["n. 结果；成绩 v. 导致"], "usphone": "rɪˈzʌlt" },
  { "name": "role", "trans": ["n. 角色；作用"], "usphone": "roʊl" },
  { "name": "safety", "trans": ["n. 安全；保险"], "usphone": "ˈseɪfti" },
  { "name": "science", "trans": ["n. 科学"], "usphone": "ˈsaɪəns" },
  { "name": "service", "trans": ["n. 服务；维修"], "usphone": "ˈsɜːrvɪs" },
  { "name": "silence", "trans": ["n. 沉默；寂静"], "usphone": "ˈsaɪləns" },
  { "name": "society", "trans": ["n. 社会；协会"], "usphone": "səˈsaɪəti" },
  { "name": "source", "trans": ["n. 来源；源头"], "usphone": "sɔːrs" },
  { "name": "space", "trans": ["n. 空间；太空"], "usphone": "speɪs" },
  { "name": "speed", "trans": ["n. 速度 v. 加速"], "usphone": "spiːd" },
  { "name": "spirit", "trans": ["n. 精神；心灵"], "usphone": "ˈspɪrɪt" },
  { "name": "standard", "trans": ["n. 标准 adj. 标准的"], "usphone": "ˈstændərd" },
  { "name": "state", "trans": ["n. 州；国家；状态 v. 声明"], "usphone": "steɪt" },
  { "name": "step", "trans": ["n. 步骤；脚步 v. 踏上"], "usphone": "step" },
  { "name": "strength", "trans": ["n. 力量；长处"], "usphone": "streŋθ" },
  { "name": "stress", "trans": ["n./v. 压力；强调"], "usphone": "stres" },
  { "name": "style", "trans": ["n. 风格；样式"], "usphone": "staɪl" },
  { "name": "subject", "trans": ["n. 学科；主题 adj. 受...支配的"], "usphone": "ˈsʌbdʒikt" },
  { "name": "success", "trans": ["n. 成功；成就"], "usphone": "səkˈses" },
  { "name": "system", "trans": ["n. 系统；制度"], "usphone": "ˈsɪstəm" },
  { "name": "teacher", "trans": ["n. 教师；老师"], "usphone": "ˈtiːtʃər" },
  { "name": "technology", "trans": ["n. 技术；工艺"], "usphone": "tekˈnɑːlədʒi" },
  { "name": "temperature", "trans": ["n. 温度；体温"], "usphone": "ˈtemprətʃər" },
  { "name": "theory", "trans": ["n. 理论；学说"], "usphone": "ˈθiːəri" },
  { "name": "thought", "trans": ["n. 思想；想法 v. think的过去式"], "usphone": "θɔːt" },
  { "name": "tourist", "trans": ["n. 旅游者；观光客"], "usphone": "ˈtʊrɪst" },
  { "name": "traffic", "trans": ["n. 交通；流量"], "usphone": "ˈtræfɪk" },
  { "name": "travel", "trans": ["v./n. 旅行；行进"], "usphone": "ˈtrævl" },
  { "name": "treatment", "trans": ["n. 治疗；对待"], "usphone": "ˈtriːtmənt" },
  { "name": "universe", "trans": ["n. 宇宙；万物"], "usphone": "ˈjuːnɪvɜːrs" },
  { "name": "value", "trans": ["n. 价值；价值观"], "usphone": "ˈvæljuː" },
  { "name": "variety", "trans": ["n. 多样性；种类"], "usphone": "vəˈraɪəti" },
  { "name": "version", "trans": ["n. 版本；译本"], "usphone": "ˈvɜːrʒn" },
  { "name": "view", "trans": ["n. 观点；视野 v. 看"], "usphone": "vjuː" },
  { "name": "violence", "trans": ["n. 暴力；猛烈"], "usphone": "ˈvaɪələns" },
  { "name": "water", "trans": ["n. 水 v. 浇水"], "usphone": "ˈwɔːtər" },
  { "name": "weather", "trans": ["n. 天气；气象"], "usphone": "ˈweðər" },
  { "name": "weight", "trans": ["n. 重量；体重"], "usphone": "weɪt" },
  { "name": "window", "trans": ["n. 窗户；窗口"], "usphone": "ˈwɪndoʊ" },
  { "name": "wisdom", "trans": ["n. 智慧；学识"], "usphone": "ˈwɪzdəm" },
  { "name": "worker", "trans": ["n. 工人；工作者"], "usphone": "ˈwɜːrkər" },
  { "name": "world", "trans": ["n. 世界；领域"], "usphone": "wɜːrld" }
]

// CDN 基础路径（使用 jsDelivr 作为 CDN）
const DICT_CDN_BASE = 'https://cdn.jsdelivr.net/gh/Kaiyiwing/qwerty-learner@master/public/dicts/en/word/'

// CDN 可用性标记（内存级缓存：同一会话中不再重复尝试失败的 CDN）
let cdnAvailable = null // null=未检测, true=可用, false=不可用

// 缓存 key
const DICT_CACHE_PREFIX = 'dict_cache_'
const DICT_LIST_CACHE_KEY = 'dict_list_cache'
const CDN_AVAILABLE_KEY = 'cdn_available_cache'

/**
 * 获取词库列表
 * @returns {Array} 词库列表
 */
function getDictList() {
  try {
    const cached = wx.getStorageSync(DICT_LIST_CACHE_KEY)
    if (cached && cached.length > 0) return cached
  } catch (e) { /* ignore */ }
  return BUILT_IN_DICT_LIST
}

/**
 * 缓存词库列表
 */
function cacheDictList(list) {
  try {
    wx.setStorageSync(DICT_LIST_CACHE_KEY, list)
  } catch (e) { /* ignore */ }
}

/**
 * 按分类获取词库
 */
function getDictsByCategory() {
  const list = getDictList()
  const categories = {}
  list.forEach(dict => {
    const cat = dict.category || '其他'
    if (!categories[cat]) categories[cat] = []
    categories[cat].push(dict)
  })
  return categories
}

/**
 * 根据ID获取词典信息
 */
function getDictInfo(dictId) {
  const list = getDictList()
  return list.find(d => d.id === dictId) || null
}

/**
 * 加载词典数据（带缓存，CDN + 本地 fallback）
 * @param {string} dictId 词典ID
 * @param {Function} onProgress 进度回调
 * @returns {Promise<Array>} 单词数组
 */
function loadDictData(dictId, onProgress) {
  return new Promise((resolve, reject) => {
    const dictInfo = getDictInfo(dictId)
    if (!dictInfo) {
      // 如果是未知 dictId，尝试用本地 fallback
      console.warn(`词典 ${dictId} 不在词库列表中，使用本地备用词库`)
      if (onProgress) onProgress(100)
      resolve([...LOCAL_FALLBACK_WORDS])
      return
    }

    // 1. 尝试从本地缓存加载
    const cacheKey = DICT_CACHE_PREFIX + dictId
    try {
      const cached = wx.getStorageSync(cacheKey)
      if (cached && Array.isArray(cached) && cached.length > 0) {
        console.log(`词库 ${dictId} 从本地缓存加载，共 ${cached.length} 个单词`)
        if (onProgress) onProgress(100)
        resolve(cached)
        return
      }
    } catch (e) { /* ignore */ }

    // 2. 检查 CDN 是否可用（内存级 + 持久化缓存）
    if (cdnAvailable === false) {
      console.log(`CDN 已标记为不可用，直接使用本地词库`)
      if (onProgress) onProgress(100)
      resolve([...LOCAL_FALLBACK_WORDS])
      return
    }

    // 从持久化存储检查上次会话的 CDN 状态
    if (cdnAvailable === null) {
      try {
        const savedCdnStatus = wx.getStorageSync(CDN_AVAILABLE_KEY)
        if (savedCdnStatus === false) {
          cdnAvailable = false
          console.log(`CDN 历史记录显示不可用，跳过请求，使用本地词库`)
          if (onProgress) onProgress(100)
          resolve([...LOCAL_FALLBACK_WORDS])
          return
        }
      } catch (e) { /* ignore */ }
    }

    // 3. 尝试从 CDN 加载
    const url = DICT_CDN_BASE + dictInfo.url
    console.log(`正在从 CDN 加载词库: ${dictId} -> ${url}`)
    if (onProgress) onProgress(10)

    wx.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      timeout: 15000,
      success: (res) => {
        if (res.statusCode === 200 && Array.isArray(res.data)) {
          const words = res.data
          cdnAvailable = true
          try { wx.setStorageSync(CDN_AVAILABLE_KEY, true) } catch (e) {}
          console.log(`词库 ${dictId} 从 CDN 加载成功，共 ${words.length} 个单词`)
          if (onProgress) onProgress(80)

          // 缓存到本地存储
          try {
            wx.setStorageSync(cacheKey, words)
          } catch (e) {
            try {
              wx.setStorageSync(cacheKey, words.slice(0, 1000))
            } catch (e2) { /* give up */ }
          }

          if (onProgress) onProgress(100)
          resolve(words)
        } else {
          console.log(`CDN 返回异常: HTTP ${res.statusCode}, 使用本地词库`)
          if (onProgress) onProgress(100)
          resolve([...LOCAL_FALLBACK_WORDS])
        }
      },
      fail: (err) => {
        const errMsg = err.errMsg || ''
        // 标记域名校验类错误为 CDN 不可用，避免重复尝试
        if (errMsg.includes('url not in domain') || errMsg.includes('domain')) {
          cdnAvailable = false
          try { wx.setStorageSync(CDN_AVAILABLE_KEY, false) } catch (e) {}
          console.log(`CDN 域名校验不通过（已记住此状态），使用本地词库 (${LOCAL_FALLBACK_WORDS.length} 词)`)
        } else {
          console.log(`CDN 请求失败: ${errMsg}, 使用本地词库`)
        }
        if (onProgress) onProgress(100)
        resolve([...LOCAL_FALLBACK_WORDS])
      }
    })
  })
}

/**
 * 单词分组（按章节大小分组）
 * @param {Array} words 单词数组
 * @param {number} chapterSize 每章单词数
 * @returns {Array<Array>} 分组后的单词
 */
function groupWordsByChapter(words, chapterSize = 20) {
  const chapters = []
  for (let i = 0; i < words.length; i += chapterSize) {
    chapters.push(words.slice(i, i + chapterSize))
  }
  return chapters
}

/**
 * 获取指定章节的单词
 */
function getChapterWords(words, chapterIndex, chapterSize = 20) {
  const start = chapterIndex * chapterSize
  const end = start + chapterSize
  return words.slice(start, end)
}

/**
 * 获取总章节数
 */
function getTotalChapters(words, chapterSize = 20) {
  return Math.ceil(words.length / chapterSize)
}

/**
 * Fisher-Yates 洗牌算法
 */
function shuffleArray(arr) {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 按模式排序单词
 * @param {Array} words 单词数组
 * @param {string} mode 'normal' | 'random' | 'reverse'
 */
function sortWords(words, mode = 'normal') {
  if (mode === 'random') return shuffleArray(words)
  if (mode === 'reverse') return [...words].reverse()
  return [...words]
}

module.exports = {
  getDictList,
  cacheDictList,
  getDictsByCategory,
  getDictInfo,
  loadDictData,
  groupWordsByChapter,
  getChapterWords,
  getTotalChapters,
  shuffleArray,
  sortWords,
  /**
   * 重置 CDN 可用状态（修复域名配置后可调用此方法重试）
   */
  resetCdnStatus() {
    cdnAvailable = null
    try { wx.removeStorageSync(CDN_AVAILABLE_KEY) } catch (e) {}
    console.log('CDN 状态已重置，下次加载将重新尝试 CDN')
  }
}
