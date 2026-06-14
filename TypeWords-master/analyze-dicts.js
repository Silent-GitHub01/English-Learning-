const fs = require('fs');
const path = require('path');

const dictBasePath = '/Users/harmony-mac/WeChatProjects/miniprogram-3/TypeWords-master/public/dicts/en';

// 词库分类规则
const categories = {
  '考试类': {
    keywords: ['CET4', 'CET6', 'GRE', 'GMAT', 'TOEFL', 'IELTS', 'SAT', 'PTE', 'BEC', 'TOEIC', 'KET', 'PET', 'PETS', 'FCE'],
    files: []
  },
  '高考/考研': {
    keywords: ['GaoKao', 'KaoYan', 'ZhongKao'],
    files: []
  },
  '新概念英语': {
    keywords: ['NCE', 'nce'],
    files: []
  },
  '中小学教材': {
    keywords: ['XiaoXue', 'ChuZhong', 'GaoZhong', 'PEP', 'WaiYanShe', 'BeiShi', 'jiJiao', 'waiyan', 'shanghai'],
    files: []
  },
  '词汇学习': {
    keywords: ['Oxford', 'Longman', 'Macmillan', 'Merriam', '4000_Essential', '3000_ClassRoom', 'top', 'Top', 'suffix', 'word_roots'],
    files: []
  },
  '专业词汇': {
    keywords: ['IT', 'it-', 'adult', 'self-study', 'xueshi'],
    files: []
  },
  '其他': {
    keywords: [],
    files: []
  }
};

// 分析词库
function analyzeDicts() {
  const results = {
    article: [],
    word: []
  };

  // 分析 article 目录
  const articlePath = path.join(dictBasePath, 'article');
  if (fs.existsSync(articlePath)) {
    const files = fs.readdirSync(articlePath).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      const filePath = path.join(articlePath, file);
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        results.article.push({
          name: file.replace('.json', ''),
          fileName: file,
          count: content.length,
          type: 'article'
        });
      } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
      }
    });
  }

  // 分析 word 目录
  const wordPath = path.join(dictBasePath, 'word');
  if (fs.existsSync(wordPath)) {
    const files = fs.readdirSync(wordPath).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      const filePath = path.join(wordPath, file);
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        results.word.push({
          name: file.replace('.json', ''),
          fileName: file,
          count: content.length,
          type: 'word'
        });
      } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
      }
    });
  }

  return results;
}

// 分类词库
function categorizeDict(name) {
  for (const [category, config] of Object.entries(categories)) {
    if (category === '其他') continue;
    for (const keyword of config.keywords) {
      if (name.includes(keyword)) {
        return category;
      }
    }
  }
  return '其他';
}

