# 访问统计部署

2026-11-10：已部署到现有 counter Worker，正式版本 `3709ef6d`。已创建 AGCRIBUG_COUNTER 并绑定 VISIT_KV，GET、POST 和 GitHub Pages 跨域响应验证通过。一次累加验证将初始总数增加到 1。仓库中的 wrangler.jsonc 保留部署配置，不含账户密钥；以后可在授权后从 cloudflare 目录运行 wrangler deploy。

1. 打开 Cloudflare Workers 中已有的 `counter`，将 `counter.mjs` 内容粘贴到代码编辑器并部署。
2. 在 Worker 的绑定中添加 **KV Namespace**（不是 D1）：变量名 `VISIT_KV`，选择或创建 `AGCRIBUG_COUNTER`。
3. GET `https://counter.ninuharumo.workers.dev/visit` 应返回 JSON，例如 `{"count":0}`。GET 不增加计数，POST 增加一次。
4. 将本仓库的前端修改发布到 GitHub Pages，然后在网站中检查页脚数字。不要在正式计数器上反复 POST 测试。

统计口径为标签页会话访问次数，不是真实独立访客人数。刷新后读取最新总数，SPA 切页和切语言复用请求结果。浏览器禁止 sessionStorage 时只在当前页面生命周期内去重；关闭标签页重新访问会再次计数。网络请求失败或超时显示破折号，不伪造本地数字。POST 已被服务器处理但响应丢失时，后续重试仍可能重复计数。

KV 是最终一致的存储，读后写无法保证并发累加：同时访问可能漏计，高频写入也可能受限制，因此本方案仅用于低流量主页的近似浏览统计。需要准确并发计数时应改用 Durable Object 或数据库原子更新。CORS 仅限制浏览器来源，并非防刷机制。若使用自定义域名，需将其完整 origin 加入 counter.mjs 的 allowedOrigins。
