# GitHub 整合說明文件

## 📦 儲存庫資訊

- **GitHub 網址**：https://github.com/iam26phi/26phi-portfolio
- **帳號**：iam26phi
- **儲存庫名稱**：26phi-portfolio
- **可見性**：公開 (Public)
- **主分支**：main

## 🔄 自動同步機制

### 運作方式
本專案已設定 Git post-commit hook，實現自動同步到 GitHub：

1. **觸發時機**：每次執行 `git commit` 後
2. **自動執行**：`git push github main`
3. **結果顯示**：終端機會顯示推送狀態

### 在 Manus 平台上的運作
當您在 Manus 平台上進行以下操作時，程式碼會自動同步到 GitHub：
- ✅ 儲存 checkpoint（使用 `webdev_save_checkpoint`）
- ✅ 任何會產生 git commit 的操作

### 手動推送
如果需要手動推送到 GitHub：
```bash
git push github main
```

## 🛠 技術細節

### Git Remote 設定
本專案有兩個 remote：
- **origin**：Manus 內部儲存庫（S3）
- **github**：GitHub 儲存庫

```bash
# 查看 remote 設定
git remote -v

# 輸出：
# github  https://github.com/iam26phi/26phi-portfolio.git (fetch)
# github  https://github.com/iam26phi/26phi-portfolio.git (push)
# origin  s3://vida-prod-gitrepo/... (fetch)
# origin  s3://vida-prod-gitrepo/... (push)
```

### Post-Commit Hook
位置：`.git/hooks/post-commit`

功能：
- 自動執行 `git push github main`
- 顯示推送進度和結果
- 失敗時顯示警告但不中斷 commit

## 📝 使用指南

### 查看 GitHub 上的程式碼
1. 訪問 https://github.com/iam26phi/26phi-portfolio
2. 查看最新的 commits、程式碼和檔案

### 驗證同步狀態
```bash
# 查看本地和遠端的同步狀態
git log --oneline -5

# 查看 GitHub remote 狀態
git remote show github
```

### 解決同步問題
如果自動推送失敗：
1. 檢查網路連線
2. 手動執行 `git push github main`
3. 查看錯誤訊息並解決

## ⚠️ 注意事項

### 大型檔案警告
GitHub 檢測到以下大型檔案（超過 50MB）：
- `client/public/images/hero-bg-real.jpg` (60.58 MB)
- `client/public/images/portfolio/portrait/KILLER_劇照_10.jpg` (68.99 MB)

**建議**：
- 未來考慮使用 Git LFS (Large File Storage) 管理大型圖片
- 或將圖片遷移到 S3 儲存，僅在 Git 中保存 URL 參考

### 敏感資訊
- ✅ `.env` 檔案已在 `.gitignore` 中
- ✅ 環境變數不會被推送到 GitHub
- ✅ 資料庫憑證和 API 金鑰安全

## 🔗 相關連結

- **GitHub 儲存庫**：https://github.com/iam26phi/26phi-portfolio
- **GitHub CLI 文件**：https://cli.github.com/
- **Git Hooks 文件**：https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks

## 📊 同步歷史

### 初始推送
- **日期**：2026-01-02
- **Commit 數量**：1331 個物件
- **大小**：389.14 MiB
- **狀態**：✅ 成功

### 後續同步
所有後續的 commits 都會自動同步到 GitHub，無需手動操作。

---

最後更新：2026-01-02 14:00 GMT+8