// 生成报告
function generateReport(results) {
  console.log('\n========================================');
  console.log('   TypeWords 词典词库分析报告');
  console.log('========================================\n');

  // 1. 总体统计
  const totalArticles = results.article.reduce((sum, a) => sum + a.count, 0);
  const totalWords = results.word.reduce((sum, w) => sum + w.count, 0);

  console.log('【一、总体统计】');
  console.log(`├── 文章类词库: ${results.article.length} 个`);
  console.log(`├── 单词类词库: ${results.word.length} 个`);
  console.log(`├── 词库总数: ${results.article.length + results.word.length} 个`);
  console.log(`├── 文章总数: ${totalArticles} 篇`);
  console.log(`└── 单词总数: ${totalWords} 个\n`);

  // 2. 文章类词库详情
  console.log('【二、文章类词库详情】');
  console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ 词库名称                                    │ 文章数量  │ 所属分类        │');
  console.log('├──────────────────────────────────────────────────────────────────────────────┤');
  results.article.forEach(item => {
    const category = categorizeDict(item.name);
    const name = item.name.padEnd(40);
    const count = String(item.count).padStart(8);
    const cat = category.padEnd(12);
    console.log(`│ ${name} │ ${count} │ ${cat} │`);
  });
  console.log('└──────────────────────────────────────────────────────────────────────────────┘\n');

  // 3. 单词类词库分类统计
  console.log('【三、单词类词库分类统计】');
  const wordByCategory = {};
  results.word.forEach(item => {
    const category = categorizeDict(item.name);
    if (!wordByCategory[category]) {
      wordByCategory[category] = {
        count: 0,
        wordCount: 0,
        dicts: []
      };
    }
    wordByCategory[category].count++;
    wordByCategory[category].wordCount += item.count;
    wordByCategory[category].dicts.push(item);
  });

  console.log('┌──────────────────────┬────────────┬────────────────┬────────────────────┐');
  console.log('│ 分类                 │ 词库数量   │ 单词总数       │ 平均每个词库单词数 │');
  console.log('├──────────────────────┼────────────┼────────────────┼────────────────────┤');
  Object.entries(wordByCategory)
    .sort((a, b) => b[1].wordCount - a[1].wordCount)
    .forEach(([category, data]) => {
      const cat = category.padEnd(18);
      const count = String(data.count).padStart(8);
      const wordCount = String(data.wordCount).padStart(12);
      const avg = String(Math.round(data.wordCount / data.count)).padStart(16);
      console.log(`│ ${cat} │ ${count} │ ${wordCount} │ ${avg} │`);
    });
  console.log('└──────────────────────┴────────────┴────────────────┴────────────────────┘\n');

  // 4. 各分类详细词库列表
  console.log('【四、各分类词库详细列表】\n');

  Object.entries(wordByCategory)
    .sort((a, b) => b[1].wordCount - a[1].wordCount)
    .forEach(([category, data]) => {
      console.log(`\n▶ ${category} (共 ${data.count} 个词库，${data.wordCount} 个单词)`);
      console.log('┌─────────────────────────────────────────────────────────────────────────────────────────────┐');
      console.log('│ 词库名称                                                         │ 单词数量     │');
      console.log('├─────────────────────────────────────────────────────────────────────────────────────────────┤');
      data.dicts
        .sort((a, b) => b.count - a.count)
        .forEach(item => {
          const name = item.name.padEnd(60);
          const count = String(item.count).padStart(10);
          console.log(`│ ${name} │ ${count} │`);
        });
      console.log('└─────────────────────────────────────────────────────────────────────────────────────────────┘');
    });

  // 5. Top 20 最大词库
  console.log('\n【五、单词数量 Top 20 词库】');
  console.log('┌─────────────────────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ 排名 │ 词库名称                                                         │ 单词数量     │');
  console.log('├─────────────────────────────────────────────────────────────────────────────────────────────┤');
  results.word
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
    .forEach((item, index) => {
      const rank = String(index + 1).padStart(4);
      const name = item.name.padEnd(60);
      const count = String(item.count).padStart(10);
      console.log(`│ ${rank} │ ${name} │ ${count} │`);
    });
  console.log('└─────────────────────────────────────────────────────────────────────────────────────────────┘\n');

  // 6. 词库规模分布
  console.log('【六、词库规模分布】');
  const sizeDistribution = {
    '小型(<1000)': 0,
    '中型(1000-3000)': 0,
    '大型(3000-5000)': 0,
    '超大型(>5000)': 0
  };
  results.word.forEach(item => {
    if (item.count < 1000) sizeDistribution['小型(<1000)']++;
    else if (item.count < 3000) sizeDistribution['中型(1000-3000)']++;
    else if (item.count < 5000) sizeDistribution['大型(3000-5000)']++;
    else sizeDistribution['超大型(>5000)']++;
  });

  console.log('┌────────────────────────────┬────────────┬────────────┐');
  console.log('│ 规模                       │ 词库数量   │ 占比       │');
  console.log('├────────────────────────────┼────────────┼────────────┤');
  Object.entries(sizeDistribution).forEach(([size, count]) => {
    const sizeName = size.padEnd(22);
    const countStr = String(count).padStart(8);
    const percent = ((count / results.word.length) * 100).toFixed(1).padStart(7) + '%';
    console.log(`│ ${sizeName} │ ${countStr} │ ${percent} │`);
  });
  console.log('└────────────────────────────┴────────────┴────────────┘\n');

  // 返回JSON数据供进一步处理
  return {
    summary: {
      totalDicts: results.article.length + results.word.length,
      articleDicts: results.article.length,
      wordDicts: results.word.length,
      totalArticles: totalArticles,
      totalWords: totalWords
    },
    article: results.article,
    word: results.word,
    wordByCategory: Object.fromEntries(
      Object.entries(wordByCategory).map(([k, v]) => [k, {
        count: v.count,
        wordCount: v.wordCount,
        dicts: v.dicts.map(d => ({ name: d.name, count: d.count }))
      }])
    )
  };
}

// 执行分析
const results = analyzeDicts();
const report = generateReport(results);

// 保存JSON报告
const reportPath = '/Users/harmony-mac/WeChatProjects/miniprogram-3/TypeWords-master/dict-analysis-report.json';
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
console.log(`\n详细报告已保存至: ${reportPath}`);
