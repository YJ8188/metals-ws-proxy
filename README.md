# 贵金属行情 WebSocket 代理服务器

## 📋 项目说明

这是一个 WebSocket 代理服务器，用于将 Render 的 HTTPS/WSS 连接转发到 HTTP/WS 服务器。

### 功能特性

- ✅ 自动 HTTPS/WSS 加密
- ✅ WebSocket 实时转发
- ✅ HTTP 请求转发
- ✅ 自动重连支持
- ✅ 健康检查
- ✅ 错误处理
- ✅ 日志记录

### 架构说明

```
客户端（浏览器）
    ↓ wss:// (加密)
Render 代理服务器 (本服务)
    ↓ ws:// (不加密)
目标服务器 (120.25.236.183:80)
```

---

## 🚀 快速部署到 Render

### 步骤 1: 准备代码

1. 将 `render-proxy` 文件夹上传到 GitHub 仓库
2. 确保仓库包含以下文件：
   - `package.json`
   - `server.js`
   - `README.md`

### 步骤 2: 在 Render 创建 Web Service

1. 登录 [Render Dashboard](https://dashboard.render.com/)
2. 点击 **New +** → **Web Service**
3. 连接你的 GitHub 仓库
4. 配置如下：

| 配置项 | 值 |
|--------|-----|
| **Name** | `metals-ws-proxy` |
| **Region** | Singapore (或离你最近的区域) |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free (免费) |

5. 点击 **Create Web Service**

### 步骤 3: 配置环境变量（可选）

在 Render 的 Web Service 设置中，添加环境变量：

```
TARGET_HOST = 120.25.236.183
TARGET_PORT = 80
```

### 步骤 4: 获取 Render URL

部署完成后，Render 会提供一个 URL，例如：
```
https://metals-ws-proxy.onrender.com
```

---

## 🔧 前端配置修改

### 修改 `config_new.js`

在你的前端项目中，修改 `F:\项目\数字货币\js\config_new.js`：

```javascript
var AppConfig = {
    server: {
        // 改为 Render 的域名
        wsHost: 'metals-ws-proxy.onrender.com',
        httpHost: 'metals-ws-proxy.onrender.com',

        // 端口配置
        ports: {
            ws: 443,      // WSS 默认端口
            http: 443     // HTTPS 默认端口
        }
    },

    // 修改 WebSocket URL 生成函数
    getWebSocketUrl: function(uid) {
        var protocol = 'wss://';  // 使用加密连接
        var host = this.server.wsHost;
        var path = uid ? '/' + uid : '';
        return protocol + host + path;  // 不需要端口
    },

    // 修改 HTTP URL 生成函数
    getHttpUrl: function(path) {
        var protocol = 'https://';  // 使用加密连接
        var host = this.server.httpHost;
        return protocol + host + path;  // 不需要端口
    }
};
```

### 修改 `index.html`

确保引用了 `config_new.js`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>贵金属实时行情</title>
    <!-- ... CSS 样式 ... -->
</head>
<body>
    <!-- ... HTML 内容 ... -->

    <!-- JavaScript 引用 -->
    <script src="js/jquery-1.10.2.min.js"></script>
    <script src="js/config_new.js"></script>  <!-- 添加这一行 -->
    <script src="js/metalsData.js"></script>
    <script src="js/Plaintext.js"></script>
    <script src="js/Utilss.js"></script>
    <script src="jquery/crypto-js.js"></script>
    <script src="js/dataSettings.js"></script>
    <script src="js/bases.js"></script>
    <script src="js/sockets.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

---

## 🧪 测试部署

### 1. 测试健康检查

访问：`https://metals-ws-proxy.onrender.com/health`

应该返回：
```json
{
  "status": "ok",
  "service": "metals-ws-proxy",
  "target": "http://120.25.236.183:80",
  "timestamp": "2025-01-08T..."
}
```

### 2. 测试 WebSocket 连接

在浏览器控制台测试：

```javascript
// 创建 WebSocket 连接
const ws = new WebSocket('wss://metals-ws-proxy.onrender.com/test-uid');

ws.onopen = () => {
    console.log('✅ WebSocket 连接成功');
};

ws.onmessage = (event) => {
    console.log('📥 收到消息:', event.data);
};

ws.onerror = (error) => {
    console.error('❌ WebSocket 错误:', error);
};

ws.onclose = () => {
    console.log('🔌 WebSocket 连接关闭');
};
```

### 3. 测试前端页面

1. 打开你的 `index.html`
2. 打开浏览器控制台（F12）
3. 查看 WebSocket 连接日志
4. 确认价格数据正常更新

---

## 📊 监控和日志

### 查看 Render 日志

1. 登录 Render Dashboard
2. 进入你的 Web Service
3. 点击 **Logs** 标签
4. 查看实时日志

### 常见日志信息

```
✅ 代理服务器已启动
📍 监听端口: 3000
🎯 目标服务器: http://120.25.236.183:80
🔗 WebSocket 连接: /test-uid
📤 代理请求: GET /api/formula
📥 代理响应: 200 /api/formula
```

---

## ⚠️ 注意事项

### 1. Render 免费套餐限制

- **休眠时间**: 15分钟无活动后休眠
- **唤醒时间**: 首次请求可能需要几秒
- **每月额度**: 750小时免费
- **内存限制**: 512MB
- **超时时间**: 30秒（免费套餐）

### 2. WebSocket 超时

Render 免费套餐的 WebSocket 可能有超时限制。解决方案：

- 前端实现自动重连（你的代码已有）
- 使用心跳检测保持连接（你的代码已有）
- 考虑升级到付费套餐

### 3. CORS 问题

如果遇到 CORS 错误，在 `server.js` 中添加：

```javascript
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
```

---

## 🔐 安全建议

### 生产环境配置

1. **使用自定义域名**（可选）
   - 在 Render 添加自定义域名
   - 配置 DNS 记录
   - Render 自动提供 SSL 证书

2. **限制访问**（可选）
   - 添加 API 密钥验证
   - 限制 IP 白名单
   - 使用速率限制

3. **监控和告警**
   - 设置 Render 告警
   - 监控错误日志
   - 定期检查连接状态

---

## 📞 故障排查

### 问题 1: 连接失败

**症状**: WebSocket 连接失败

**解决方案**:
1. 检查 Render 服务是否运行
2. 查看浏览器控制台错误
3. 检查 Render 日志
4. 确认目标服务器可访问

### 问题 2: 频繁断开

**症状**: WebSocket 连接频繁断开

**解决方案**:
1. 检查心跳检测是否正常
2. 增加超时时间
3. 检查网络连接
4. 考虑升级 Render 套餐

### 问题 3: 数据不更新

**症状**: 价格数据不更新

**解决方案**:
1. 检查 WebSocket 消息是否收到
2. 检查数据解析逻辑
3. 查看浏览器控制台日志
4. 确认目标服务器正常

---

## 📚 相关资源

- [Render 文档](https://render.com/docs)
- [Express 文档](https://expressjs.com/)
- [WebSocket API](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)
- [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)

---

## 📝 更新日志

### v1.0.0 (2025-01-08)

- ✅ 初始版本
- ✅ WebSocket 代理支持
- ✅ HTTP 请求代理
- ✅ 健康检查端点
- ✅ 错误处理和日志

---

## 📄 许可证

MIT License

---

**作者**: 系统重构
**创建日期**: 2025-01-08
**最后更新**: 2025-01-08