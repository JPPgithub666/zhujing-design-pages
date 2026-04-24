# 筑境设计作品集网站 — EdgeOne Pages 部署上线指南

> 从零开始，手把手带你把项目部署到 EdgeOne Pages，全部免费。

---

## 📋 部署前准备

### 你需要的东西

| 项目 | 说明 | 获取方式 |
|------|------|---------|
| 腾讯云账号 | 用于登录 EdgeOne Pages 控制台 | https://cloud.tencent.com 注册 |
| GitHub 账号 | 用于托管代码（或 GitLab/Gitee） | https://github.com 注册 |
| DeepSeek API Key | AI 客服功能需要（可选） | https://platform.deepseek.com 注册后获取 |
| Node.js 18+ | 安装 EdgeOne CLI 用（可选） | https://nodejs.org |

### 项目文件结构（确保这些文件都在）

```
zhujing-design-pages/
├── index.html                       # 前端页面
├── edge-functions/
│   └── api/
│       ├── contact/submit.js        # 表单提交 → KV 存储
│       ├── stats/visit.js           # 访问统计 → KV 计数
│       └── ai/chat.js               # AI 智能客服 → 大模型对话
├── .gitignore                       # Git 忽略规则
├── DEPLOY-GUIDE.md                  # 本文件
└── README.md
```

---

## 方案一：Git 仓库部署（推荐，支持自动更新）

> 适合有 GitHub 使用经验的用户，代码推送后自动部署。

### 第一步：把代码推到 GitHub

```bash
# 1. 进入项目目录
cd zhujing-design-pages

# 2. 初始化 Git 仓库（如果还没有）
git init

# 3. 创建 .gitignore
```

在项目根目录创建 `.gitignore` 文件，内容如下：

```
.edgeone/
node_modules/
.env
```

```bash
# 4. 添加所有文件
git add .

# 5. 首次提交
git commit -m "feat: 筑境设计作品集网站 - EdgeOne Pages 全栈版"

# 6. 在 GitHub 上创建仓库，然后关联
git remote add origin https://github.com/你的用户名/zhujing-design.git

# 7. 推送代码
git branch -M main
git push -u origin main
```

### 第二步：创建 EdgeOne Pages 项目

