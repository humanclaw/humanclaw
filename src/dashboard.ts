export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>HumanClaw - 碳基节点编排</title>
<style>
:root{--bg:#0f1117;--surface:#1a1d27;--surface-hover:#242836;--border:#2e3346;--text:#e2e4ed;--text-dim:#7b8196;--accent:#00d4ff;--accent-dim:rgba(0,212,255,.12);--green:#22c55e;--yellow:#eab308;--red:#ef4444;--purple:#a855f7;--font-mono:'SF Mono','JetBrains Mono','Fira Code',monospace;--font-sans:-apple-system,'Inter','Segoe UI',sans-serif;--radius:10px}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--text);font-family:var(--font-sans);min-height:100vh;line-height:1.5}
header{padding:20px 32px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:14px}
header h1{font-family:var(--font-mono);font-size:22px;color:var(--accent);letter-spacing:1.5px}
.subtitle{color:var(--text-dim);font-size:12px;border-left:1px solid var(--border);padding-left:14px}
.hdr-spacer{flex:1}
.gear-btn{background:none;border:1px solid var(--border);color:var(--text-dim);width:34px;height:34px;border-radius:8px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .15s}
.gear-btn:hover{color:var(--accent);border-color:var(--accent);background:var(--accent-dim)}
nav{display:flex;border-bottom:1px solid var(--border);padding:0 32px;gap:4px}
.tab{background:none;border:none;color:var(--text-dim);padding:12px 18px;font-size:13px;cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;font-family:var(--font-sans);font-weight:500}
.tab:hover{color:var(--text);background:var(--surface)}
.tab.active{color:var(--accent);border-bottom-color:var(--accent)}
main{padding:24px 32px;max-width:1200px}
.panel{display:none}.panel.active{display:block}
/* Cards */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;transition:border-color .15s}
.card:hover{border-color:color-mix(in srgb,var(--accent) 40%,transparent)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin-top:16px}
/* Agent Card */
.agent-header{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.dot.IDLE{background:var(--green);box-shadow:0 0 8px var(--green)}.dot.BUSY{background:var(--yellow);box-shadow:0 0 8px var(--yellow)}.dot.OFFLINE{background:var(--red);box-shadow:0 0 6px var(--red)}.dot.OOM{background:var(--purple);box-shadow:0 0 8px var(--purple)}
.agent-name{font-weight:600;font-size:15px}
.agent-id{color:var(--text-dim);font-family:var(--font-mono);font-size:11px;margin-bottom:8px}
.caps{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}
.cap{background:var(--accent-dim);border:1px solid color-mix(in srgb,var(--accent) 25%,transparent);border-radius:4px;padding:1px 8px;font-size:11px;color:var(--accent)}
.agent-meta{margin-top:10px;font-size:11px;color:var(--text-dim);display:flex;gap:12px}
.agent-actions{margin-top:12px;display:flex;gap:6px}
.agent-actions select{background:var(--surface-hover);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;outline:none}
.agent-actions button{background:var(--red);color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer}
.agent-actions button:hover{opacity:.8}
/* Stats Bar */
.stats{display:flex;gap:12px;flex-wrap:wrap}
.stat{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px 22px;text-align:center;min-width:90px}
.stat-val{font-size:28px;font-weight:700;font-family:var(--font-mono)}
.stat-lbl{font-size:10px;color:var(--text-dim);text-transform:uppercase;letter-spacing:1px;margin-top:2px}
/* Forms */
.form-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px;margin-top:16px;max-width:620px}
.form-card h3{font-size:15px;color:var(--accent);font-family:var(--font-mono);margin-bottom:16px}
.fg{margin-bottom:14px}
.fg label{display:block;font-size:12px;color:var(--text-dim);margin-bottom:5px;font-weight:500}
.fg input,.fg textarea,.fg select{width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 12px;color:var(--text);font-size:13px;font-family:var(--font-sans);outline:none;transition:border-color .15s}
.fg input:focus,.fg textarea:focus,.fg select:focus{border-color:var(--accent)}
.fg textarea{min-height:80px;resize:vertical;font-family:var(--font-mono);font-size:12px}
.fg .hint{font-size:11px;color:var(--text-dim);margin-top:4px}
.btn{padding:10px 22px;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
.btn:hover{opacity:.85;transform:translateY(-1px)}
.btn:active{transform:translateY(0)}
.btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-primary{background:var(--accent);color:var(--bg)}
.btn-green{background:var(--green);color:#fff}
.btn-danger{background:var(--red);color:#fff}
.btn-ghost{background:transparent;color:var(--accent);border:1px solid var(--border)}
.btn-ghost:hover{background:var(--accent-dim)}
.btn-sm{padding:6px 14px;font-size:12px}
.btn-group{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}
/* Section header */
.section-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.section-hd h2{font-size:16px;font-weight:600}
/* Job card */
.job-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-top:14px}
.job-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.job-title{font-weight:600;font-size:14px}
.job-id{font-family:var(--font-mono);font-size:11px;color:var(--text-dim)}
.pbar-wrap{margin:6px 0 14px}
.pbar-label{font-size:11px;color:var(--text-dim);margin-bottom:4px}
.pbar{background:var(--surface-hover);border-radius:4px;height:6px;overflow:hidden}
.pbar-fill{background:var(--accent);height:100%;border-radius:4px;transition:width .3s}
.kanban{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.lane{min-height:40px}
.lane-hd{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;padding-bottom:4px;border-bottom:2px solid var(--border)}
.lane-hd.y{color:var(--yellow);border-color:var(--yellow)}.lane-hd.r{color:var(--red);border-color:var(--red)}.lane-hd.g{color:var(--green);border-color:var(--green)}
.tcard{background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:8px 10px;margin-bottom:6px;font-size:12px;cursor:pointer;transition:all .15s}
.tcard:hover{border-color:var(--accent);background:var(--surface-hover)}
.tcard-trace{font-family:var(--font-mono);font-size:10px;color:var(--accent);margin-bottom:3px}
.tcard-meta{font-size:10px;color:var(--text-dim);margin-top:3px}
/* Task detail modal */
.task-detail-hd{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.task-detail-hd .dot{width:12px;height:12px}
.task-detail-status{font-size:11px;padding:3px 10px;border-radius:12px;font-weight:600;text-transform:uppercase}
.task-detail-status.DISPATCHED,.task-detail-status.PENDING{background:rgba(234,179,8,.15);color:var(--yellow)}
.task-detail-status.OVERDUE{background:rgba(239,68,68,.15);color:var(--red)}
.task-detail-status.RESOLVED{background:rgba(34,197,94,.15);color:var(--green)}
.trace-copy-row{display:flex;align-items:center;gap:8px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px 12px;margin-bottom:14px;font-family:var(--font-mono);font-size:13px;color:var(--accent)}
.trace-copy-row button{background:var(--surface-hover);border:1px solid var(--border);color:var(--text-dim);border-radius:4px;padding:3px 10px;font-size:11px;cursor:pointer;margin-left:auto;flex-shrink:0}
.trace-copy-row button:hover{color:var(--accent);border-color:var(--accent)}
.detail-row{margin-bottom:12px}
.detail-label{font-size:11px;color:var(--text-dim);margin-bottom:3px;font-weight:500}
.detail-value{font-size:13px}
.result-display{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--font-mono);font-size:12px;white-space:pre-wrap;max-height:200px;overflow-y:auto}
/* Demo cards */
.demo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin-top:16px}
.demo-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden}
.demo-card:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,212,255,.08)}
.demo-card-emoji{font-size:36px;margin-bottom:10px}
.demo-card-title{font-weight:700;font-size:15px;margin-bottom:4px}
.demo-card-role{font-size:12px;color:var(--accent);margin-bottom:8px;font-family:var(--font-mono)}
.demo-card-desc{font-size:12px;color:var(--text-dim);line-height:1.6;margin-bottom:10px}
.demo-card-agents{display:flex;flex-wrap:wrap;gap:4px}
.demo-card-agents span{background:var(--accent-dim);border:1px solid color-mix(in srgb,var(--accent) 20%,transparent);border-radius:4px;padding:1px 6px;font-size:10px;color:var(--accent)}
.demo-card-prompt{margin-top:10px;padding-top:10px;border-top:1px solid var(--border);font-size:11px;color:var(--text-dim);font-style:italic}
.demo-loading{position:absolute;inset:0;background:rgba(15,17,23,.85);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;z-index:2}
/* Toast */
.toast{position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:8px;font-size:13px;z-index:9999;animation:slide-up .25s ease;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.4)}
.toast.ok{background:var(--green);color:#fff}.toast.err{background:var(--red);color:#fff}
@keyframes slide-up{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
/* Empty state */
.empty-state{text-align:center;padding:48px 20px;color:var(--text-dim)}
.empty-state .icon{font-size:48px;margin-bottom:12px;opacity:.6}
.empty-state p{font-size:14px;margin-bottom:16px;max-width:360px;margin-left:auto;margin-right:auto;line-height:1.6}
/* Modal/Overlay */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:100;display:flex;align-items:flex-start;justify-content:center;padding-top:60px;animation:fade-in .15s ease}
.overlay .form-card{max-width:620px;width:100%;max-height:85vh;overflow-y:auto;margin:0}
@keyframes fade-in{from{opacity:0}to{opacity:1}}
/* Agent chips for AI planning */
.chip-bar{display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap}
.chip-filter{background:var(--surface-hover);color:var(--text-dim);border:1px solid var(--border);border-radius:14px;padding:3px 12px;font-size:11px;cursor:pointer;transition:all .15s}
.chip-filter.active{background:var(--accent-dim);color:var(--accent);border-color:var(--accent)}
.agent-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.achip{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:6px 12px;font-size:12px;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:6px;user-select:none}
.achip:hover{border-color:var(--text-dim)}
.achip.selected{border-color:var(--accent);background:var(--accent-dim)}
.achip .adot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.achip .adot.IDLE{background:var(--green)}.achip .adot.BUSY{background:var(--yellow)}.achip .adot.OFFLINE{background:var(--red)}.achip .adot.OOM{background:var(--purple)}
/* Plan preview cards */
.plan-card{background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px}
.plan-card-hd{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.plan-card-hd .adot{width:8px;height:8px;border-radius:50%}
.plan-card-agent{font-weight:600;font-size:13px}
.plan-card-agentid{font-family:var(--font-mono);font-size:10px;color:var(--text-dim)}
.plan-card-desc{font-size:13px;margin-bottom:10px;font-weight:500}
.briefing-box{background:var(--surface);border-left:3px solid var(--accent);border-radius:0 6px 6px 0;padding:10px 14px;font-size:12px;line-height:1.6;color:var(--text);margin-bottom:8px;position:relative}
.briefing-label{font-size:10px;color:var(--accent);font-weight:600;margin-bottom:4px;font-family:var(--font-mono)}
.briefing-copy{position:absolute;top:8px;right:8px;background:var(--surface-hover);border:1px solid var(--border);color:var(--text-dim);border-radius:4px;padding:2px 8px;font-size:10px;cursor:pointer}
.briefing-copy:hover{color:var(--accent);border-color:var(--accent)}
.plan-card-dl{font-size:11px;color:var(--text-dim);font-family:var(--font-mono)}
/* Spinner */
.spinner-wrap{text-align:center;padding:40px 20px}
.spinner{display:inline-block;width:28px;height:28px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner-text{color:var(--text-dim);font-size:13px;margin-top:12px}
/* Manual task row */
.task-row{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:10px;position:relative}
.task-row .remove-task{position:absolute;top:8px;right:10px;background:none;border:none;color:var(--red);cursor:pointer;font-size:16px;line-height:1}
.task-row .fg{margin-bottom:10px}
.task-row .fg:last-child{margin-bottom:0}
/* Markdown Editor */
.md-editor{position:relative}
.md-editor textarea{min-height:120px;resize:vertical;font-family:var(--font-mono);font-size:12px;width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 12px;color:var(--text);outline:none;transition:border-color .15s}
.md-editor textarea:focus{border-color:var(--accent)}
.md-expand-btn{position:absolute;top:6px;right:6px;background:var(--surface-hover);border:1px solid var(--border);color:var(--text-dim);border-radius:4px;width:24px;height:24px;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;transition:all .15s;line-height:1}
.md-expand-btn:hover{color:var(--accent);border-color:var(--accent)}
.md-editor.fullscreen{position:fixed;inset:20px;z-index:200;background:var(--surface);border-radius:var(--radius);padding:16px;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.7)}
.md-editor.fullscreen textarea{flex:1;min-height:unset;height:100%;resize:none;font-size:14px}
.md-editor.fullscreen .md-expand-btn{top:22px;right:22px}
.md-fullscreen-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:199}
/* Team badge */
.team-badge{display:inline-block;background:rgba(168,85,247,.12);border:1px solid rgba(168,85,247,.25);border-radius:4px;padding:1px 8px;font-size:10px;color:var(--purple);margin-right:4px;margin-bottom:2px}
.team-group{margin-bottom:28px}
.team-group-header{display:flex;align-items:center;gap:6px;padding:10px 0 8px;border-bottom:1px solid var(--border);margin-bottom:12px;cursor:pointer}
.team-group-header:hover .agent-name{color:var(--accent)}
/* Evaluation */
.eval-badge{display:inline-block;padding:3px 10px;border-radius:12px;font-weight:700;font-size:13px;font-family:var(--font-mono)}
.eval-badge.top{background:rgba(34,197,94,.15);color:var(--green)}
.eval-badge.mid{background:rgba(234,179,8,.15);color:var(--yellow)}
.eval-badge.low{background:rgba(239,68,68,.15);color:var(--red)}
</style>
</head>
<body>
<header>
  <h1>HumanClaw</h1>
  <span class="subtitle">碳基节点编排框架</span>
  <span class="hdr-spacer"></span>
  <button class="gear-btn" onclick="showSettings()" title="设置">&#9881;</button>
</header>
<nav>
  <button class="tab active" data-panel="fleet">碳基算力池</button>
  <button class="tab" data-panel="pipeline">编排大盘</button>
  <button class="tab" data-panel="terminal">I/O 终端</button>
</nav>
<main>
  <section id="fleet" class="panel active"></section>
  <section id="pipeline" class="panel"></section>
  <section id="terminal" class="panel"></section>
</main>

<script>
const API='/api/v1';
function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
function toast(msg,ok){
  document.querySelectorAll('.toast').forEach(t=>t.remove());
  const t=document.createElement('div');t.className='toast '+(ok?'ok':'err');t.textContent=msg;document.body.appendChild(t);
  setTimeout(()=>t.remove(),3500);
}
let cachedAgents=[];
let cachedTeams=[];
let currentPlan=null;
let selectedAgentIds=new Set();
let selectedTeamId='';

window.toggleFullscreen=function(btn){
  const editor=btn.closest('.md-editor');
  if(editor.classList.contains('fullscreen')){
    editor.classList.remove('fullscreen');
    const bd=document.querySelector('.md-fullscreen-backdrop');
    if(bd)bd.remove();
  }else{
    const bd=document.createElement('div');bd.className='md-fullscreen-backdrop';
    bd.onclick=()=>{editor.classList.remove('fullscreen');bd.remove()};
    document.body.appendChild(bd);
    editor.classList.add('fullscreen');
    const ta=editor.querySelector('textarea');if(ta)ta.focus();
  }
};

// ═══════════════════════════════════════════════
// DEMO SCENARIOS
// ═══════════════════════════════════════════════
const DEMOS={
  sanguo:{
    emoji:'&#128009;',title:'三国蜀汉',role:'你是刘备',
    desc:'桃园结义，三顾茅庐。作为蜀汉之主，统领五虎上将和卧龙凤雏，逐鹿中原。',
    prompt:'北伐中原，兵分三路，需要攻城、断粮和外交三管齐下',
    teams:[
      {name:'三国蜀汉',description:'刘备麾下全体文臣武将',members:['关羽','张飞','赵云','诸葛亮','庞统','黄忠','马超'],relationships:{'关羽':'义弟兼军团统帅','张飞':'义弟兼先锋大将','赵云':'心腹爱将','诸葛亮':'首席军师，如鱼得水','庞统':'副军师，奇谋百出','黄忠':'老当益壮的猛将','马超':'归降的西凉虎将'}}
    ],
    agents:[
      {name:'关羽',capabilities:['武艺','统兵','镇守要地','水军指挥'],relationship:'义弟，桃园结义二弟，最信任的兄弟和大将'},
      {name:'张飞',capabilities:['武艺','先锋突击','骑兵指挥','威慑敌军'],relationship:'义弟，桃园结义三弟，性如烈火但忠心耿耿'},
      {name:'赵云',capabilities:['武艺','护卫','骑兵突击','侦察敏捷'],relationship:'四弟级别的心腹爱将，长坂坡救阿斗'},
      {name:'诸葛亮',capabilities:['战略规划','内政治理','外交','发明创造','阵法'],relationship:'三顾茅庐请来的军师，如鱼得水的关系'},
      {name:'庞统',capabilities:['战略规划','奇谋','攻城战术','地形分析'],relationship:'凤雏，与诸葛亮齐名的军师，副军师中郎将'},
      {name:'黄忠',capabilities:['武艺','弓箭','老当益壮','攻城战'],relationship:'老将军，定军山斩夏侯渊，五虎上将之一'},
      {name:'马超',capabilities:['武艺','骑兵','西凉作战','威慑羌族'],relationship:'归降的西凉猛将，五虎上将之一'}
    ]
  },
  tech:{
    emoji:'&#128187;',title:'互联网大厂',role:'你是技术总监',
    desc:'带领一支全栈团队，从前端到运维一应俱全。应对高并发、搞 AI、上线新系统。',
    prompt:'上线一个 AI 智能客服系统，包括前端界面、后端 API、推荐算法、压力测试和灰度发布方案',
    teams:[
      {name:'互联网大厂',description:'技术总监直管的全栈团队',members:['前端老李','后端大王','算法小陈','产品经理 Amy','设计师小林','测试负责人老赵','运维 DevOps 阿杰'],relationships:{'前端老李':'前端TL，核心骨干','后端大王':'架构师，技术决策者','算法小陈':'算法工程师，需要指导','产品经理 Amy':'产品负责人','设计师小林':'资深设计师','测试负责人老赵':'质量把关人','运维 DevOps 阿杰':'SRE负责人'}}
    ],
    agents:[
      {name:'前端老李',capabilities:['React','TypeScript','Next.js','移动端适配','性能优化'],relationship:'P7 前端 TL，跟了你三年，技术过硬但最近有点倦怠'},
      {name:'后端大王',capabilities:['Java','Go','微服务','数据库设计','高并发架构'],relationship:'P8 后端架构师，技术大拿，说话直来直去'},
      {name:'算法小陈',capabilities:['机器学习','推荐系统','NLP','Python','数据分析'],relationship:'P6 算法工程师，刚从学校毕业一年，潜力很大但经验不足'},
      {name:'产品经理 Amy',capabilities:['需求分析','用户调研','PRD撰写','项目管理','数据驱动'],relationship:'P7 产品经理，业务感觉很好，跨部门沟通能力强'},
      {name:'设计师小林',capabilities:['UI设计','交互设计','Figma','设计系统','用户体验'],relationship:'P6 资深设计师，审美在线，偶尔和产品经理吵架'},
      {name:'测试负责人老赵',capabilities:['自动化测试','性能测试','安全测试','测试用例设计','CI集成'],relationship:'P7 测试负责人，入职五年老员工，对质量要求极高'},
      {name:'运维 DevOps 阿杰',capabilities:['Kubernetes','Docker','CI/CD','监控告警','云原生架构'],relationship:'P7 SRE，半夜被 oncall 叫起来过无数次，求稳派'}
    ]
  },
  gov:{
    emoji:'&#127482;&#127480;',title:'美国政府',role:'你是特朗普 (POTUS)',
    desc:'Make the executive branch great again! 管理你的核心内阁成员，推行政策议程。',
    prompt:'制定一个让美国制造业回流的综合计划，需要关税政策、减税方案、能源保障、边境安全配合和政府效率优化',
    teams:[
      {name:'美国政府',description:'总统直属核心内阁',members:['Elon Musk','Marco Rubio','Pete Hegseth','Scott Bessent','Kristi Noem','Tulsi Gabbard','Robert F. Kennedy Jr.'],relationships:{'Elon Musk':'DOGE 负责人，效率改革推动者','Marco Rubio':'国务卿，外交总管','Pete Hegseth':'国防部长，军事事务','Scott Bessent':'财政部长，首席经济顾问','Kristi Noem':'国土安全部长，边境强硬派','Tulsi Gabbard':'情报总监，安全评估','Robert F. Kennedy Jr.':'卫生部长，医疗改革'}}
    ],
    agents:[
      {name:'Elon Musk',capabilities:['政府效率','成本削减','科技创新','SpaceX','Tesla','社交媒体'],relationship:'DOGE 负责人，世界首富，Twitter/X 老板，最具影响力的盟友'},
      {name:'Marco Rubio',capabilities:['外交政策','拉美事务','国际谈判','制裁政策','国家安全'],relationship:'国务卿，佛罗里达参议员，曾经的竞选对手变忠实支持者'},
      {name:'Pete Hegseth',capabilities:['国防战略','军事改革','退伍军人事务','军费预算','作战指挥'],relationship:'国防部长，前 Fox News 主持人，坚定的 MAGA 支持者'},
      {name:'Scott Bessent',capabilities:['经济政策','金融市场','税收改革','债务管理','贸易政策'],relationship:'财政部长，华尔街老将，关键经济顾问'},
      {name:'Kristi Noem',capabilities:['国土安全','边境管控','移民执法','反恐','网络安全'],relationship:'国土安全部长，前南达科他州长，边境强硬派'},
      {name:'Tulsi Gabbard',capabilities:['国家情报','情报分析','反间谍','网络战','安全评估'],relationship:'国家情报总监，前民主党国会议员，转投共和党的盟友'},
      {name:'Robert F. Kennedy Jr.',capabilities:['公共卫生','疫苗政策','食品安全','药品监管','医疗改革'],relationship:'卫生与公众服务部长，反建制派，疫苗怀疑论者'}
    ]
  }
};

function renderDemoCards(){
  let h='<div style="margin-top:24px"><div style="font-size:14px;font-weight:600;margin-bottom:4px">&#127918; 快速体验 Demo</div><div style="font-size:12px;color:var(--text-dim);margin-bottom:12px">选择一个场景，一键加载碳基节点，立即开始编排</div></div>';
  h+='<div class="demo-grid">';
  for(const[key,d]of Object.entries(DEMOS)){
    h+='<div class="demo-card" id="demo-card-'+key+'" onclick="loadDemo(\\''+key+'\\')">';
    h+='<div class="demo-card-emoji">'+d.emoji+'</div>';
    h+='<div class="demo-card-title">'+d.title+'</div>';
    h+='<div class="demo-card-role">'+d.role+'</div>';
    h+='<div class="demo-card-desc">'+esc(d.desc)+'</div>';
    h+='<div class="demo-card-agents">';
    for(const a of d.agents)h+='<span>'+esc(a.name)+'</span>';
    h+='</div>';
    h+='<div class="demo-card-prompt">&#128161; &quot;'+esc(d.prompt)+'&quot;</div>';
    h+='</div>';
  }
  h+='</div>';
  return h;
}

window.loadDemo=async function(key){
  const demo=DEMOS[key];
  if(!demo)return;
  const card=document.getElementById('demo-card-'+key);
  if(card){
    const ld=document.createElement('div');ld.className='demo-loading';
    ld.innerHTML='<div class="spinner"></div><div style="font-size:12px;color:var(--text-dim)">加载 '+demo.title+' 场景中...</div>';
    card.appendChild(ld);
  }
  let ok=0;
  const demoAgentIds=[];
  const agentNameToId={};
  for(const a of demo.agents){
    try{
      const r=await fetch(API+'/nodes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:a.name,capabilities:a.capabilities,relationship:a.relationship})});
      if(r.ok){ok++;const d=await r.json();demoAgentIds.push(d.agent_id);agentNameToId[a.name]=d.agent_id;}
    }catch{}
  }
  // Create demo teams
  if(demo.teams){
    for(const tm of demo.teams){
      try{
        const tr=await fetch(API+'/teams',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:tm.name,description:tm.description||''})});
        if(tr.ok){
          const td=await tr.json();
          for(const mName of tm.members){
            const agentId=agentNameToId[mName];
            if(agentId){
              const rel=tm.relationships?tm.relationships[mName]||'':'';
              await fetch(API+'/teams/'+td.team_id+'/members',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({agent_id:agentId,relationship:rel})});
            }
          }
        }
      }catch{}
    }
  }
  toast(demo.title+' 场景已加载！'+ok+'/'+demo.agents.length+' 个节点注册成功',true);
  // Switch to pipeline and open AI planning with suggested prompt
  load('fleet');
  setTimeout(()=>{
    // Switch tab to pipeline
    const tabs=document.querySelectorAll('.tab');
    const panels=document.querySelectorAll('.panel');
    tabs.forEach(x=>x.classList.remove('active'));
    panels.forEach(x=>x.classList.remove('active'));
    tabs[1].classList.add('active');
    document.getElementById('pipeline').classList.add('active');
    load('pipeline');
    // Wait for pipeline to render, then open create job with demo prompt
    setTimeout(()=>showCreateJob(demo.prompt,demoAgentIds),300);
  },200);
};

