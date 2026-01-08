/**
 * ============================================================================
 * 贵金属行情 WebSocket 代理服务器 - Railway 版本
 * ============================================================================
 * 功能: 将 HTTPS/WSS 请求转发到 HTTP/WS 服务器
 * 部署平台: Railway (https://railway.app)
 * 目标服务器: 120.25.236.183:8189
 * ============================================================================
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const http = require('http');

// 创建 Express 应用
const app = express();

// 目标服务器配置
const TARGET_SERVER = {
    host: '120.25.236.183',
    port: 8189,
    protocol: 'http'
};

// 构建目标 URL
const TARGET_URL = `${TARGET_SERVER.protocol}://${TARGET_SERVER.host}:${TARGET_SERVER.port}`;

console.log('========================================');
console.log('贵金属行情 WebSocket 代理服务器 (Railway)');
console.log('========================================');
console.log('目标服务器:', TARGET_URL);
console.log('端口:', process.env.PORT || 3000);
console.log('========================================');

/**
 * 创建 WebSocket 代理中间件
 */
const wsProxy = createProxyMiddleware({
    target: TARGET_URL,
    changeOrigin: true,
    ws: true,
    secure: false,
    
    // 超时配置
    proxyTimeout: 60000,
    timeout: 60000,
    
    // 错误处理
    onError: (err, req, res, next) => {
        console.error('❌ 代理错误:', err.message);
        console.error('请求信息:', req.method, req.url);
        
        if (req.headers.upgrade) {
            console.log('WebSocket 错误，不返回响应');
            return;
        }
        
        if (!res.headersSent && typeof res.status === 'function') {
            res.status(500).json({
                error: '代理错误',
                message: err.message,
                timestamp: new Date().toISOString()
            });
        }
    },
    
    // 代理请求日志
    onProxyReq: (proxyReq, req, res) => {
        console.log(`📤 代理请求: ${req.method} ${req.url}`);
        proxyReq.setHeader('X-Forwarded-For', req.ip);
        proxyReq.setHeader('X-Real-IP', req.ip);
    },
    
    // 代理响应日志
    onProxyRes: (proxyRes, req, res) => {
        console.log(`📥 代理响应: ${proxyRes.statusCode} ${req.url}`);
    },
    
    // WebSocket 升级处理
    onProxyReqWs: (proxyReq, req, socket, options, head) => {
        console.log(`🔗 WebSocket 连接建立: ${req.url}`);
        console.log(`📤 目标服务器: ${TARGET_URL}${req.url}`);
        
        // 添加必要的头部
        proxyReq.setHeader('X-Forwarded-For', req.socket.remoteAddress);
        proxyReq.setHeader('X-Real-IP', req.socket.remoteAddress);
        proxyReq.setHeader('X-Forwarded-Proto', 'https');
        proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
        
        // 监听代理连接的错误
        proxyReq.on('error', (err) => {
            console.error('❌ WebSocket 代理错误:', err.message);
        });
        
        // 监听客户端连接的错误
        socket.on('error', (err) => {
            console.error('❌ 客户端 WebSocket 错误:', err.message);
        });
        
        // 监听连接关闭
        proxyReq.on('close', () => {
            console.log('🔌 代理连接关闭');
        });
        
        socket.on('close', () => {
            console.log('🔌 客户端连接关闭');
        });
    },
    
    // WebSocket 消息处理
    onProxyResWs: (proxyRes, req, socket) => {
        console.log(`✅ WebSocket 响应: ${req.url}`);
        
        socket.on('error', (err) => {
            console.error('❌ WebSocket 响应错误:', err.message);
        });
    }
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'metals-ws-proxy-railway',
        target: TARGET_URL,
        timestamp: new Date().toISOString()
    });
});

// 根路径
app.get('/', (req, res) => {
    res.json({
        service: '贵金属行情 WebSocket 代理服务器',
        platform: 'Railway',
        version: '1.0.0',
        status: 'running',
        target: TARGET_URL,
        endpoints: {
            health: '/health',
            proxy: '/* (转发所有请求)'
        },
        usage: {
            websocket: 'wss://your-app.railway.app/your-uid',
            http: 'https://your-app.railway.app/api/...'
        }
    });
});

// 应用 WebSocket 代理（处理所有路径）
app.use('/', wsProxy);

// 404 处理
app.use((req, res) => {
    console.log('⚠️  未找到路径:', req.url);
    res.status(404).json({
        error: '未找到',
        path: req.url,
        timestamp: new Date().toISOString()
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('❌ 未处理的错误:', err);
    res.status(500).json({
        error: '服务器错误',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log('✅ 代理服务器已启动');
    console.log(`📍 监听端口: ${PORT}`);
    console.log(`🎯 目标服务器: ${TARGET_URL}`);
    console.log('========================================');
    console.log('📋 使用说明:');
    console.log(`   WebSocket: wss://your-app.railway.app/your-uid`);
    console.log(`   HTTP: https://your-app.railway.app/api/...`);
    console.log(`   健康检查: https://your-app.railway.app/health`);
    console.log('========================================');
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('⚠️  收到 SIGTERM 信号，正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('⚠️  收到 SIGINT 信号，正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});

// 保持实例活跃
setInterval(() => {
    http.get(`http://localhost:${PORT}/health`, (res) => {
        // 忽略响应
    }).on('error', () => {
        // 忽略错误
    });
}, 5 * 60 * 1000);  // 每5分钟ping一次