#!/bin/bash
# HumanClaw Demo: 互联网大厂 - 你是技术总监，管理一个全栈团队
# Usage: ./demo/tech-company.sh [server_url]

BASE_URL="${1:-http://localhost:2026}"
API="$BASE_URL/api/v1"

echo ""
echo "═══════════════════════════════════════════════"
echo "  💻 互联网大厂 · 碳基节点编排 Demo"
echo "  你是技术总监，以下是你的核心团队"
echo "═══════════════════════════════════════════════"
echo ""

declare -a NAMES=("前端老李" "后端大王" "算法小陈" "产品经理 Amy" "设计师小林" "测试负责人老赵" "运维 DevOps 阿杰")
declare -a CAPS=(
  '["React","TypeScript","Next.js","移动端适配","性能优化"]'
  '["Java","Go","微服务","数据库设计","高并发架构"]'
  '["机器学习","推荐系统","NLP","Python","数据分析"]'
  '["需求分析","用户调研","PRD撰写","项目管理","数据驱动"]'
  '["UI设计","交互设计","Figma","设计系统","用户体验"]'
  '["自动化测试","性能测试","安全测试","测试用例设计","CI集成"]'
  '["Kubernetes","Docker","CI/CD","监控告警","云原生架构"]'
)
declare -a RELS=(
  "P7 前端 TL，跟了你三年，技术过硬但最近有点倦怠"
  "P8 后端架构师，技术大拿，说话直来直去"
  "P6 算法工程师，刚从学校毕业一年，潜力很大但经验不足"
  "P7 产品经理，业务感觉很好，跨部门沟通能力强"
  "P6 资深设计师，审美在线，偶尔和产品经理吵架"
  "P7 测试负责人，入职五年老员工，对质量要求极高"
  "P7 SRE，半夜被 oncall 叫起来过无数次，求稳派"
)

for i in "${!NAMES[@]}"; do
  echo "📌 注册节点: ${NAMES[$i]}"
  curl -s -X POST "$API/nodes" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"${NAMES[$i]}\",\"capabilities\":${CAPS[$i]},\"relationship\":\"${RELS[$i]}\"}" | python3 -c "import sys,json;d=json.load(sys.stdin);print('   ✅ '+d.get('agent_id',''))" 2>/dev/null || echo "   ❌ 注册失败"
done

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✅ 大厂团队就位！打开 Dashboard 开始编排："
echo "  $BASE_URL"
echo ""
echo "  💡 试试输入需求："
echo "  \"上线一个 AI 智能客服系统，包括前端界面、后端 API、"
echo "   推荐算法、压力测试和灰度发布方案\""
echo "═══════════════════════════════════════════════"
echo ""