window.showDemoSelector=function(){
  const ov=document.createElement('div');ov.className='overlay';ov.id='overlay';
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove()});
  let h='<div class="form-card"><h3>&#127918; 选择 Demo 场景</h3>';
  h+='<div style="font-size:12px;color:var(--text-dim);margin-bottom:16px">一键加载碳基节点，立即开始编排体验</div>';
  for(const[key,d]of Object.entries(DEMOS)){
    h+='<div class="demo-card" id="demo-card-'+key+'" onclick="document.getElementById(\\'overlay\\').remove();loadDemo(\\''+key+'\\')" style="margin-bottom:10px">';
    h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-size:28px">'+d.emoji+'</span><div><div class="demo-card-title">'+d.title+'</div><div class="demo-card-role">'+d.role+'</div></div></div>';
    h+='<div class="demo-card-desc">'+esc(d.desc)+'</div>';
    h+='<div class="demo-card-agents">';
    for(const a of d.agents)h+='<span>'+esc(a.name)+'</span>';
    h+='</div></div>';
  }
  h+='<div class="btn-group"><button class="btn btn-ghost" onclick="document.getElementById(\\'overlay\\').remove()">取消</button></div></div>';
  ov.innerHTML=h;
  document.body.appendChild(ov);
};

// ═══════════════════════════════════════════════
// FLEET
// ═══════════════════════════════════════════════
async function loadFleet(el){
  el.innerHTML='<div class="empty-state"><p>加载中...</p></div>';
  try{
    const r=await fetch(API+'/nodes/status');
    const d=await r.json();
    cachedAgents=d.agents||[];
    // Also load teams
    try{const tr=await fetch(API+'/teams');const td=await tr.json();cachedTeams=td.teams||[]}catch{cachedTeams=[]}
    let h='<div class="section-hd"><h2>碳基算力池</h2><div style="display:flex;gap:6px"><button class="btn btn-ghost btn-sm" onclick="showDemoSelector()">&#127918; Demo</button><button class="btn btn-primary btn-sm" onclick="showAddAgent()">+ 添加节点</button></div></div>';
    h+='<div class="stats">';
    h+='<div class="stat"><div class="stat-val">'+d.total+'</div><div class="stat-lbl">总计</div></div>';
    h+='<div class="stat"><div class="stat-val" style="color:var(--green)">'+d.idle+'</div><div class="stat-lbl">空闲</div></div>';
    h+='<div class="stat"><div class="stat-val" style="color:var(--yellow)">'+d.busy+'</div><div class="stat-lbl">忙碌</div></div>';
    h+='<div class="stat"><div class="stat-val" style="color:var(--red)">'+d.offline+'</div><div class="stat-lbl">离线</div></div>';
    h+='<div class="stat"><div class="stat-val" style="color:var(--purple)">'+d.oom+'</div><div class="stat-lbl">崩溃</div></div>';
    h+='</div>';
    if(!d.agents.length){
      h+='<div class="empty-state" style="margin-top:32px"><div class="icon">&#128100;</div><p>还没有碳基节点。点击上方「+ 添加节点」手动注册，或选择一个 Demo 场景快速体验。</p></div>';
      h+=renderDemoCards();
      el.innerHTML=h;return;
    }
    // Build agent card HTML helper
    function agentCard(a){
      let c='<div class="card"><div class="agent-header"><span class="dot '+a.status+'"></span><span class="agent-name">'+esc(a.name)+'</span></div>';
      c+='<div class="agent-id">'+a.agent_id+'</div>';
      if(a.relationship)c+='<div style="font-size:11px;color:var(--purple);margin-bottom:4px">&#128101; '+esc(a.relationship)+'</div>';
      c+='<div class="caps">';for(const cap of a.capabilities)c+='<span class="cap">'+esc(cap)+'</span>';c+='</div>';
      c+='<div class="agent-meta"><span>任务: '+a.active_task_count+'</span>';
      if(a.avg_delivery_hours!==null)c+='<span>平均交付: '+a.avg_delivery_hours+'h</span>';
      c+='</div>';
      c+='<div class="agent-actions">';
      c+='<select onchange="changeStatus(\\''+a.agent_id+'\\',this.value)">';
      for(const s of ['IDLE','BUSY','OFFLINE','OOM'])c+='<option'+(s===a.status?' selected':'')+'>'+s+'</option>';
      c+='</select>';
      c+='<button onclick="deleteAgent(\\''+a.agent_id+'\\')">删除</button>';
      c+='</div></div>';
      return c;
    }
    // Group agents by team
    const assignedIds=new Set();
    if(cachedTeams.length){
      for(const tm of cachedTeams){
        if(!tm.members||!tm.members.length)continue;
        const teamAgents=d.agents.filter(a=>tm.members.some(m=>m.agent_id===a.agent_id));
        if(!teamAgents.length)continue;
        for(const a of teamAgents)assignedIds.add(a.agent_id);
        h+='<div class="team-group">';
        h+='<div class="team-group-header" onclick="showTeamDetail(\\''+tm.team_id+'\\')">';
        h+='<span style="font-size:18px">&#128101;</span> <span class="agent-name">'+esc(tm.name)+'</span>';
        if(tm.description)h+=' <span style="font-size:12px;color:var(--text-dim);margin-left:8px">'+esc(tm.description)+'</span>';
        h+=' <span style="font-size:11px;color:var(--accent);margin-left:8px">'+teamAgents.length+' 人</span>';
        h+='</div>';
        h+='<div class="grid">';
        for(const a of teamAgents)h+=agentCard(a);
        h+='</div></div>';
      }
    }
    // Ungrouped agents
    const ungrouped=d.agents.filter(a=>!assignedIds.has(a.agent_id));
    if(ungrouped.length){
      if(assignedIds.size>0){
        h+='<div class="team-group">';
        h+='<div class="team-group-header"><span style="font-size:18px">&#128100;</span> <span class="agent-name">未分组</span> <span style="font-size:11px;color:var(--accent);margin-left:8px">'+ungrouped.length+' 人</span></div>';
        h+='<div class="grid">';
        for(const a of ungrouped)h+=agentCard(a);
        h+='</div></div>';
      } else {
        h+='<div class="grid">';
        for(const a of ungrouped)h+=agentCard(a);
        h+='</div>';
      }
    }
    // Team management buttons
    h+='<div style="margin-top:24px;display:flex;gap:8px;align-items:center">';
    h+='<button class="btn btn-primary btn-sm" onclick="showCreateTeam()">+ 创建团队</button>';
    if(cachedTeams.length){
      for(const tm of cachedTeams){
        h+='<span class="team-badge" style="cursor:pointer" onclick="showTeamDetail(\\''+tm.team_id+'\\')">'+esc(tm.name)+'</span>';
      }
    }
    h+='</div>';
    el.innerHTML=h;
  }catch(e){el.innerHTML='<div class="empty-state"><p>加载失败: '+e.message+'</p></div>'}
}
window.showAddAgent=function(){
  const ov=document.createElement('div');ov.className='overlay';ov.id='overlay';
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove()});
  ov.innerHTML='<div class="form-card"><h3>+ 添加碳基节点</h3>'
    +'<div class="fg"><label>节点名称</label><input id="aa-name" placeholder="例: 前端老李"/></div>'
    +'<div class="fg"><label>技能标签</label><input id="aa-caps" placeholder="例: UI/UX, 前端开发, 抗压能力强"/><div class="hint">多个标签用逗号分隔</div></div>'
    +'<div class="fg"><label>与你的关系 <span style="color:var(--text-dim);font-weight:400">(可选)</span></label><input id="aa-rel" placeholder="例: 直属下属 / 实习生 / 外包同事 / 义弟"/><div class="hint">描述此人与你的关系，AI 规划和模拟交付时会参考</div></div>'
    +'<div class="btn-group"><button class="btn btn-primary" onclick="submitAgent()">注册节点</button><button class="btn btn-ghost" onclick="document.getElementById(\\'overlay\\').remove()">取消</button></div></div>';
  document.body.appendChild(ov);
  document.getElementById('aa-name').focus();
};
window.submitAgent=async function(){
  const name=document.getElementById('aa-name').value.trim();
  const caps=document.getElementById('aa-caps').value.trim();
  const rel=document.getElementById('aa-rel').value.trim();
  if(!name){toast('请输入节点名称',false);return}
  if(!caps){toast('请输入至少一个技能标签',false);return}
  try{
    const r=await fetch(API+'/nodes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,capabilities:caps.split(',').map(s=>s.trim()).filter(Boolean),relationship:rel})});
    const d=await r.json();
    if(!r.ok){toast(d.error||'注册失败',false);return}
    toast('节点 '+d.agent_id+' 注册成功！',true);
    document.getElementById('overlay').remove();
    load('fleet');
  }catch{toast('网络错误',false)}
};
window.changeStatus=async function(id,status){
  try{
    const r=await fetch(API+'/nodes/'+id+'/status',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});
    if(!r.ok){const d=await r.json();toast(d.error||'更新失败',false);return}
    toast('状态已更新',true);
  }catch{toast('网络错误',false)}
};
window.deleteAgent=async function(id){
  if(!confirm('确定删除节点 '+id+'？'))return;
  try{
    const r=await fetch(API+'/nodes/'+id,{method:'DELETE'});
    if(!r.ok){const d=await r.json();toast(d.error||'删除失败',false);return}
    toast('节点已删除',true);load('fleet');
  }catch{toast('网络错误',false)}
};

