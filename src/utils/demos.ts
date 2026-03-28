export interface DemoAgent {
  name: string;
  capabilities: string[];
  relationship: string;
}

export interface DemoTeam {
  name: string;
  description: string;
  members: string[];
  relationships: Record<string, string>;
}

export interface Demo {
  emoji: string;
  title: string;
  role: string;
  desc: string;
  prompt: string;
  teams: DemoTeam[];
  agents: DemoAgent[];
}

export const DEMOS: Record<string, Demo> = {
  sanguo: {
    emoji: '🐉',
    title: '三国蜀汉',
    role: '你是刘备',
    desc: '桃园结义，三顾茅庐。作为蜀汉之主，统领五虎上将和卧龙凤雏，逐鹿中原。',
    prompt: '北伐中原，兵分三路，需要攻城、断粮和外交三管齐下',
    teams: [
      {
        name: '三国蜀汉',
        description: '刘备麾下全体文臣武将',
        members: ['关羽', '张飞', '赵云', '诸葛亮', '庞统', '黄忠', '马超'],
        relationships: {
          关羽: '义弟兼军团统帅',
          张飞: '义弟兼先锋大将',
          赵云: '心腹爱将',
          诸葛亮: '首席军师，如鱼得水',
          庞统: '副军师，奇谋百出',
          黄忠: '老当益壮的猛将',
          马超: '归降的西凉虎将',
        },
      },
    ],
    agents: [
      { name: '关羽', capabilities: ['武艺', '统兵', '镇守要地', '水军指挥'], relationship: '义弟，桃园结义二弟，最信任的兄弟和大将' },
      { name: '张飞', capabilities: ['武艺', '先锋突击', '骑兵指挥', '威慑敌军'], relationship: '义弟，桃园结义三弟，性如烈火但忠心耿耿' },
      { name: '赵云', capabilities: ['武艺', '护卫', '骑兵突击', '侦察敏捷'], relationship: '四弟级别的心腹爱将，长坂坡救阿斗' },
      { name: '诸葛亮', capabilities: ['战略规划', '内政治理', '外交', '发明创造', '阵法'], relationship: '三顾茅庐请来的军师，如鱼得水的关系' },
      { name: '庞统', capabilities: ['战略规划', '奇谋', '攻城战术', '地形分析'], relationship: '凤雏，与诸葛亮齐名的军师，副军师中郎将' },
      { name: '黄忠', capabilities: ['武艺', '弓箭', '老当益壮', '攻城战'], relationship: '老将军，定军山斩夏侯渊，五虎上将之一' },
      { name: '马超', capabilities: ['武艺', '骑兵', '西凉作战', '威慑羌族'], relationship: '归降的西凉猛将，五虎上将之一' },
    ],
  },
  tech: {
    emoji: '💻',
    title: '互联网大厂',
    role: '你是技术总监',
    desc: '带领一支全栈团队，从前端到运维一应俱全。应对高并发、搞 AI、上线新系统。',
    prompt: '上线一个 AI 智能客服系统，包括前端界面、后端 API、推荐算法、压力测试和灰度发布方案',
    teams: [
      {
        name: '互联网大厂',
        description: '技术总监直管的全栈团队',
        members: ['前端老李', '后端大王', '算法小陈', '产品经理 Amy', '设计师小林', '测试负责人老赵', '运维 DevOps 阿杰'],
        relationships: {
          前端老李: '前端TL，核心骨干',
          后端大王: '架构师，技术决策者',
          算法小陈: '算法工程师，需要指导',
          '产品经理 Amy': '产品负责人',
          设计师小林: '资深设计师',
          测试负责人老赵: '质量把关人',
          '运维 DevOps 阿杰': 'SRE负责人',
        },
      },
    ],
    agents: [
      { name: '前端老李', capabilities: ['React', 'TypeScript', 'Next.js', '移动端适配', '性能优化'], relationship: 'P7 前端 TL，跟了你三年，技术过硬但最近有点倦怠' },
      { name: '后端大王', capabilities: ['Java', 'Go', '微服务', '数据库设计', '高并发架构'], relationship: 'P8 后端架构师，技术大拿，说话直来直去' },
      { name: '算法小陈', capabilities: ['机器学习', '推荐系统', 'NLP', 'Python', '数据分析'], relationship: 'P6 算法工程师，刚从学校毕业一年，潜力很大但经验不足' },
      { name: '产品经理 Amy', capabilities: ['需求分析', '用户调研', 'PRD撰写', '项目管理', '数据驱动'], relationship: 'P7 产品经理，业务感觉很好，跨部门沟通能力强' },
      { name: '设计师小林', capabilities: ['UI设计', '交互设计', 'Figma', '设计系统', '用户体验'], relationship: 'P6 资深设计师，审美在线，偶尔和产品经理吵架' },
      { name: '测试负责人老赵', capabilities: ['自动化测试', '性能测试', '安全测试', '测试用例设计', 'CI集成'], relationship: 'P7 测试负责人，入职五年老员工，对质量要求极高' },
      { name: '运维 DevOps 阿杰', capabilities: ['Kubernetes', 'Docker', 'CI/CD', '监控告警', '云原生架构'], relationship: 'P7 SRE，半夜被 oncall 叫起来过无数次，求稳派' },
    ],
  },
  gov: {
    emoji: '🇺🇸',
    title: '美国政府',
    role: '你是特朗普 (POTUS)',
    desc: 'Make the executive branch great again! 管理你的核心内阁成员，推行政策议程。',
    prompt: '制定一个让美国制造业回流的综合计划，需要关税政策、减税方案、能源保障、边境安全配合和政府效率优化',
    teams: [
      {
        name: '美国政府',
        description: '总统直属核心内阁',
        members: ['Elon Musk', 'Marco Rubio', 'Pete Hegseth', 'Scott Bessent', 'Kristi Noem', 'Tulsi Gabbard', 'Robert F. Kennedy Jr.'],
        relationships: {
          'Elon Musk': 'DOGE 负责人，效率改革推动者',
          'Marco Rubio': '国务卿，外交总管',
          'Pete Hegseth': '国防部长，军事事务',
          'Scott Bessent': '财政部长，首席经济顾问',
          'Kristi Noem': '国土安全部长，边境强硬派',
          'Tulsi Gabbard': '情报总监，安全评估',
          'Robert F. Kennedy Jr.': '卫生部长，医疗改革',
        },
      },
    ],
    agents: [
      { name: 'Elon Musk', capabilities: ['政府效率', '成本削减', '科技创新', 'SpaceX', 'Tesla', '社交媒体'], relationship: 'DOGE 负责人，世界首富，Twitter/X 老板，最具影响力的盟友' },
      { name: 'Marco Rubio', capabilities: ['外交政策', '拉美事务', '国际谈判', '制裁政策', '国家安全'], relationship: '国务卿，佛罗里达参议员，曾经的竞选对手变忠实支持者' },
      { name: 'Pete Hegseth', capabilities: ['国防战略', '军事改革', '退伍军人事务', '军费预算', '作战指挥'], relationship: '国防部长，前 Fox News 主持人，坚定的 MAGA 支持者' },
      { name: 'Scott Bessent', capabilities: ['经济政策', '金融市场', '税收改革', '债务管理', '贸易政策'], relationship: '财政部长，华尔街老将，关键经济顾问' },
      { name: 'Kristi Noem', capabilities: ['国土安全', '边境管控', '移民执法', '反恐', '网络安全'], relationship: '国土安全部长，前南达科他州长，边境强硬派' },
      { name: 'Tulsi Gabbard', capabilities: ['国家情报', '情报分析', '反间谍', '网络战', '安全评估'], relationship: '国家情报总监，前民主党国会议员，转投共和党的盟友' },
      { name: 'Robert F. Kennedy Jr.', capabilities: ['公共卫生', '疫苗政策', '食品安全', '药品监管', '医疗改革'], relationship: '卫生与公众服务部长，反建制派，疫苗怀疑论者' },
    ],
  },
};
