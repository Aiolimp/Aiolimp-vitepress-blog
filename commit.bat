@echo off
chcp 65001 >nul
echo 🚀 开始自动提交和推送...

REM 检查是否有未提交的更改
git status --porcelain >nul 2>&1
if %errorlevel% neq 0 (
    echo ✅ 没有需要提交的更改
    pause
    exit /b 0
)

REM 添加所有更改
echo 📁 添加所有更改...
git add .

REM 提交更改
echo 💾 提交更改...
git commit -m ":memo: update docs"

REM 检查提交是否成功
if %errorlevel% equ 0 (
    echo ✅ 提交成功
    
    REM 推送到远程仓库
    echo 🚀 推送到远程仓库...
    git push
    
    if %errorlevel% equ 0 (
        echo ✅ 推送成功！
        echo 🎉 所有操作完成
    ) else (
        echo ❌ 推送失败
        pause
        exit /b 1
    )
) else (
    echo ❌ 提交失败
    pause
    exit /b 1
)

pause