// ─── Team Management ────────────────────────
window.showCreateTeam=function(){
  const ov=document.createElement('div');ov.className='overlay';ov.id='overlay';
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove()});
  let membersHtml='<div id="team-members-list">';
  for(const a of cachedAgents){
    membersHtml+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">';
    membersHtml+='<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px"><input type="checkbox" class="tm-check" value="'+a.agent_id+'"/><span class="dot '+a.status+'" style="width:8px;height:8px"></span>'+esc(a.name)+'</label>';
    membersHtml+='<input class="tm-rel" data-agent="'+a.agent_id+'" placeholder="团队中的关系" style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:4px 8px;font-size:11px;color:var(--text);outline:none"/>';
    membersHtml+='</div>';
  }
  membersHtml+='</div>';
  ov.innerHTML='<div class="form-card"><h3>+ 创建团队</h3>'
    +'<div class="fg"><label>团队名称</label><input id="tm-name" placeholder="例: 前端组"/></div>'
    +'<div class="fg"><label>团队描述 <span style="color:var(--text-dim);font-weight:400">(可选)</span></label><input id="tm-desc" placeholder="例: 负责所有前端页面开发"/></div>'
    +'<div class="fg"><label>选择成员及团队关系</label>'+membersHtml+'</div>'
    +'<div class="btn-group"><button class="btn btn-primary" onclick="submitTeam()">创建团队</button><button class="btn btn-ghost" onclick="document.getElementById(\\'overlay\\').remove()">取消</button></div></div>';
  document.body.appendChild(ov);
  document.getElementById('tm-name').focus();
};
window.submitTeam=async function(){
  const name=document.getElementById('tm-name').value.trim();
  const desc=document.getElementById('tm-desc').value.trim();
  if(!name){toast('请输入团队名称',false);return}
  try{
    const r=await fetch(API+'/teams',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,description:desc})});
    const d=await r.json();
    if(!r.ok){toast(d.error||'创建失败',false);return}
    const checks=document.querySelectorAll('.tm-check:checked');
    for(const chk of checks){
      const agentId=chk.value;
      const relInput=document.querySelector('.tm-rel[data-agent="'+agentId+'"]');
      const rel=relInput?relInput.value.trim():'';
      await fetch(API+'/teams/'+d.team_id+'/members',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({agent_id:agentId,relationship:rel})});
    }
    toast('团队「'+name+'」创建成功！',true);
    document.getElementById('overlay').remove();
    load('fleet');
  }catch{toast('网络错误',false)}
};
window.showTeamDetail=async function(teamId){
  const ov=document.createElement('div');ov.className='overlay';ov.id='overlay';
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove()});
  ov.innerHTML='<div class="form-card"><h3>团队详情</h3><div class="spinner-wrap"><div class="spinner"></div></div></div>';
  document.body.appendChild(ov);
  try{
    const r=await fetch(API+'/teams/'+teamId);
    const tm=await r.json();
    if(!r.ok){toast(tm.error||'加载失败',false);ov.remove();return}
    const fc=ov.querySelector('.form-card');
    let h='<h3>'+esc(tm.name)+'</h3>';
    if(tm.description)h+='<div style="font-size:12px;color:var(--text-dim);margin-bottom:16px">'+esc(tm.description)+'</div>';
    h+='<div style="font-size:11px;color:var(--text-dim);margin-bottom:12px;font-family:var(--font-mono)">'+tm.team_id+'</div>';
    if(tm.members&&tm.members.length){
      h+='<div style="font-size:13px;font-weight:600;margin-bottom:8px">成员 ('+tm.members.length+')</div>';
      for(const m of tm.members){
        h+='<div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--bg);border:1px solid var(--border);border-radius:8px;margin-bottom:6px">';
        h+='<span class="dot '+(m.agent_status||'IDLE')+'" style="width:8px;height:8px"></span>';
        h+='<span style="font-size:13px;font-weight:500">'+esc(m.agent_name||m.agent_id)+'</span>';
        if(m.relationship)h+='<span style="font-size:11px;color:var(--purple);margin-left:auto">'+esc(m.relationship)+'</span>';
        h+='<button style="margin-left:'+(m.relationship?'8px':'auto')+';background:none;border:none;color:var(--red);cursor:pointer;font-size:14px" onclick="removeTeamMember(\\''+teamId+'\\',\\''+m.agent_id+'\\')">&times;</button>';
        h+='</div>';
      }
    }else{
      h+='<div style="font-size:12px;color:var(--text-dim)">暂无成员</div>';
    }
    h+='<div class="btn-group"><button class="btn btn-danger btn-sm" onclick="deleteTeam(\\''+teamId+'\\')">删除团队</button><button class="btn btn-ghost" onclick="document.getElementById(\\'overlay\\').remove()">关闭</button></div>';
    fc.innerHTML=h;
  }catch{toast('加载失败',false);ov.remove()}
};
window.removeTeamMember=async function(teamId,agentId){
  try{
    await fetch(API+'/teams/'+teamId+'/members/'+agentId,{method:'DELETE'});
    toast('成员已移除',true);
    document.getElementById('overlay').remove();
    showTeamDetail(teamId);
  }catch{toast('网络错误',false)}
};
window.deleteTeam=async function(teamId){
  if(!confirm('确定删除此团队？'))return;
  try{
    const r=await fetch(API+'/teams/'+teamId,{method:'DELETE'});
    if(!r.ok){toast('删除失败',false);return}
    toast('团队已删除',true);
    document.getElementById('overlay').remove();
    load('fleet');
  }catch{toast('网络错误',false)}
};

