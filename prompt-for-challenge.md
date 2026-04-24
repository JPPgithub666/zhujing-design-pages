# EdgeOne Pages 挑战赛提示词 v3（全栈增强版）

> 融入 EdgeOne Pages Functions、KV 存储、边缘 AI 集成，展示平台全栈能力。

---

## 提示词正文

```
请为一个城市规划与建筑设计研究院（筑境设计）创建一个全栈作品集网站，部署在 EdgeOne Pages 平台上。

## 网站定位
这是一家成立20年的综合性设计研究机构，总部位于上海，在北京、深圳、成都设有分公司。设计理念是"筑以载道，境由人心"，致力于用设计重塑城市空间。网站需要传达出专业、高端、国际化的事务所气质。

## 项目结构
```
zhujing-design-pages/
├── index.html                      # 前端页面（单文件 SPA）
├── edge-functions/                 # EdgeOne Pages 边缘函数
│   └── api/
│       ├── contact/submit.js       # 表单提交 → KV 存储
│       ├── stats/visit.js          # 访问统计 → KV 计数
│       └── ai/chat.js              # AI 智能客服 → 大模型流式对话
└── README.md
```

## 视觉风格
- 整体采用暗色系设计（主背景 #0a0a0a，次背景 #141414，卡片 #1a1a1a），搭配香槟金色（#c8a87c 及其浅色 #e0c9a6、深色 #9a7d5a）作为点缀色
- 使用衬线字体（Noto Serif SC）做标题，无衬线字体（Noto Sans SC）做正文
- 所有颜色、字体、间距通过 CSS 自定义属性（:root）统一管理
- favicon 使用 SVG emoji 格式内联

## EdgeOne Pages 产品能力（核心评分项）

### 1. Edge Functions（边缘函数）— 3个API接口

#### ① 表单提交接口 POST /api/contact/submit
- 接收联系表单数据（姓名、公司、邮箱、电话、需求描述）
- 服务端验证必填字段和邮箱格式
- 数据存入 KV 存储（key 格式: messages/YYYY/MM/DD/msg_timestamp_random）
- KV 中同时维护 total_submissions 总提交计数
- 返回 JSON 响应（success/message/id）
- 包含 CORS 预检处理（OPTIONS）
- KV 未绑定时降级为开发模式（console.log 记录）
- KV 绑定变量名: contact_kv

#### ② 访问统计接口 GET /api/stats/visit
- KV 中递增 visit_count 计数器
- 读取 total_submissions 提交总数
- 基于访问量估算在线人数
- 返回 visits / submissions / online 三个指标
- 响应头设置 Cache-Control: no-store（实时性）
- 前端在左下角显示"xxx 次访问 · xx 人在线"徽章
- KV 未绑定时返回演示模式标识

#### ③ AI 智能客服接口 POST /api/ai/chat
- 接收 messages 数组和 model 参数
- 内置筑境设计专属系统提示词（业务信息、项目案例、团队介绍、联系方式）
- 支持 DeepSeek、GLM 等大模型
- API Key 通过环境变量 env.AI_API_KEY 安全获取（不硬编码）
- 流式响应（text/event-stream），前端逐字显示
- 支持多模型路由配置（MODEL_CONFIGS 对象）
- API Key 未配置时返回 503 状态码和提示
- 包含错误处理和超时处理
- 环境变量: AI_API_KEY, AI_MODEL, AI_BASE_URL

### 2. KV 存储（边缘持久化）
- 创建命名空间 contact_kv 并绑定到项目
- 存储联系表单提交记录（按日期分层存储）
- 存储访问计数（visit_count）和提交计数（total_submissions）
- 所有 KV 操作通过 env.contact_kv 访问
- 代码中包含 KV 未绑定时的降级兼容逻辑

### 3. 前端集成

#### 表单对接
- 表单提交从"模拟提交"改为真实 fetch('/api/contact/submit') 调用
- 提交时按钮显示"提交中..."禁用状态
- 根据后端返回的 success 字段显示对应 Toast 提示
- 网络错误时降级为本地 Toast 提示（兼容本地开发）
- 请求体: { name, company, email, phone, message }

#### AI 客服浮窗
- 右下角固定圆形按钮，金色背景 + 脉冲动画
- 点击展开聊天面板（380px 宽，最大 520px 高）
- 关闭时按钮变为 X 形，脉冲动画消失
- 面板包含：头像+标题栏、消息列表、快捷问题按钮、输入框+发送按钮
- 消息列表支持 bot（深色卡片）和 user（金色气泡）两种样式
- 输入中显示打字动画（三点跳动）
- 支持流式渲染（逐字显示 AI 回复）
- 4个快捷问题按钮：业务范围、项目案例、合作咨询、设计理念
- 聊天历史维护在内存中（chatHistory 数组），支持多轮对话
- 回车键发送、Shift+回车换行
- 面板打开/关闭带缩放+淡入动画
- 移动端自适应（面板左右撑满）
- 状态栏显示"在线 · EdgeOne 边缘响应"

#### 访客统计徽章
- 左下角固定圆形胶囊徽章
- 绿色呼吸灯 + 文字"xxx 次访问 · xx 人在线"
- 页面加载时自动调用 /api/stats/visit
- API 不可用时显示"EdgeOne 边缘加速中"
- 演示模式后缀"· 演示模式"

## SEO 与社交分享
- 必须包含 <meta name="description"> 和 <meta name="keywords">
- 必须包含 Open Graph 标签（og:title、og:description、og:type、og:locale）
- <html> 标签添加 lang="zh-CN"
- 所有图片必须包含有意义的中文 alt 属性

## 交互与动效
- 预加载动画：金色线条从左到右滑动，0.8秒后淡出隐藏
- 自定义光标（仅限鼠标设备）：金色小圆点即时跟随 + 金色外圈缓动跟随，悬停在交互元素上时外圈放大至60px；触摸设备自动隐藏
- 滚动渐显（IntersectionObserver）：各模块内容在滚入视口时淡入上移，支持多级延迟（delay-1 到 delay-4）
- Hero 区域：全屏城市鸟瞰夜景背景，鼠标滚动时产生视差效果
- 数字统计：滚入视口时触发数字从0递增到目标值的动画，显示格式如 "600+"
- 作品集项目卡片：悬停时图片放大至 1.08 倍，同时从底部滑入项目信息遮罩层
- 奖项区域：无限横向循环滚动的跑马灯效果（JS复制DOM实现），悬停暂停
- 导航栏：滚动超过80px后添加毛玻璃背景
- 导航高亮：滚动时自动高亮当前 section
- 所有按钮和链接的悬停过渡使用 cubic-bezier(0.16, 1, 0.3, 1)
- 回到顶部按钮：滚动超过600px后淡入出现（位于 AI 客服按钮上方）

## 图片加载策略
- Hero 背景图立即加载，添加 opacity 过渡
- 其他图片使用 IntersectionObserver 懒加载（data-src → src），rootMargin 200px
- 图片容器设置深色背景色（#151515）避免白屏闪烁

## 无障碍与性能
- @media (prefers-reduced-motion: reduce) 媒体查询
- aria-label="菜单" 和 aria-label="返回顶部"
- 滚动事件使用 requestAnimationFrame 节流
- 跑马灯动画时长 40s

## 移动端适配（3个断点）
- 桌面端（>1024px）：完整布局
- 平板端（768px-1024px）：业务领域和作品集改为2列
- 手机端（<768px）：汉堡菜单全屏 overlay、业务/作品/团队改为单列、聊天面板左右撑满

## 页面结构（按顺序）
1. Hero 全屏首屏（城市鸟瞰夜景背景 + 固定导航栏 + 滚动引导）
2. 关于我们（机构介绍 + 4项数据统计 + 建筑大图）
3. 业务领域（8个板块 SVG 图标卡片，4列网格）
4. 代表项目（6个项目，3列不等高网格，分类筛选）
5. 发展历程（5个节点时间线）
6. 设计理念（居中引用金句）
7. 荣誉奖项（跑马灯循环滚动）
8. 核心团队（4位成员圆形头像卡片）
9. 联系我们（联系信息 + 表单，表单对接 Edge Function）
10. 页脚（Logo + 链接 + 动态版权年份）

## 浮层组件
- AI 客服浮窗（右下角金色按钮 + 聊天面板）
- 访客统计徽章（左下角）
- 回到顶部按钮（右侧，位于 AI 按钮上方）
- Toast 通知（底部居中）

## 技术要求
- 前端：单文件 HTML（CSS 写在 <style>，JS 写在 <script>）
- 后端：EdgeOne Pages Edge Functions（edge-functions/ 目录）
- 存储：EdgeOne Pages KV（contact_kv 命名空间）
- AI：通过 Edge Function 代理调用大模型 API
- 不使用任何外部 CSS/JS 框架（纯原生实现）
- 字体通过 Google Fonts CDN 加载
- 图片通过 Unsplash CDN 加载
- 不使用内联事件处理（onclick），全部 addEventListener
- Edge Functions 导出函数使用 onRequestPost / onRequestGet 签名
- 所有 Edge Functions 包含 KV 未绑定时的降级逻辑
```

