#!/bin/bash
# HumanClaw Demo: 三国蜀汉 - 你是刘备，管理蜀汉核心人才
# Usage: ./demo/sanguo.sh [server_url]

BASE_URL="${1:-http://localhost:2026}"
API="$BASE_URL/api/v1"

echo ""
echo "═══════════════════════════════════════════════"
echo "  🐉 三国蜀汉 · 碳基节点编排 Demo"
echo "  你是刘备，以下是你的核心班底"
echo "═══════════════════════════════════════════════"
echo ""

declare -a NAMES=("关羽" "张飞" "赵云" "诸葛亮" "庞统" "黄忠" "马超")
declare -a CAPS=(
  '["武艺","统兵","镇守要地","水军指挥"]'
  '["武艺","先锋突击","骑兵指挥","威慑敌军"]'
  '["武艺","护卫","骑兵突击","侦察敏捷"]'
  '["战略规划","内政治理","外交","发明创造","阵法"]'
  '["战略规划","奇谋","攻城战术","地形分析"]'
  '["武艺","弓箭","老当益壮","攻城战"]'
  '["武艺","骑兵","西凉作战","威慑羌族"]'
)
declare -a RELS=(
  "义弟，桃园结义二弟，最信任的兄弟和大将"
  "义弟，桃园结义三弟，性如烈火但忠心耿耿"
  "四弟级别的心腹爱将，长坂坡救阿斗"
  "三顾茅庐请来的军师，如鱼得水的关系"
  "凤雏，与诸葛亮齐名的军师，副军师中郎将"
  "老将军，定军山斩夏侯渊，五虎上将之一"
  "归降的西凉猛将，五虎上将之一"
)

for i in "${!NAMES[@]}"; do
  echo "📌 注册节点: ${NAMES[$i]}"
  curl -s -X POST "$API/nodes" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"${NAMES[$i]}\",\"capabilities\":${CAPS[$i]},\"relationship\":\"${RELS[$i]}\"}" | python3 -c "import sys,json;d=json.load(sys.stdin);print('   ✅ '+d.get('agent_id',''))" 2>/dev/null || echo "   ❌ 注册失败"
done

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✅ 蜀汉班底就位！打开 Dashboard 开始编排："
echo "  $BASE_URL"
echo ""
echo "  💡 试试输入需求："
echo "  \"北伐中原，兵分三路，需要攻城、断粮和外交三管齐下\""
echo "═══════════════════════════════════════════════"
echo ""