// ═══════════════════════════════════════════════
// PIPELINE
// ═══════════════════════════════════════════════
let allTasks=[];
function tcard(t){
  return '<div class="tcard" onclick="showTaskDetail(\\''+t.trace_id+'\\')"><div class="tcard-trace">'+t.trace_id+'</div><div>'+esc(t.todo_description)+'</div><div class="tcard-meta">'+t.assignee_id+' | '+new Date(t.deadline).toLocaleString()+'</div></div>';
}
async function loadPipeline(el){
  el.innerHTML='<div class="empty-state"><p>加载中...</p></div>';
  allTasks=[];
  try{
    try{const ar=await fetch(API+'/nodes/status');const ad=await ar.json();cachedAgents=ad.agents||[]}catch{}
    const r=await fetch(API+'/jobs/active');
    const d=await r.json();
    let h='<div class="section-hd"><h2>碳基编排大盘</h2><button class="btn btn-primary btn-sm" onclick="showCreateJob()">+ 创建任务</button></div>';
    if(!d.jobs.length){
      h+='<div class="empty-state" style="margin-top:32px"><div class="icon">📋</div><p>暂无进行中的任务。点击上方「+ 创建任务」，输入需求后 AI 自动规划分发。';
      if(!cachedAgents.length)h+='<br/><br/>⚠️ 需要先在「碳基算力池」中添加碳基节点。';
      h+='</p></div>';
      el.innerHTML=h;return;
    }
    for(const j of d.jobs){
      const res=j.tasks.filter(t=>t.status==='RESOLVED').length;
      const tot=j.tasks.length;
      const pct=tot?Math.round(res/tot*100):0;
      const dispatched=j.tasks.filter(t=>t.status==='DISPATCHED'||t.status==='PENDING');
      const overdue=j.tasks.filter(t=>t.status==='OVERDUE');
      const done=j.tasks.filter(t=>t.status==='RESOLVED');
      allTasks.push(...j.tasks);
      h+='<div class="job-card"><div class="job-hd"><span class="job-title">'+esc(j.original_prompt)+'</span><span class="job-id">'+j.job_id+'</span></div>';
      h+='<div class="pbar-wrap"><div class="pbar-label">'+res+'/'+tot+' 已完成 ('+pct+'%)</div><div class="pbar"><div class="pbar-fill" style="width:'+pct+'%"></div></div></div>';
      if(pct===100)h+='<div style="margin-bottom:12px;display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-green btn-sm" onclick="reviewJob(\\''+j.job_id+'\\')">AI 聚合审查</button><button class="btn btn-primary btn-sm" onclick="showEvalDialog(\\''+j.job_id+'\\')">&#128202; 生成绩效评价</button></div>';
      h+='<div class="kanban"><div class="lane"><div class="lane-hd y">已分发 ('+dispatched.length+')</div>'+dispatched.map(tcard).join('')+'</div>';
      h+='<div class="lane"><div class="lane-hd r">已超时 ('+overdue.length+')</div>'+overdue.map(tcard).join('')+'</div>';
      h+='<div class="lane"><div class="lane-hd g">已交付 ('+done.length+')</div>'+done.map(tcard).join('')+'</div></div></div>';
    }
    el.innerHTML=h;
  }catch(e){el.innerHTML='<div class="empty-state"><p>加载失败: '+e.message+'</p></div>'}
}

