// 问题相关API
import { chatRequest } from './client'

export const questionAPI = {
  // 生成苏格拉底式提问
    generate: async (topic, type) => {
      // 使用大模型生成问题
      const messages = [
        {
          role: 'system',
          content: `你是「三维思考引擎」，融合苏格拉底的诘问智慧、马斯克的第一性原理穿透力、金字塔理论的结构化思维框架，核心职责是通过层层追问，帮助用户穿透问题表象、触及本质，最终形成可落地的思考结论。

## 核心职责
1. 通过层层追问，帮助用户穿透问题表象、触及本质
2. 融合苏格拉底的诘问智慧、马斯克的第一性原理、金字塔理论
3. 生成深度、有递进关系、支持不同风格的问题

## 约束条件
1. 禁止直接给出答案或解决方案，所有引导需通过问题完成
2. 单次对话追问次数不超过5轮，避免陷入无限循环
3. 问题需保持开放性，禁止使用是非题或选择题
4. 当用户明确表示已找到答案时，需立即终止追问流程

## 问题生成要求
1. 针对用户提供的话题，生成1个深度引导问题
2. 问题要符合用户选择的风格（严谨、轻松、幽默）
3. 问题要具有深度和启发性，能够引导用户深入思考
4. 避免使用固定模板，每个问题都要根据话题内容定制
5. 不要在问题前面添加序号或其他标记

现在，请根据用户提供的话题，生成1个符合上述要求的问题，引导用户深入思考。`
        },
        {
          role: 'user',
          content: `话题：${topic}\n类型：${type}`
        }
      ]
      
      try {
        // 直接返回API调用结果，不进行额外处理
        const response = await chatRequest(messages)
        console.log('API Response:', response)
        
        // 验证API返回结果
        if (response && response.output && response.output.text) {
          // 解析生成的问题，只保留第一个有效问题
          const question = response.output.text.trim()
          
          return {
            data: {
              questions: [question] // 保持返回格式兼容，使用数组包含单个问题
            }
          }
        } else {
          // API返回格式异常，抛出错误
          throw new Error('API返回格式异常')
        }
      } catch (error) {
        console.error('生成问题失败:', error)
        // 直接抛出错误，让调用者知道API调用失败
        throw error
      }
    },
  
  // 基于用户回答生成下一个问题
  generateNextQuestion: async (topic, conversationHistory, currentAnswer) => {
    // 使用大模型基于对话历史生成下一个问题
    const systemPrompt = `你是「三维思考引擎」，融合苏格拉底的诘问智慧、马斯克的第一性原理穿透力、金字塔理论的结构化思维框架，核心职责是通过层层追问，帮助用户穿透问题表象、触及本质，最终形成可落地的思考结论。

## 核心职责
1. 通过层层追问，帮助用户穿透问题表象、触及本质
2. 融合苏格拉底的诘问智慧、马斯克的第一性原理、金字塔理论
3. 生成深度、有递进关系、支持不同风格的问题

## 约束条件
1. 禁止直接给出答案或解决方案，所有引导需通过问题完成
2. 单次对话追问次数不超过5轮，避免陷入无限循环
3. 问题需保持开放性，禁止使用是非题或选择题
4. 当用户明确表示已找到答案时，需立即终止追问流程

## 问题生成要求
1. 基于用户的回答和对话历史，生成下一个深度递进的问题
2. 问题要符合用户选择的风格（严谨、轻松、幽默）
3. 问题要具有深度和启发性，能够引导用户深入思考
4. 避免使用固定模板，每个问题都要根据话题内容定制
5. 保持追问的连贯性，不要偏离主题

现在，请根据用户提供的话题、对话历史和当前回答，生成下一个符合上述要求的问题，引导用户深入思考。`
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `话题：${topic}` }
    ]
    
    // 添加对话历史，只保留最近的10条记录，避免上下文过长
    const recentHistory = conversationHistory.slice(-10)
    recentHistory.forEach(msg => {
      messages.push(msg)
    })
    
    // 添加当前回答
    messages.push({ role: 'user', content: currentAnswer })
    
    try {
      // 直接返回API调用结果，不进行额外处理
      const response = await chatRequest(messages)
      console.log('API Response:', response)
      
      // 验证API返回结果
      if (response && response.output && response.output.text) {
        return {
          data: {
            question: response.output.text.trim()
          }
        }
      } else {
        // API返回格式异常，抛出错误
        throw new Error('API返回格式异常')
      }
    } catch (error) {
      console.error('生成下一个问题失败:', error)
      // 失败时返回更智能的动态问题，而不是固定模板
      const dynamicQuestion = `您刚刚提到"${currentAnswer.substring(0, 20)}..."，能否进一步阐述一下您的想法？`
      
      return {
        data: {
          question: dynamicQuestion
        }
      }
    }
  }
}
