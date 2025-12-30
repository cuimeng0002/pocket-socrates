// API配置文件
// 可以在这里配置不同大模型的API参数
export const apiConfig = {
  // 大模型类型：openai, deepseek, doubao, kimi, gemini, alibaba
  modelType: 'alibaba',
  
  // OpenAI配置
  openai: {
    apiKey: '', // 请替换为您的OpenAI API密钥
    model: 'gpt-3.5-turbo',
    baseURL: 'https://api.openai.com/v1',
    temperature: 0.7,
    maxTokens: 100
  },
  
  // DeepSeek配置
  deepseek: {
    apiKey: '', // 请替换为您的DeepSeek API密钥
    model: 'deepseek-chat',
    baseURL: 'https://api.deepseek.com/v1',
    temperature: 0.7,
    maxTokens: 100
  },
  
  // 豆包配置
  doubao: {
    apiKey: '', // 请替换为您的豆包API密钥
    model: 'doubao-pro-32k',
    baseURL: 'https://api.doubao.com/v1',
    temperature: 0.7,
    maxTokens: 100
  },
  
  // Kimi配置
  kimi: {
    apiKey: '', // 请替换为您的Kimi API密钥
    model: 'kimi-pro',
    baseURL: 'https://api.moonshot.cn/v1',
    temperature: 0.7,
    maxTokens: 100
  },
  
  // Gemini配置
  gemini: {
    apiKey: '', // 请替换为您的Gemini API密钥
    model: 'gemini-1.5-flash',
    baseURL: 'https://generativelanguage.googleapis.com/v1',
    temperature: 0.7,
    maxTokens: 100
  },
  
  // 阿里云百炼配置
  alibaba: {
    apiKey: 'sk-2cb713a12e004162a43bc7c54f90d7d4', // 请替换为您的阿里云百炼API密钥
    apiSecret: '', // 请替换为您的阿里云百炼API密钥
    model: 'qwen-turbo', // 可以根据需要选择其他模型
    baseURL: '/api', // 使用相对路径，通过Vite代理转发
    temperature: 0.7,
    maxTokens: 100
  }
}