// ─── AI Planning Flow ────────────────────────
let pendingDemoPrompt='';
window.showCreateJob=function(demoPrompt,demoAgentIds){
  if(!cachedAgents.length){toast('请先在「碳基算力池」中添加至少一个碳基节点',false);return}
  pendingDemoPrompt=demoPrompt||'';
  currentPlan=null;
  // Pre-select: demo agents if provided, otherwise all IDLE agents
  if(demoAgentIds&&demoAgentIds.length){
    selectedAgentIds=new Set(demoAgentIds);
  }else{
    selectedAgentIds=new Set(cachedAgents.filter(a=>a.status==='IDLE').map(a=>a.agent_id));
  }
  const ov=document.createElement('div');ov.className='overlay';ov.id='overlay';
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove()});
  renderPlanStep1(ov);
  document.body.appendChild(ov);
};

function renderPlanStep1(ov){
  let chipFilter='all';
  function renderChips(filter){
    chipFilter=filter;
    const filtered=filter==='idle'?cachedAgents.filter(a=>a.status==='IDLE'):cachedAgents;
    let ch='<div class="chip-bar">';
    ch+='<span class="chip-filter'+(filter==='all'?' active':'')+'" onclick="window._filterChips(\\'all\\')">全部</span>';
    ch+='<span class="chip-filter'+(filter==='idle'?' active':'')+'" onclick="window._filterChips(\\'idle\\')">仅空闲</span>';
    ch+='</div>';
    ch+='<div class="agent-chips">';
    for(const a of filtered){
      const sel=selectedAgentIds.has(a.agent_id);
      ch+='<div class="achip'+(sel?' selected':'')+'" onclick="window._toggleChip(\\''+a.agent_id+'\\')">';
      ch+='<span class="adot '+a.status+'"></span>';
      ch+=esc(a.name);
      ch+='</div>';
    }
    ch+='</div>';
    return ch;
  }
  window._filterChips=function(f){
    chipFilter=f;
    const el=document.getElementById('agent-chip-area');
    if(el)el.innerHTML=renderChips(f);
  };
  window._toggleChip=function(id){
    if(selectedAgentIds.has(id))selectedAgentIds.delete(id);
    else selectedAgentIds.add(id);
    const el=document.getElementById('agent-chip-area');
    if(el)el.innerHTML=renderChips(chipFilter);
  };
  window._selectTeam=function(teamId){
    selectedTeamId=teamId;
    if(teamId){
      const tm=cachedTeams.find(t=>t.team_id===teamId);
      if(tm&&tm.members){
        selectedAgentIds=new Set(tm.members.map(m=>m.agent_id));
      }
    }
    const el=document.getElementById('agent-chip-area');
    if(el)el.innerHTML=renderChips(chipFilter);
    // Re-render to show team hint
    renderPlanStep1(document.getElementById('overlay'));
  };

  ov.innerHTML='<div class="form-card"><h3>AI 智能规划</h3>'
    +'<div class="fg"><label>输入你的需求</label><div class="md-editor"><textarea id="plan-prompt" rows="3" placeholder="例: 完成首页重构，包括导航栏、内容区和页脚的响应式改版" style="font-family:var(--font-sans);font-size:13px">'+esc(pendingDemoPrompt)+'</textarea><button class="md-expand-btn" onclick="toggleFullscreen(this)" title="展开/收起">&#x26F6;</button></div></div>'
    +'<div class="fg"><label>按团队选择 <span style="color:var(--text-dim);font-weight:400">(可选)</span></label><select id="plan-team" onchange="window._selectTeam(this.value)"><option value="">-- 不按团队 --</option>'+cachedTeams.map(t=>'<option value="'+t.team_id+'"'+(selectedTeamId===t.team_id?' selected':'')+'>'+esc(t.name)+'</option>').join('')+'</select>'
    +(selectedTeamId?'<div class="hint" style="color:var(--accent)">&#128101; 使用团队关系上下文</div>':'')+'</div>'
    +'<div class="fg"><label>选择参与的碳基节点 <span style="color:var(--text-dim);font-weight:400">(默认选中空闲节点)</span></label>'
    +'<div id="agent-chip-area">'+renderChips('all')+'</div></div>'
    +'<div class="btn-group">'
    +'<button class="btn btn-primary" onclick="planWithAI()">AI 规划</button>'
    +'<button class="btn btn-ghost" onclick="showManualCreate()">手动创建</button>'
    +'<button class="btn btn-ghost" onclick="document.getElementById(\\'overlay\\').remove()">取消</button>'
    +'</div></div>';
  setTimeout(()=>{const ta=document.getElementById('plan-prompt');if(ta)ta.focus()},50);
};