---

## 与 v2 的关键差异

| 项目 | v2 | v3 |
|------|----|----|
| 架构 | 纯静态单文件 | 前端 + Edge Functions + KV 全栈 |
| 表单提交 | 前端模拟提交 | Edge Function + KV 真实存储 |
| AI 客服 | 无 | 流式对话浮窗，支持多轮对话 |
| 访问统计 | 无 | Edge Function + KV 计数器 |
| 产品能力体现 | 无 | Functions × 3 + KV × 2 + 边缘 AI |
| 部署平台 | 可部署任意平台 | EdgeOne Pages 专属 |
| 环境变量 | 无 | AI_API_KEY, AI_MODEL, AI_BASE_URL |
| 降级处理 | 无 | KV/AI 未配置时优雅降级 |

## EdgeOne Pages 能力覆盖清单

| 能力 | 是否使用 | 实现位置 |
|------|:--------:|---------|
| Edge Functions | ✅ | 3个边缘函数（表单/统计/AI） |
| KV 存储 | ✅ | contact_kv 命名空间 |
| 边缘 AI 集成 | ✅ | 大模型代理流式对话 |
| 环境变量 | ✅ | AI_API_KEY / AI_MODEL / AI_BASE_URL |
| 静态托管 | ✅ | index.html |
| 全球 CDN 加速 | ✅ | EdgeOne 边缘网络 |
| 自定义域名 | 可选 | 控制台配置 |
| HTTPS 证书 | ✅ | 平台自动提供 |