1. 打开 [EdgeOne Pages 控制台](https://console.cloud.tencent.com/edgeone/pages)
2. 首次使用点击 **「立即开通」**
3. 点击 **「导入 Git 仓库」** 或 **「从模板创建」** → 选择 **「导入 GitHub」**
4. 授权 GitHub 访问权限
5. 选择你刚推送的 `zhujing-design` 仓库

### 第三步：配置构建设置

| 配置项 | 填写内容 |
|--------|---------|
| **构建命令** | 留空（纯静态站点，不需要构建） |
| **输出目录** | `.`（根目录）或 `/` |
| **加速区域** | 选择「中国大陆」或「全球」 |

点击 **「开始部署」**，等待构建完成。部署成功后会分配一个 `xxx.edgeone.app` 域名。

✅ **此时你的静态网站已经上线了！** 可以访问域名查看效果。

---

## 第四步：创建 KV 命名空间

> KV 用于存储表单数据和访问计数，必须绑定后 Edge Functions 才能读写数据。

1. 进入 [EdgeOne Pages KV 控制台](https://console.cloud.tencent.com/edgeone/pages?tab=kv)
2. 如果是首次使用，点击 **「申请」** KV 存储
3. 申请通过后，点击 **「新建命名空间」**
4. 命名空间名称填写：`contact_kv`
5. 点击创建

### 绑定 KV 到项目

1. 进入刚创建的 `contact_kv` 命名空间
2. 点击 **「关联项目」**
3. **变量名** 填写：`contact_kv`（和代码里 `env.contact_kv` 对应）
4. **关联项目** 选择你的 `zhujing-design` 项目
5. 点击确定

> 💡 也可以通过：Pages 控制台 → 项目设置 → KV存储 → 绑定命名空间

---

## 第五步：配置环境变量

> AI 客服需要调用大模型 API，通过环境变量传入密钥。

### 获取 API Key（可选，不配也能跑）

**推荐用 DeepSeek**（便宜，兼容 OpenAI 格式）：
1. 注册 [DeepSeek 开放平台](https://platform.deepseek.com)
2. 进入 API Keys 页面，创建一个 Key
3. 复制保存（只显示一次）

### 设置环境变量

1. 进入 Pages 控制台 → 你的项目 → **「设置」** → **「环境变量」**
2. 添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `AI_API_KEY` | `sk-xxxxxxxxxxxxxxxx` | 你的 DeepSeek API Key |
| `AI_MODEL` | `deepseek-chat` | 使用的模型名称 |
| `AI_BASE_URL` | `https://api.deepseek.com/v1` | API 基础地址 |

3. 保存后，**重新触发一次部署**让环境变量生效

> 💡 不配置这些变量，AI 客服会降级提示"服务暂时不可用"，其他功能不受影响。

---

## 第六步：验证部署

部署完成后，检查以下功能：

### ✅ 静态页面
- 访问 `https://你的域名.edgeone.app`
- 检查页面是否正常显示（导航、Hero、作品集等）

### ✅ 表单提交
1. 滚动到「联系我们」区域
2. 填写表单并提交
3. 应该显示 Toast 提示"咨询提交成功"
4. 回到 KV 控制台 → `contact_kv` → 查看 key-value 数据，应该能看到新记录

### ✅ 访客统计
- 页面左下角应显示"xxx 次访问 · xx 人在线"
- 刷新页面，数字应递增

### ✅ AI 客服（需配置 API Key）
1. 点击右下角金色聊天气泡
2. 输入问题或点击快捷按钮
3. 应该能收到 AI 流式回复

---

## 方案二：CLI 直接部署（无需 GitHub）

> 适合不想用 Git 的用户，一条命令直接上传。

### 安装 EdgeOne CLI

```bash
npm install -g edgeone
```

### 登录

```bash
edgeone login
# 选择 China（国内站）
# 浏览器会弹出登录页面，用腾讯云账号登录授权
```

### 关联项目

```bash
cd zhujing-design-pages
edgeone pages link
# 输入项目名称，如 zhujing-design
```

### 本地预览（可选）

```bash
edgeone pages dev
# 访问 http://localhost:8088 查看
# 包括 Edge Functions 和 KV 都能本地调试
```

### 部署上线

```bash
edgeone pages deploy . -n zhujing-design
```

部署成功后控制台会输出访问地址。

---

## 自定义域名（可选）

1. 进入 Pages 控制台 → 你的项目 → **「设置」** → **「域名」**
2. 点击 **「添加域名」**
3. 输入你的域名（如 `www.zhujing-design.com`）
4. 按提示在域名 DNS 中添加 CNAME 记录，指向 EdgeOne 提供的目标地址
5. 如果域名已备案，选择中国大陆加速区域即可

---

## 常见问题

### Q: 部署后 Edge Functions 返回 500 错误？
**A:** 检查 KV 命名空间是否已创建并绑定到项目。变量名必须和代码中的 `env.contact_kv` 一致。

### Q: AI 客服提示"服务暂时不可用"？
**A:** 检查环境变量是否配置正确（`AI_API_KEY`、`AI_MODEL`、`AI_BASE_URL`），配置后需要重新部署一次。

### Q: 没有配 DeepSeek，能用其他模型吗？
**A:** 可以。`ai/chat.js` 支持任何兼容 OpenAI API 格式的模型，比如：
- 智谱 GLM：`AI_BASE_URL=https://open.bigmodel.cn/api/paas/v4`，`AI_MODEL=glm-4-flash`
- 月之暗面：`AI_BASE_URL=https://api.moonshot.cn/v1`，`AI_MODEL=moonshot-v1-8k`

### Q: 免费额度够用吗？
**A:** 免费版包含：每月 300 万次边缘函数请求 + 1GB KV 存储 + 不限 CDN 流量。个人项目绰绰有余。

### Q: 如何更新代码？
**A:** 如果是 Git 部署，直接 `git push` 即可自动重新部署。如果是 CLI 部署，再执行一次 `edgeone pages deploy .`。

### Q: 如何查看 KV 中存储的表单数据？
**A:** 进入 [KV 控制台](https://console.cloud.tencent.com/edgeone/pages?tab=kv) → `contact_kv` → 点击 key 查看内容。表单数据以 `contact:时间戳` 为 key 存储。

---

## 费用说明

| 项目 | 费用 |
|------|------|
| EdgeOne Pages 静态托管 | 免费（不限流量） |
| Edge Functions | 免费（300 万次/月） |
| KV 存储 | 免费（1GB） |
| 自定义域名 HTTPS | 免费 |
| DeepSeek API | 按量计费，约 ¥1/百万 token |
| **总计** | **基本 ¥0**（AI 客服用得越多才有少量 API 费用） |