window.planWithAI=async function(){
  const prompt=document.getElementById('plan-prompt').value.trim();
  if(!prompt){toast('请输入需求描述',false);return}
  if(selectedAgentIds.size===0){toast('请至少选择一个碳基节点',false);return}

  const ov=document.getElementById('overlay');
  const fc=ov.querySelector('.form-card');
  fc.innerHTML='<h3>AI 智能规划</h3><div class="spinner-wrap"><div class="spinner"></div><div class="spinner-text">AI 正在分析需求、匹配节点、生成话术...</div></div>';

  try{
    const reqBody={prompt,agent_ids:Array.from(selectedAgentIds)};
    if(selectedTeamId)reqBody.team_id=selectedTeamId;
    const r=await fetch(API+'/jobs/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(reqBody)});
    const d=await r.json();
    if(!r.ok){
      toast(d.error||'规划失败',false);
      renderPlanStep1(ov);
      return;
    }
    currentPlan={...d};
    renderPlanStep2(ov);
  }catch(e){
    toast('网络错误: '+e.message,false);
    renderPlanStep1(ov);
  }
};

function renderPlanStep2(ov){
  const p=currentPlan;
  let h='<h3>规划预览</h3>';
  h+='<div style="font-size:12px;color:var(--text-dim);margin-bottom:14px">需求: '+esc(p.original_prompt)+'</div>';
  for(let i=0;i<p.planned_tasks.length;i++){
    const t=p.planned_tasks[i];
    const agent=cachedAgents.find(a=>a.agent_id===t.assignee_id);
    const status=agent?agent.status:'IDLE';
    h+='<div class="plan-card">';
    h+='<div class="plan-card-hd"><span class="adot '+status+'"></span><span class="plan-card-agent">'+esc(t.assignee_name)+'</span><span class="plan-card-agentid">'+t.assignee_id+'</span></div>';
    h+='<div class="plan-card-desc">'+esc(t.todo_description)+'</div>';
    h+='<div class="briefing-box"><div class="briefing-label">话术 (可直接发给 TA)</div><button class="briefing-copy" onclick="window._copyBriefing('+i+')">复制</button>'+esc(t.briefing)+'</div>';
    const dlVal=t.deadline.slice(0,16);
    h+='<div class="plan-card-dl"><label style="font-size:10px;color:var(--text-dim);margin-right:6px">截止时间</label><input type="datetime-local" class="plan-dl-input" data-idx="'+i+'" value="'+dlVal+'" style="background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:4px 8px;color:var(--text);font-family:var(--font-mono);font-size:12px;outline:none"/></div>';
    h+='</div>';
  }
  h+='<div class="btn-group">';
  h+='<button class="btn btn-green" onclick="dispatchPlan()">确认分发</button>';
  h+='<button class="btn btn-ghost" onclick="renderPlanStep1(document.getElementById(\\'overlay\\'))">重新规划</button>';
  h+='<button class="btn btn-ghost" onclick="document.getElementById(\\'overlay\\').remove()">取消</button>';
  h+='</div>';
  ov.querySelector('.form-card').innerHTML=h;
}
window.renderPlanStep1=renderPlanStep1;

window._copyBriefing=function(i){
  const text=currentPlan.planned_tasks[i].briefing;
  navigator.clipboard.writeText(text).then(()=>toast('话术已复制',true)).catch(()=>toast('复制失败',false));
};

window.dispatchPlan=async function(){
  const p=currentPlan;
  // Read adjusted deadlines from inputs
  const dlInputs=document.querySelectorAll('.plan-dl-input');
  const tasks=p.planned_tasks.map((t,i)=>{
    const input=dlInputs[i];
    const dl=input?new Date(input.value).toISOString():t.deadline;
    return {assignee_id:t.assignee_id,todo_description:t.todo_description,deadline:dl};
  });
  try{
    const r=await fetch(API+'/jobs/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({original_prompt:p.original_prompt,tasks})});
    const d=await r.json();
    if(!r.ok){toast(d.error||'分发失败',false);return}
    toast('任务已分发！Job: '+d.job_id,true);
    document.getElementById('overlay').remove();
    load('pipeline');
  }catch{toast('网络错误',false)}
};

// ─── Manual creation (fallback) ──────────────
window.showManualCreate=function(){
  const ov=document.getElementById('overlay');
  const optionsHtml=cachedAgents.map(a=>'<option value="'+a.agent_id+'">'+esc(a.name)+' ('+a.agent_id+')</option>').join('');
  const tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,16);
  ov.querySelector('.form-card').innerHTML='<h3>手动创建任务</h3>'
    +'<div class="fg"><label>任务描述 (原始需求)</label><input id="cj-prompt" placeholder="例: 完成首页改版"/></div>'
    +'<div style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center"><label style="font-size:13px;font-weight:600;color:var(--text)">子任务列表</label><button class="btn btn-ghost btn-sm" onclick="addTaskRow()">+ 添加子任务</button></div>'
    +'<div id="task-rows"><div class="task-row"><div class="fg"><label>指派节点</label><select class="tr-agent">'+optionsHtml+'</select></div><div class="fg"><label>任务描述</label><input class="tr-desc" placeholder="具体要做什么..."/></div><div class="fg"><label>截止时间</label><input class="tr-deadline" type="datetime-local" value="'+tomorrow+'"/></div></div></div>'
    +'<div class="btn-group"><button class="btn btn-primary" onclick="submitJob()">创建并分发</button><button class="btn btn-ghost" onclick="renderPlanStep1(document.getElementById(\\'overlay\\'))">返回 AI 规划</button><button class="btn btn-ghost" onclick="document.getElementById(\\'overlay\\').remove()">取消</button></div>';
};
window.addTaskRow=function(){
  const optionsHtml=cachedAgents.map(a=>'<option value="'+a.agent_id+'">'+esc(a.name)+' ('+a.agent_id+')</option>').join('');
  const tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,16);
  const row=document.createElement('div');row.className='task-row';
  row.innerHTML='<button class="remove-task" onclick="this.parentElement.remove()">&times;</button>'
    +'<div class="fg"><label>指派节点</label><select class="tr-agent">'+optionsHtml+'</select></div>'
    +'<div class="fg"><label>任务描述</label><input class="tr-desc" placeholder="具体要做什么..."/></div>'
    +'<div class="fg"><label>截止时间</label><input class="tr-deadline" type="datetime-local" value="'+tomorrow+'"/></div>';
  document.getElementById('task-rows').appendChild(row);
};
window.submitJob=async function(){
  const prompt=document.getElementById('cj-prompt').value.trim();
  if(!prompt){toast('请输入任务描述',false);return}
  const rows=document.querySelectorAll('.task-row');
  const tasks=[];
  for(const row of rows){
    const aid=row.querySelector('.tr-agent').value;
    const desc=row.querySelector('.tr-desc').value.trim();
    const dl=row.querySelector('.tr-deadline').value;
    if(!desc){toast('每个子任务都需要填写描述',false);return}
    tasks.push({assignee_id:aid,todo_description:desc,deadline:new Date(dl).toISOString()});
  }
  if(!tasks.length){toast('至少添加一个子任务',false);return}
  try{
    const r=await fetch(API+'/jobs/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({original_prompt:prompt,tasks})});
    const d=await r.json();
    if(!r.ok){toast(d.error||'创建失败',false);return}
    toast('任务已创建并分发！Job: '+d.job_id,true);
    document.getElementById('overlay').remove();
    load('pipeline');
  }catch{toast('网络错误',false)}
};
window.reviewJob=async function(jobId){
  const ov=document.createElement('div');ov.className='overlay';ov.id='overlay';
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove()});
  ov.innerHTML='<div class="form-card"><h3>AI 聚合审查</h3><div class="spinner-wrap"><div class="spinner"></div><div class="spinner-text">AI 正在审查所有交付物...</div></div></div>';
  document.body.appendChild(ov);
  try{
    const r=await fetch(API+'/jobs/'+jobId+'/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({})});
    const d=await r.json();
    if(!r.ok){toast(d.error||'审查失败',false);ov.remove();return}
    const fc=ov.querySelector('.form-card');
    fc.innerHTML='<h3>AI 聚合审查</h3>'
      +'<div style="font-size:12px;color:var(--text-dim);margin-bottom:12px">需求: '+esc(d.original_prompt)+'</div>'
      +'<div class="md-editor"><div class="result-display" style="max-height:400px">'+esc(d.review).replace(/\\n/g,'<br>')+'</div></div>'
      +'<div style="font-size:10px;color:var(--text-dim);margin-top:8px;font-family:var(--font-mono)">审查时间: '+new Date(d.reviewed_at).toLocaleString()+'</div>'
      +'<div class="btn-group"><button class="btn btn-ghost" onclick="document.getElementById(\\'overlay\\').remove()">关闭</button></div>';
  }catch(e){toast('网络错误: '+e.message,false);ov.remove()}
};

