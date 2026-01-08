# 贵金属行情 WebSocket 代理服务器

## 📋 功能

将 HTTPS/WSS 请求转发到 HTTP/WS 服务器，解决浏览器安全限制。

## 🎯 部署平台

- Railway（推荐）
- Fly.io
- Glitch
- Replit

## 🚀 快速开始

1. 上传到 GitHub
2. 在平台创建项目
3. 部署
4. 修改前端配置
5. 测试连接

## 📝 环境变量（可选）

```
TARGET_HOST = 120.25.236.183
TARGET_PORT = 8189
```

## 🎯 使用方法

### 前端配置

```javascript
// Plaintext.js
var ip = 'your-app.railway.app';

// sockets.js
wsUrl = wsUrl.replace('ws://', 'wss://');
```

### WebSocket 连接

```
wss://your-app.railway.app/push?cname=ysxnew&uid=...
```

## 📊 健康检查

```
https://your-app.railway.app/health
```

## 🔧 故障排查

1. 检查日志
2. 测试健康检查
3. 验证目标服务器可访问
4. 检查 WebSocket 连接

---

**详细部署指南请查看 `Railway部署指南.md`**