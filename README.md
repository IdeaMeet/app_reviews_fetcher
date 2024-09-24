# App Reviews

这是一个用于查询和展示 Apple App 评论的项目，使用 Node.js 后端和 Vercel 部署。

## 功能

- 通过 Apple 提供的 RSS Feed 接口获取 App 的评论。
- 在网页上输入 App ID 并查看评论列表。
- 支持不同国家和地区的评论。
- 一键下载当前页面的评论为 Excel 表格。

## 部署

1. **克隆仓库**：

    ```bash
    git clone https://github.com/yourusername/app-reviews.git
    cd app-reviews
    ```

2. **安装依赖**：

    ```bash
    npm install
    ```

3. **部署到 Vercel**：

    登录 Vercel 并导入 GitHub 仓库，按照提示完成部署。

## 使用

访问部署后的 URL，输入有效的 `App ID`，选择国家/地区，设置评论数量和排序方式，点击 “获取评论” 即可查看评论列表。点击 “下载为 Excel” 按钮，可以将当前页面的评论下载为 Excel 文件。

---