window.showEvalDialog=function(jobId){
  const ov=document.createElement('div');ov.className='overlay';ov.id='overlay';
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove()});
  ov.innerHTML='<div class="form-card"><h3>&#128202; 生成绩效评价</h3>'
    +'<div class="fg"><label>评分体系</label><select id="eval-system">'
    +'<option value="ali">阿里绩效 (3.25 / 3.5 / 3.5+ / 3.75 / 4.0)</option>'
    +'<option value="letter">SABCD 等级 (S / A / B / C / D)</option>'
    +'<option value="em">EM/MM 体系 (EM+ / EM / MM+ / MM / MM-)</option>'
    +'</select></div>'
    +'<div class="btn-group"><button class="btn btn-primary" onclick="generateEval(\\''+jobId+'\\')">生成评价</button><button class="btn btn-ghost" onclick="document.getElementById(\\'overlay\\').remove()">取消</button></div></div>';
  document.body.appendChild(ov);
};
window.generateEval=async function(jobId){
  const ratingSystem=document.getElementById('eval-system').value;
  const ov=document.getElementById('overlay');
  const fc=ov.querySelector('.form-card');
  fc.innerHTML='<h3>&#128202; 生成绩效评价</h3><div class="spinner-wrap"><div class="spinner"></div><div class="spinner-text">AI 正在评估每个碳基节点的表现...</div></div>';
  try{
    const r=await fetch(API+'/evaluations/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({job_id:jobId,rating_system:ratingSystem})});
    const d=await r.json();
    if(!r.ok){toast(d.error||'评价生成失败',false);ov.remove();return}
    let h='<h3>&#128202; 绩效评价结果</h3>';
    h+='<div style="font-size:11px;color:var(--text-dim);margin-bottom:16px;font-family:var(--font-mono)">生成时间: '+new Date(d.generated_at).toLocaleString()+'</div>';
    const ratingTiers={ali:['4.0','3.75'],letter:['S','A'],em:['EM+','EM']};
    const lowTiers={ali:['3.25'],letter:['D'],em:['MM-']};
    for(const ev of d.evaluations){
      const agent=cachedAgents.find(a=>a.agent_id===ev.agent_id);
      const isTop=(ratingTiers[ratingSystem]||[]).includes(ev.rating);
      const isLow=(lowTiers[ratingSystem]||[]).includes(ev.rating);
      const tier=isTop?'top':isLow?'low':'mid';
      h+='<div style="padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;margin-bottom:8px">';
      h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><span style="font-weight:600;font-size:13px">'+esc(agent?agent.name:ev.agent_id)+'</span><span class="eval-badge '+tier+'">'+esc(ev.rating)+'</span></div>';
      h+='<div style="font-size:12px;color:var(--text-dim)">'+esc(ev.comment)+'</div>';
      h+='<div style="font-size:10px;color:var(--text-dim);margin-top:4px;font-family:var(--font-mono)">任务: '+ev.trace_id+'</div>';
      h+='</div>';
    }
    h+='<div class="btn-group"><button class="btn btn-ghost" onclick="document.getElementById(\\'overlay\\').remove()">关闭</button></div>';
    fc.innerHTML=h;
  }catch(e){toast('网络错误: '+e.message,false);ov.remove()}
};

// ─── Task Detail Modal ──────────────────────
window.showTaskDetail=function(traceId){
  const t=allTasks.find(x=>x.trace_id===traceId);
  if(!t)return;
  const agent=cachedAgents.find(a=>a.agent_id===t.assignee_id);
  const agentName=agent?agent.name:t.assignee_id;
  const ov=document.createElement('div');ov.className='overlay';ov.id='overlay';
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove()});

  let h='<div class="form-card"><div class="task-detail-hd"><span class="task-detail-status '+t.status+'">'+t.status+'</span><span style="font-size:15px;font-weight:600">任务详情</span></div>';

  // Trace ID with copy
  h+='<div class="trace-copy-row"><span>'+t.trace_id+'</span><button onclick="navigator.clipboard.writeText(\\''+t.trace_id+'\\').then(()=>toast(\\'已复制\\',true))">复制</button></div>';

  // Info rows
  h+='<div class="detail-row"><div class="detail-label">指派节点</div><div class="detail-value">'+esc(agentName)+' <span style="color:var(--text-dim);font-family:var(--font-mono);font-size:11px">'+t.assignee_id+'</span></div></div>';
  h+='<div class="detail-row"><div class="detail-label">任务描述</div><div class="detail-value">'+esc(t.todo_description)+'</div></div>';
  h+='<div class="detail-row"><div class="detail-label">截止时间</div><div class="detail-value" style="font-family:var(--font-mono)">'+new Date(t.deadline).toLocaleString()+'</div></div>';

  if(t.status==='RESOLVED'&&t.result_data){
    // Show result + reject option (manager can reject after reviewing)
    let resultText='';
    if(typeof t.result_data==='object'&&t.result_data){resultText=t.result_data.text||JSON.stringify(t.result_data,null,2)}else{resultText=String(t.result_data||'')}
    h+='<div class="detail-row"><div class="detail-label">交付结果</div><div class="md-editor"><div class="result-display">'+esc(resultText)+'</div></div></div>';
    h+='<div class="btn-group"><button class="btn btn-danger btn-sm" onclick="taskReject(\\''+t.trace_id+'\\')">打回重做 (Reject)</button><button class="btn btn-ghost" onclick="document.getElementById(\\'overlay\\').remove()">关闭</button></div>';
  }else{
    // Input for resume (no reject for unsubmitted tasks)
    h+='<div class="fg" style="margin-top:16px"><label>提交 Human 交付物</label><div class="md-editor"><textarea id="td-payload" rows="4" placeholder="粘贴交付物内容、GitHub PR/Commit URL、工作汇报等..."></textarea><button class="md-expand-btn" onclick="toggleFullscreen(this)" title="展开/收起">&#x26F6;</button></div><div class="hint">支持贴 GitHub URL（PR、Commit、Issue），AI 审查时会分析</div></div>';
    h+='<div class="btn-group">';
    h+='<button class="btn btn-primary btn-sm" onclick="simulateDelivery(\\''+t.trace_id+'\\')">&#129302; 模拟交付</button>';
    h+='<button class="btn btn-green" onclick="taskResume(\\''+t.trace_id+'\\')">提交交付 (Resume)</button>';
    h+='<button class="btn btn-ghost" onclick="document.getElementById(\\'overlay\\').remove()">取消</button>';
    h+='</div>';
  }
  h+='</div>';
  ov.innerHTML=h;
  document.body.appendChild(ov);
};

