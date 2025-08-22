#!/bin/bash

# 自动提交和推送脚本
# 使用方法: ./commit.sh

echo "🚀 开始自动提交和推送..."

# 检查是否有未提交的更改
if [[ -z $(git status --porcelain) ]]; then
    echo "✅ 没有需要提交的更改"
    exit 0
fi

# 添加所有更改
echo "📁 添加所有更改..."
git add .

# 提交更改
echo "💾 提交更改..."
git commit -m ":memo: update docs"

# 检查提交是否成功
if [ $? -eq 0 ]; then
    echo "✅ 提交成功"
    
    # 推送到远程仓库
    echo "🚀 推送到远程仓库..."
    git push
    
    if [ $? -eq 0 ]; then
        echo "✅ 推送成功！"
        echo "🎉 所有操作完成"
    else
        echo "❌ 推送失败"
        exit 1
    fi
else
    echo "❌ 提交失败"
    exit 1
fi