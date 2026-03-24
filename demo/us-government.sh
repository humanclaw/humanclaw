#!/bin/bash
# HumanClaw Demo: 美国政府 - 你是特朗普，管理你的核心内阁
# Usage: ./demo/us-government.sh [server_url]

BASE_URL="${1:-http://localhost:2026}"
API="$BASE_URL/api/v1"

echo ""
echo "═══════════════════════════════════════════════"
echo "  🇺🇸 United States Government · Demo"
echo "  You are Donald J. Trump, 47th POTUS"
echo "  Make the executive branch great again!"
echo "═══════════════════════════════════════════════"
echo ""

declare -a NAMES=("Elon Musk" "Marco Rubio" "Pete Hegseth" "Scott Bessent" "Kristi Noem" "Tulsi Gabbard" "Robert F. Kennedy Jr.")
declare -a CAPS=(
  '["政府效率","成本削减","科技创新","SpaceX","Tesla","裁员优化","社交媒体"]'
  '["外交政策","拉美事务","国际谈判","制裁政策","国家安全"]'
  '["国防战略","军事改革","退伍军人事务","军费预算","作战指挥"]'
  '["经济政策","金融市场","税收改革","债务管理","贸易政策"]'
  '["国土安全","边境管控","移民执法","反恐","网络安全"]'
  '["国家情报","情报分析","反间谍","网络战","安全评估"]'
  '["公共卫生","疫苗政策","食品安全","药品监管","医疗改革"]'
)
declare -a RELS=(
  "DOGE 负责人，世界首富，Twitter/X 老板，最具影响力的盟友"
  "国务卿，佛罗里达参议员，曾经的竞选对手变忠实支持者"
  "国防部长，前 Fox News 主持人，坚定的 MAGA 支持者"
  "财政部长，华尔街老将，关键经济顾问"
  "国土安全部长，前南达科他州长，边境强硬派"
  "国家情报总监，前民主党国会议员，转投共和党的盟友"
  "卫生与公众服务部长，反建制派，疫苗怀疑论者"
)

for i in "${!NAMES[@]}"; do
  echo "📌 Registering: ${NAMES[$i]}"
  curl -s -X POST "$API/nodes" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"${NAMES[$i]}\",\"capabilities\":${CAPS[$i]},\"relationship\":\"${RELS[$i]}\"}" | python3 -c "import sys,json;d=json.load(sys.stdin);print('   ✅ '+d.get('agent_id',''))" 2>/dev/null || echo "   ❌ Registration failed"
done

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✅ Cabinet assembled! Open the Dashboard:"
echo "  $BASE_URL"
echo ""
echo "  💡 Try this prompt:"
echo "  \"制定一个让美国制造业回流的综合计划，需要关税政策、"
echo "   减税方案、能源保障、边境安全配合和政府效率优化\""
echo "═══════════════════════════════════════════════"
echo ""