window.taskResume=async function(traceId){
  const payload=document.getElementById('td-payload').value.trim();
  if(!payload){toast('请输入交付内容',false);return}
  try{
    const r=await fetch(API+'/tasks/resume',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({trace_id:traceId,result_data:{text:payload}})});
    const d=await r.json();
    if(!r.ok){toast(d.error||'提交失败',false);return}
    toast(d.job_complete?'任务已交付！Job 已全部完成，可以聚合同步。':'任务 '+traceId+' 已交付。',true);
    document.getElementById('overlay').remove();
    load('pipeline');
  }catch{toast('网络错误',false)}
};

window.taskReject=async function(traceId){
  if(!confirm('确定打回任务 '+traceId+'？截止时间将延长 24 小时。'))return;
  try{
    const r=await fetch(API+'/tasks/reject',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({trace_id:traceId})});
    const d=await r.json();
    if(!r.ok){toast(d.error||'操作失败',false);return}
    toast('任务 '+traceId+' 已打回，截止时间已延长 24 小时。',true);
    document.getElementById('overlay').remove();
    load('pipeline');
  }catch{toast('网络错误',false)}
};

window.simulateDelivery=async function(traceId){
  const btn=event.target;
  const origText=btn.innerHTML;
  btn.disabled=true;btn.innerHTML='&#8987; AI 生成中...';
  try{
    const r=await fetch(API+'/tasks/simulate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({trace_id:traceId})});
    const d=await r.json();
    if(!r.ok){toast(d.error||'模拟失败',false);btn.disabled=false;btn.innerHTML=origText;return}
    const ta=document.getElementById('td-payload');
    if(ta)ta.value=d.simulated_delivery;
    toast('已生成模拟交付内容',true);
    btn.disabled=false;btn.innerHTML=origText;
  }catch(e){toast('网络错误: '+e.message,false);btn.disabled=false;btn.innerHTML=origText}
};

// ═══════════════════════════════════════════════
// TERMINAL
// ═══════════════════════════════════════════════
function loadTerminal(el){
  el.innerHTML='<div class="section-hd"><h2>I/O 交付终端</h2></div>'
    +'<div class="form-card" style="margin-top:12px"><h3>> 提交碳基节点产出</h3>'
    +'<div class="fg"><label>Trace ID (追踪码)</label><input id="t-tid" placeholder="例: TK-9527"/></div>'
    +'<div class="fg"><label>交付载荷</label><div class="md-editor"><textarea id="t-payload" placeholder="粘贴交付物内容、GitHub PR/Commit URL、工作汇报等..."></textarea><button class="md-expand-btn" onclick="toggleFullscreen(this)" title="展开/收起">&#x26F6;</button></div><div class="hint">支持贴 GitHub URL（PR、Commit、Issue），AI 审查时会分析</div></div>'
    +'<div class="btn-group"><button class="btn btn-primary" onclick="doResume()">提交并恢复 (Resume)</button><button class="btn btn-danger" onclick="doReject()">打回重做 (Reject)</button></div></div>';
}
window.doResume=async function(){
  const tid=document.getElementById('t-tid').value.trim();
  const payload=document.getElementById('t-payload').value.trim();
  if(!tid){toast('请输入 Trace ID',false);return}
  if(!payload){toast('请输入交付载荷',false);return}
  try{
    const r=await fetch(API+'/tasks/resume',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({trace_id:tid,result_data:{text:payload}})});
    const d=await r.json();
    if(!r.ok){toast(d.error||'提交失败',false);return}
    toast(d.job_complete?'任务已交付！Job 已全部完成，可以聚合同步。':'任务 '+tid+' 已交付。',true);
    document.getElementById('t-tid').value='';document.getElementById('t-payload').value='';
  }catch{toast('网络错误',false)}
};
window.doReject=async function(){
  const tid=document.getElementById('t-tid').value.trim();
  if(!tid){toast('请输入 Trace ID',false);return}
  try{
    const r=await fetch(API+'/tasks/reject',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({trace_id:tid})});
    const d=await r.json();
    if(!r.ok){toast(d.error||'操作失败',false);return}
    toast('任务 '+tid+' 已打回，截止时间已延长 24 小时。',true);
    document.getElementById('t-tid').value='';document.getElementById('t-payload').value='';
  }catch{toast('网络错误',false)}
};

// ═══════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════
window.showSettings=async function(){
  const ov=document.createElement('div');ov.className='overlay';ov.id='overlay';
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove()});
  ov.innerHTML='<div class="form-card"><h3>LLM 设置</h3><div class="spinner-wrap"><div class="spinner"></div></div></div>';
  document.body.appendChild(ov);

  try{
    const r=await fetch(API+'/config');
    const cfg=await r.json();
    const fc=ov.querySelector('.form-card');
    let statusHtml='';
    if(cfg.api_key_set){
      const src=cfg.api_key_source==='dashboard'?'Dashboard 配置':'环境变量';
      statusHtml='<div style="background:var(--accent-dim);border:1px solid color-mix(in srgb,var(--accent) 25%,transparent);border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:12px"><span style="color:var(--green)">&#10003;</span> API Key 已配置 <span style="color:var(--text-dim)">('+esc(cfg.api_key_masked)+' | 来源: '+src+')</span></div>';
    }else{
      statusHtml='<div style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:12px;color:var(--red)">&#9888; 未配置 API Key，AI 规划功能不可用</div>';
    }
    fc.innerHTML='<h3>LLM 设置</h3>'+statusHtml
      +'<div class="fg"><label>API 格式</label><select id="cfg-provider"><option value="anthropic"'+(cfg.provider==='anthropic'||cfg.provider==='claude'?' selected':'')+'>Anthropic Messages API</option><option value="openai"'+(cfg.provider==='openai'?' selected':'')+'>OpenAI Chat Completions API</option><option value="responses"'+(cfg.provider==='responses'?' selected':'')+'>OpenAI Responses API</option></select><div class="hint">选择 API 格式。自定义 Base URL 可连接任何兼容服务。</div></div>'
      +'<div class="fg"><label>API Key</label><input id="cfg-key" type="password" placeholder="'+(cfg.api_key_set?'已配置，留空则不修改':'输入你的 API Key...')+'"/><div class="hint">Anthropic: sk-ant-... | OpenAI: sk-...</div></div>'
      +'<div class="fg"><label>模型 <span style="color:var(--text-dim);font-weight:400">(可选，留空用默认)</span></label><input id="cfg-model" value="'+esc(cfg.model||'')+'" placeholder="例: claude-sonnet-4-20250514 / gpt-4o"/></div>'
      +'<div class="fg"><label>API Base URL <span style="color:var(--text-dim);font-weight:400">(可选，留空用官方地址)</span></label><input id="cfg-baseurl" value="'+esc(cfg.base_url||'')+'" placeholder="例: https://your-proxy.com"/><div class="hint">私有部署: 填写你的模型服务地址，如 vLLM / Ollama / Azure 等</div></div>'
      +'<div class="btn-group"><button class="btn btn-primary" onclick="saveSettings()">保存</button><button class="btn btn-ghost" onclick="document.getElementById(\\'overlay\\').remove()">取消</button></div>';
  }catch{
    ov.querySelector('.form-card').innerHTML='<h3>LLM 设置</h3><p style="color:var(--red)">加载配置失败</p>';
  }
};
window.saveSettings=async function(){
  const provider=document.getElementById('cfg-provider').value;
  const apiKey=document.getElementById('cfg-key').value.trim();
  const model=document.getElementById('cfg-model').value.trim();
  const baseUrl=document.getElementById('cfg-baseurl').value.trim();
  const body={provider};
  if(apiKey)body.api_key=apiKey;
  body.model=model;
  body.base_url=baseUrl;
  try{
    const r=await fetch(API+'/config',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!r.ok){const d=await r.json();toast(d.error||'保存失败',false);return}
    toast('设置已保存',true);
    document.getElementById('overlay').remove();
  }catch{toast('网络错误',false)}
};

// ═══════════════════════════════════════════════
// TABS & INIT
// ═══════════════════════════════════════════════
const tabs=document.querySelectorAll('.tab');
const panels=document.querySelectorAll('.panel');
function load(id){
  const el=document.getElementById(id);
  if(id==='fleet')loadFleet(el);
  else if(id==='pipeline')loadPipeline(el);
  else if(id==='terminal')loadTerminal(el);
}
tabs.forEach(t=>t.addEventListener('click',()=>{
  tabs.forEach(x=>x.classList.remove('active'));
  panels.forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  const id=t.dataset.panel;
  document.getElementById(id).classList.add('active');
  load(id);
}));
load('fleet');
setInterval(()=>{
  const a=document.querySelector('.tab.active');
  if(a&&a.dataset.panel!=='terminal')load(a.dataset.panel);
},15000);
</script>
</body>
</html>`;
}
