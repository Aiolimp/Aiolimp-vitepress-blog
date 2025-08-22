#!/bin/bash

# 自动提交和推送脚本
# 使用方法: 
#   ./auto-commit.sh                    # 使用默认commit message
#   ./auto-commit.sh "自定义消息"       # 使用自定义commit message

# 默认的commit message
DEFAULT_COMMIT_MSG=":memo: update docs"

# 获取commit message，如果没有提供则使用默认值
COMMIT_MSG=${1:-$DEFAULT_COMMIT_MSG}

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查git仓库
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "当前目录不是git仓库"
        exit 1
    fi
}

# 检查是否有未提交的更改
check_changes() {
    if [[ -z $(git status --porcelain) ]]; then
        print_warning "没有需要提交的更改"
        return 1
    fi
    return 0
}

# 显示当前状态
show_status() {
    print_info "当前git状态:"
    git status --short
    echo
}

# 添加所有更改
add_changes() {
    print_info "添加所有更改..."
    git add .
    if [ $? -eq 0 ]; then
        print_success "添加成功"
    else
        print_error "添加失败"
        exit 1
    fi
}

# 提交更改
commit_changes() {
    print_info "提交更改..."
    print_info "Commit message: $COMMIT_MSG"
    
    git commit -m "$COMMIT_MSG"
    
    if [ $? -eq 0 ]; then
        print_success "提交成功"
        return 0
    else
        print_error "提交失败"
        return 1
    fi
}

# 推送到远程仓库
push_changes() {
    print_info "推送到远程仓库..."
    
    # 获取当前分支名
    CURRENT_BRANCH=$(git branch --show-current)
    print_info "当前分支: $CURRENT_BRANCH"
    
    git push origin "$CURRENT_BRANCH"
    
    if [ $? -eq 0 ]; then
        print_success "推送成功！"
        return 0
    else
        print_error "推送失败"
        return 1
    fi
}

# 主函数
main() {
    echo -e "${BLUE}🚀 自动提交和推送脚本${NC}"
    echo "=================================="
    
    # 检查git仓库
    check_git_repo
    
    # 检查是否有更改
    if ! check_changes; then
        exit 0
    fi
    
    # 显示状态
    show_status
    
    # 确认操作
    echo -n "是否继续提交和推送？(y/N): "
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_warning "操作已取消"
        exit 0
    fi
    
    # 执行操作
    add_changes
    if commit_changes; then
        if push_changes; then
            echo
            print_success "🎉 所有操作完成！"
            print_info "Commit: $COMMIT_MSG"
            print_info "分支: $(git branch --show-current)"
        fi
    fi
}

# 运行主函数
main "$@"
