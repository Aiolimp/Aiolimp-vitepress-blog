---
title: 002-前端 Git 操作记录：撤销误合并 fast-forward 分支
theme: solarized-dark
---

# **前端 Git 操作记录：撤销误合并 fast-forward 分支**

## **1. 场景描述**

- 分支 `verify-V2.4.0-0620` 用于发布验证。
- 分支 `feature-V2.5.0-0701` 用于功能开发。
- 在 VSCode Git 面板中，误操作：切换到 `verify-V2.4.0-0620` → 点击 **合并分支 → 选择 feature-V2.5.0-0701 → 提交**。
- 结果：
  - verify-V2.4.0-0620 已包含 feature 的所有代码。
  - 合并方式是 `fast-forward`，因此没有生成 merge commit。
  - 错误提交已 push 到远程。

## **2. 问题分析**

- Fast-forward 合并特点：
  - 如果目标分支落后于源分支且没有分叉，Git 直接移动指针到源分支最新 commit。
  - **不会生成 merge commit**，所以 git log --merges 看不到任何记录。
- 误合并原因：
  - VSCode 默认合并方式是 fast-forward，如果分支可快进，会直接移动 verify 分支指针。

## **3. 确认误合并的 commit**

### **3.1 查看分支历史记录**

```shell
git log --oneline --graph --decorate
```

或只看 reflog：

```shell
git reflog verify-V2.4.0-0620
```

输出示例：

```shell
b300bbc0e verify-V2.4.0-0620@{0}: merge feature-V2.5.0-0701: Fast-forward
5271c8a3a verify-V2.4.0-0620@{1}: merge feature-V2.4.0-0603: Merge made by the 'ort' strategy
```

- b300bbc0e：误合并 commit（fast-forward）
- 5271c8a3a：合并前 verify 分支最后 commit（要回退到此状态）

## **4. 撤销误合并步骤**

### **4.1 切换到 verify 分支**

```shell
git checkout verify-V2.4.0-0620
```

### **4.2 回退到合并前的 commit**

```shell
git reset --hard 5271c8a3a
```

- --hard 会同时回退工作区和分支指针。

### **4.3 推送到远程覆盖错误提交**

```shell
git push -f origin verify-V2.4.0-0620
```

- `-f`：强制推送，因为远程有错误提交。
- ⚠️ 注意：如果其他人基于远程 verify 分支开发，先沟通，避免覆盖别人的工作。

## **5. 注意事项**

1. **区分 fast-forward 与普通 merge**
   - fast-forward 不会生成 merge commit。
   - 普通 merge 或 squash merge 会生成 commit，可以用 git revert 撤销。
2. **强推风险**
   - 如果其他开发者基于 verify 分支开发，git push -f 会覆盖他们的提交。
3. **养成习惯**
   - 合并前确认分支是否允许 fast-forward。
   - 对重要分支操作建议使用命令行或者先在本地 test。
4. **快速定位 commit**
   - 使用 `git reflog <branch>` 可以找到分支指针历史，尤其是 fast-forward 合并之后。

## **6. 总结**

通过本次操作，成功将误合并的 `fast-forward commit` 撤回，使 verify-V2.4.0-0620 回到合并前状态。

以后遇到 fast-forward 合并误操作，可参考以上流程：

1. 用 `git reflog` 找到合并前 commit
2. `git reset --hard <commit_id>` 回退本地分支
3. `git push -f` 同步远程
