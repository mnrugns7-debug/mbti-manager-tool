#!/bin/bash
# MBTI マネジメント会話支援ツール 起動スクリプト

ROOT="$(cd "$(dirname "$0")" && pwd)"

# APIキーチェック
if grep -q "your_api_key_here" "$ROOT/backend/.env" 2>/dev/null; then
  echo "❌ エラー: backend/.env に ANTHROPIC_API_KEY を設定してください"
  echo "   取得先: https://console.anthropic.com/"
  exit 1
fi

echo "🚀 バックエンドを起動中..."
cd "$ROOT/backend" && export $(grep -v '^#' .env | xargs) && node server.js &
BACKEND_PID=$!

sleep 1

echo "🚀 フロントエンドを起動中..."
cd "$ROOT/frontend" && npm run dev -- --port 5173 &
FRONTEND_PID=$!

echo ""
echo "✅ 起動完了!"
echo "   ブラウザで http://localhost:5173 を開いてください"
echo ""
echo "停止するには Ctrl+C を押してください"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'サーバーを停止しました'" EXIT
wait
