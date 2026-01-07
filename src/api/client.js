// HTTP客户端，用于处理API请求
import { apiConfig } from './config'

// 通用HTTP请求函数
export const request = async (url, options = {}) => {
  // 从配置中读取API密钥和配置，而不是硬编码
  const config = apiConfig[apiConfig.modelType]
  const apiKey = config.apiKey
  
  // 生产环境中直接使用阿里云百炼API的完整URL，开发环境中使用相对路径
  // 检查当前环境是否为生产环境
  const isProduction = import.meta.env.PROD
  // 生产环境中使用完整URL，开发环境中使用相对路径
  const finalUrl = isProduction ? `https://dashscope.aliyuncs.com${url}` : url
  
  // 默认请求配置
  const defaultOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 阿里云百炼API使用Authorization: Bearer <apiKey>格式
      'Authorization': `Bearer ${apiKey}`
    },
    // 生产环境中使用cors模式，开发环境中使用same-origin模式
    mode: isProduction ? 'cors' : 'same-origin',
    // 添加超时设置，避免浏览器过早关闭连接
    signal: AbortSignal.timeout(60000), // 60秒超时
    ...options
  }
  
  // 添加详细日志，方便调试
  console.log('API Request:', {
    url: url,
    finalUrl: finalUrl,
    headers: defaultOptions.headers,
    body: defaultOptions.body
  })
  
  try {
    const response = await fetch(finalUrl, defaultOptions)
    
    console.log('API Response Status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }
    
    const data = await response.json()
    console.log('API Response Data:', data)
    return data
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// 大模型对话请求函数
export const chatRequest = async (messages) => {
  try {
    // 使用正确的阿里云百炼API请求格式
    // 参考：https://help.aliyun.com/zh/dashscope/developer-reference/api-details
    const response = await request('/api/v1/services/aigc/text-generation/generation', {
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
    
    // 添加详细日志，查看完整响应结构
    console.log('Full Response:', JSON.stringify(response, null, 2))
    
    // 返回完整的响应对象，让调用者自行处理
    return response
  } catch (error) {
    console.error('Chat request failed:', error)
    throw error
  }
}
