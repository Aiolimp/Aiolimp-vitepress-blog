# Git 自动提交脚本使用指南

本项目提供了多个自动提交和推送的脚本，方便快速提交代码更改。

## 🚀 脚本列表

### 1. `commit.sh` - 基础自动提交脚本

- **功能**: 自动添加、提交和推送所有更改
- **Commit Message**: `:memo: update docs`
- **特点**: 简单快速，无确认提示

**使用方法**:

```bash
# 方法1: 直接执行
./commit.sh

# 方法2: 通过 npm 脚本
pnpm run commit
```

### 2. `auto-commit.sh` - 智能自动提交脚本 ⭐ 推荐

- **功能**: 智能检查、确认提示、错误处理
- **Commit Message**: 可自定义，默认 `:memo: update docs`
- **特点**: 带颜色输出、状态检查、用户确认

**使用方法**:

```bash
# 使用默认 commit message
./auto-commit.sh

# 使用自定义 commit message
./auto-commit.sh "feat: 添加新功能"

# 通过 npm 脚本
pnpm run commit:auto
```

### 3. `commit.bat` - Windows 批处理脚本

- **功能**: Windows 用户的自动提交脚本
- **Commit Message**: `:memo: update docs`
- **特点**: 支持中文显示，适合 Windows 环境

**使用方法**:

```cmd
# 直接双击执行
commit.bat

# 通过 npm 脚本
pnpm run commit:win
```

## 📋 使用步骤

### 准备工作

1. 确保脚本有执行权限（macOS/Linux）:

   ```bash
   chmod +x commit.sh
   chmod +x auto-commit.sh
   ```

2. 确保已配置 git 用户信息:
   ```bash
   git config --global user.name "你的用户名"
   git config --global user.email "你的邮箱"
   ```

### 执行脚本

1. **简单快速提交**:

   ```bash
   pnpm run commit
   ```

2. **智能提交（推荐）**:

   ```bash
   pnpm run commit:auto
   ```

3. **Windows 用户**:
   ```cmd
   pnpm run commit:win
   ```

## 🔧 脚本特性

### `auto-commit.sh` 高级特性

- ✅ 自动检查 git 仓库状态
- ✅ 显示当前更改状态
- ✅ 用户确认提示
- ✅ 彩色输出和表情符号
- ✅ 错误处理和状态检查
- ✅ 支持自定义 commit message
- ✅ 自动检测当前分支

### 安全特性

- 检查是否有未提交的更改
- 提交前显示 git 状态
- 用户确认后才执行操作
- 详细的错误提示

## 📝 Commit Message 格式

默认格式: `:memo: update docs`

你也可以使用其他 emoji 格式:

- `:rocket: deploy` - 部署
- `:bug: fix bug` - 修复 bug
- `:sparkles: new feature` - 新功能
- `:memo: update docs` - 更新文档
- `:art: improve style` - 改进样式

## 🚨 注意事项

1. **备份重要更改**: 执行脚本前请确保重要更改已备份
2. **检查分支**: 确保在正确的分支上执行
3. **网络连接**: 推送需要稳定的网络连接
4. **权限问题**: 确保有推送权限

## 🆘 故障排除

### 常见问题

1. **权限被拒绝**:

   ```bash
   chmod +x commit.sh
   chmod +x auto-commit.sh
   ```

2. **脚本无法执行**:

   ```bash
   # 检查文件格式
   file commit.sh

   # 如果是 Windows 格式，转换
   dos2unix commit.sh
   ```

3. **推送失败**:

   - 检查网络连接
   - 确认远程仓库配置
   - 检查推送权限

4. **中文显示问题**:
   - 确保终端支持 UTF-8
   - 使用 `auto-commit.sh` 脚本

## 📚 相关链接

- [Git 官方文档](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Emoji 指南](https://gitmoji.dev/)

---

💡 **提示**: 推荐使用 `auto-commit.sh` 脚本，它提供了最好的用户体验和安全性。
