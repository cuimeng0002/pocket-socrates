import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
    host: true, // 监听所有网络接口，允许外部访问
    allowedHosts: true, // 允许所有主机访问，宽松模式
    // 配置代理，解决CORS跨域问题
    proxy: {
      '/api': {
        target: 'https://dashscope.aliyuncs.com',
        changeOrigin: true,
        // 不要移除/api前缀，因为阿里云百炼API的URL包含/api
        // rewrite: (path) => path.replace(/^\/api/, ''),
        // 添加超时设置，避免连接被过早关闭
        timeout: 60000,
        // 配置https证书验证
        secure: false,
        // 配置请求头
        headers: {
          'Host': 'dashscope.aliyuncs.com',
          'X-Requested-With': 'XMLHttpRequest'
        }
      }
    }
  }
})
