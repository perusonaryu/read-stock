#!/bin/bash
# PWAをリビルドするスクリプト

echo "🔨 PWAをリビルドしています..."
npm run build
echo "✨ ビルド完了！"

echo "🚀 プレビューサーバーを起動しています..."
npm run preview 