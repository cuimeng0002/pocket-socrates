// HTTP客户端，用于处理API请求
import { apiConfig } from './config'

// 通用HTTP请求函数
export const request = async (url, options = {}) => {
  // 从配置中读取API密钥和配置，而不是硬编码
  const config = apiConfig[apiConfig.modelType]
  
  // 检查当前环境是否为生产环境
  const isProduction = import.meta.env.PROD
  
  // 生产环境中使用Vercel proxy，开发环境中使用相对路径
  const finalUrl = isProduction ? `https://pocket-socrates.vercel.app/api/generate` : url
  
  console.log('=== API Request Configuration ===')
  console.log('Environment:', isProduction ? 'Production' : 'Development')
  console.log('Requested URL:', url)
  console.log('Final URL:', finalUrl)
  
  // 默认请求配置
  const defaultOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    mode: isProduction ? 'cors' : 'same-origin',
    signal: AbortSignal.timeout(60000), // 60秒超时
    ...options
  }
  
  // 添加详细日志，方便调试
  console.log('Request Options:', {
    method: defaultOptions.method,
    headers: defaultOptions.headers,
    body: defaultOptions.body,
    mode: defaultOptions.mode
  })
  
  try {
    const response = await fetch(finalUrl, defaultOptions)
    
    console.log('=== API Response ===')
    console.log('Status:', response.status)
    console.log('Status Text:', response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error Response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }
    
    const data = await response.json()
    console.log('Response Data:', data)
    
    return data
  } catch (error) {
    console.error('=== API Request Failed ===')
    console.error('Error:', error)
    throw error
  }
}

// 大模型对话请求函数
export const chatRequest = async (messages) => {
  try {
    // 检查当前环境是否为生产环境
    const isProduction = import.meta.env.PROD
    
    let response
    
    if (isProduction) {
      // 生产环境：使用Vercel proxy，发送符合阿里云百炼API要求的请求体
      response = await request('', {
        body: JSON.stringify({
          model: 'qwen-turbo',
          input: {
            messages: messages
          },
          parameters: {
            temperature: 0.7,
            max_tokens: 1000
          }
        })
      })
    } else {
      // 开发环境：使用相对路径，发送符合阿里云百炼API要求的请求体
      response = await request('/api/v1/services/aigc/text-generation/generation', {
        body: JSON.stringify({
          model: 'qwen-turbo',
          input: {
            messages: messages
          },
          parameters: {
            temperature: 0.7,
            max_tokens: 1000
          }
        })
      })
    }
    
    console.log('=== Chat Request Response ===')
    console.log('Full Response:', JSON.stringify(response, null, 2))
    
    return response
  } catch (error) {
    console.error('=== Chat Request Failed ===')
    console.error('Error:', error)
    throw error
  }
}