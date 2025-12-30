import { defineStore } from 'pinia'
import { questionAPI } from '../api/question'
import { chatRequest } from '../api/client'

export const useQuestionStore = defineStore('question', {
  state: () => ({
    currentTopic: '',
    currentTopicType: 'other',
    questions: [], // 所有生成的问题
    answers: [], // 用户的回答
    currentQuestionIndex: 0, // 当前问题索引
    isLoading: false,
    error: null,
    showSuggestionPrompt: false, // 是否显示建议提示
    suggestions: [], // AI建议
    conversationHistory: [], // 对话历史，用于生成下一个问题
    counterAnswer: '' // AI对用户反问的回答
  }),
  
  getters: {
    currentQuestion: (state) => state.questions[state.currentQuestionIndex],
    currentAnswer: (state) => state.answers[state.currentQuestionIndex] || '',
    hasNextQuestion: (state) => state.currentQuestionIndex < state.questions.length - 1,
    isLastQuestion: (state) => state.currentQuestionIndex === state.questions.length - 1
  },
  
  actions: {
    // 保持向后兼容，设置当前话题
    setCurrentTopic(topic, type) {
      this.currentTopic = topic
      this.currentTopicType = type
    },
    
    // 初始化思考会话
    initSession(topic, type) {
      this.currentTopic = topic
      this.currentTopicType = type
      this.questions = []
      this.answers = []
      this.currentQuestionIndex = 0
      this.showSuggestionPrompt = false
      this.suggestions = []
      this.conversationHistory = []
      // 保存新会话
      this.saveSession()
    },
    
    // 保存会话到localStorage
    saveSession() {
      const sessionData = {
        currentTopic: this.currentTopic,
        currentTopicType: this.currentTopicType,
        questions: this.questions,
        answers: this.answers,
        currentQuestionIndex: this.currentQuestionIndex,
        showSuggestionPrompt: this.showSuggestionPrompt,
        suggestions: this.suggestions,
        conversationHistory: this.conversationHistory
      }
      localStorage.setItem('currentSession', JSON.stringify(sessionData))
    },
    
    // 恢复会话从localStorage
    restoreSession() {
      const savedSession = localStorage.getItem('currentSession')
      if (savedSession) {
        try {
          const sessionData = JSON.parse(savedSession)
          // 严格检查会话数据的有效性
          if (typeof sessionData === 'object' && sessionData.currentTopic) {
            this.currentTopic = sessionData.currentTopic
            this.currentTopicType = sessionData.currentTopicType || 'other'
            this.questions = Array.isArray(sessionData.questions) ? sessionData.questions : []
            this.answers = Array.isArray(sessionData.answers) ? sessionData.answers : []
            this.currentQuestionIndex = typeof sessionData.currentQuestionIndex === 'number' ? sessionData.currentQuestionIndex : 0
            this.showSuggestionPrompt = typeof sessionData.showSuggestionPrompt === 'boolean' ? sessionData.showSuggestionPrompt : false
            this.suggestions = Array.isArray(sessionData.suggestions) ? sessionData.suggestions : []
            this.conversationHistory = Array.isArray(sessionData.conversationHistory) ? sessionData.conversationHistory : []
            return true
          }
        } catch (error) {
          console.error('恢复会话失败:', error)
          // 清除无效会话
          this.clearSession()
        }
      }
      return false
    },
    
    // 清除会话
    clearSession() {
      localStorage.removeItem('currentSession')
      this.initSession('', 'other')
    },
    
    // 生成优化的模拟问题，有深度、有递进关系、支持不同风格
    generateOptimizedQuestion(topic, depth, style = '严谨') {
      // 根据不同风格生成不同类型的问题模板
      const styleTemplates = {
        严谨: {
          // 深度0：探索本质和动机
          0: [
            `关于"${topic}"，您认为它的本质是什么？`,
            `是什么让您对"${topic}"感到焦虑或关注？`,
            `您希望通过解决"${topic}"获得什么？`,
            `"${topic}"对您来说意味着什么？`,
            `是什么触发了您对"${topic}"的思考？`
          ],
          // 深度1：探索挑战和尝试
          1: [
            `您认为"${topic}"的核心挑战是什么？`,
            `如果您解决了"${topic}"，会对您产生什么积极影响？`,
            `您已经尝试过哪些方法来应对"${topic}"？效果如何？`,
            `您认为解决"${topic}"的主要障碍是什么？`,
            `"${topic}"与您过去遇到的哪些问题有相似之处？`
          ],
          // 深度2：探索价值观和影响
          2: [
            `您认为"${topic}"与您的价值观有什么联系？`,
            `是什么阻碍了您更有效地解决"${topic}"？`,
            `您希望从"${topic}"中学到什么？`,
            `"${topic}"会如何影响您周围的人？`,
            `您对"${topic}"的看法在过去几个月中有什么变化？`
          ],
          // 深度3：探索解决方案和未来
          3: [
            `如果您拥有解决"${topic}"的所有资源，您会怎么做？`,
            `您认为"${topic}"会如何影响您的未来规划？`,
            `您可以从哪些方面重新审视"${topic}"，获得新的视角？`,
            `您认为解决"${topic}"需要哪些关键能力？`,
            `您希望通过"${topic}"实现什么长远目标？`
          ]
        },
        轻松: {
          // 深度0：探索本质和动机
          0: [
            `说到"${topic}"，您首先想到的是什么呢？`,
            `"${topic}"这件事，让您觉得最有意思的地方在哪里？`,
            `如果"${topic}"是一个朋友，您会怎么描述它？`,
            `是什么让您今天突然想聊起"${topic}"呢？`,
            `"${topic}"给您的生活带来了哪些变化？`
          ],
          // 深度1：探索挑战和尝试
          1: [
            `在处理"${topic}"时，您觉得最棘手的部分是什么？`,
            `如果"${topic}"突然消失了，您会有什么感受？`,
            `您有没有试过用一些有趣的方法来应对"${topic}"？`,
            `您觉得"${topic}"最考验您的什么能力？`,
            `"${topic}"和您之前遇到的问题相比，有什么不同？`
          ],
          // 深度2：探索价值观和影响
          2: [
            `"${topic}"和您的人生目标有什么关系吗？`,
            `是什么让"${topic}"变得这么重要？`,
            `从"${topic}"中，您觉得自己能学到什么？`,
            `"${topic}"会影响到您身边的哪些人？`,
            `您对"${topic}"的看法最近有没有什么变化？`
          ],
          // 深度3：探索解决方案和未来
          3: [
            `如果给您一个魔法棒，您会怎么解决"${topic}"？`,
            `"${topic}"会如何影响您未来的计划？`,
            `换个角度看"${topic}"，您会有什么新发现？`,
            `解决"${topic}"，您觉得最需要什么？`,
            `您希望"${topic}"最终会变成什么样子？`
          ]
        },
        幽默: {
          // 深度0：探索本质和动机
          0: [
            `哎哟，"${topic}"这个话题有点意思！您觉得它到底是何方神圣？`,
            `是什么风把"${topic}"这个小调皮吹到您面前的？`,
            `如果"${topic}"是一道菜，您觉得它会是什么味道？`,
            `"${topic}"给您的生活添了不少料吧？`,
            `是什么让"${topic}"成功引起了您的注意？`
          ],
          // 深度1：探索挑战和尝试
          1: [
            `"${topic}"这只拦路虎，您觉得它最厉害的招式是什么？`,
            `如果您把"${topic}"搞定了，是不是得开个庆功宴？`,
            `您有没有试过用什么奇招怪招来对付"${topic}"？`,
            `"${topic}"是不是给您挖了不少坑？`,
            `"${topic}"和您之前遇到的问题比，谁更难搞定？`
          ],
          // 深度2：探索价值观和影响
          2: [
            `"${topic}"和您的人生哲学有什么共鸣吗？`,
            `是什么让"${topic}"变得这么难以对付？`,
            `从"${topic}"这个老师身上，您能学到什么？`,
            `"${topic}"是不是也影响到了您的朋友圈？`,
            `您对"${topic}"的看法有没有像天气一样变来变去？`
          ],
          // 深度3：探索解决方案和未来
          3: [
            `如果您是"${topic}"的克星，您会怎么收拾它？`,
            `"${topic}"会不会成为您未来的小跟班？`,
            `如果您倒立着看"${topic}"，会发现什么新大陆？`,
            `解决"${topic}"，您觉得需要请哪些帮手？`,
            `您希望"${topic}"最终会变成您的好朋友吗？`
          ]
        }
      }
      
      // 确保深度在有效范围内
      const depthIndex = Math.min(depth, 3)
      // 获取对应风格和深度的问题模板
      const templates = styleTemplates[style][depthIndex] || styleTemplates['严谨'][depthIndex]
      // 随机选择一个问题
      return templates[Math.floor(Math.random() * templates.length)]
    },
    
    // 生成第一个问题（使用真实API调用）
    async generateFirstQuestion(topic, type) {
      // 使用当前会话的topic和type，如果没有则使用传入的参数
      const currentTopic = this.currentTopic || topic
      const currentType = this.currentTopicType || type
      
      // 确保有有效的话题
      if (!currentTopic) {
        console.error('生成问题失败：缺少有效的话题')
        return
      }
      
      this.isLoading = true
      this.error = null
      
      try {
        // 直接使用questionAPI.generate生成第一个问题
        const response = await questionAPI.generate(currentTopic, currentType)
        const questions = response.data.questions
        
        // 保存生成的问题
        if (questions && questions.length > 0) {
          this.questions = questions
          // 更新对话历史
          this.conversationHistory = []
          this.conversationHistory.push({ role: 'assistant', content: questions[0] })
        } else {
          // API返回结果异常，使用默认问题
          const question = `关于"${currentTopic}"，您认为它的本质是什么？`
          this.questions.push(question)
          this.conversationHistory.push({ role: 'assistant', content: question })
        }
        
        // 保存会话
        this.saveSession()
      } catch (error) {
        console.error('API调用失败:', error)
        
        // 出错时使用API生成的默认问题，而不是本地模板
        const response = await questionAPI.generate(currentTopic, currentType)
        const questions = response.data.questions
        
        if (questions && questions.length > 0) {
          this.questions = questions
          // 更新对话历史
          this.conversationHistory = []
          this.conversationHistory.push({ role: 'assistant', content: questions[0] })
        } else {
          // 如果API调用完全失败，使用本地生成的问题
          const question = `关于"${currentTopic}"，您认为它的核心是什么？`
          this.questions.push(question)
          this.conversationHistory.push({ role: 'assistant', content: question })
        }
        
        // 保存会话
        this.saveSession()
      } finally {
        this.isLoading = false
      }
    },
    
    // 返回上一个问题
    goToPreviousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--
      }
    },
    
    // 前进到下一个问题
    goToNextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++
      }
    },
    
    // 基于用户回答生成下一个问题（使用真实API，带优化的兜底机制）
    async generateNextQuestion(answer) {
      // 保存当前回答
      this.answers[this.currentQuestionIndex] = answer
      this.conversationHistory.push({ role: 'user', content: answer })
      
      this.isLoading = true
      this.error = null
      
      try {
        // 检测用户是否提出了反问
        const isCounterQuestion = answer.includes('？') || answer.includes('?') || 
                                 answer.includes('什么') || answer.includes('怎么') || 
                                 answer.includes('为什么') || answer.includes('为什么') ||
                                 answer.includes('如何') || answer.includes('怎样') ||
                                 answer.includes('哪里') || answer.includes('哪里') ||
                                 answer.includes('何时') || answer.includes('何时')
        
        // 如果是反问，先回答用户的反问
        if (isCounterQuestion) {
          // 构建反问回答的对话历史
          const counterQuestionMessages = [
            {
              role: 'system',
              content: `你是「三维思考引擎」，融合苏格拉底的诘问智慧、马斯克的第一性原理穿透力、金字塔理论的结构化思维框架，核心职责是通过层层追问，帮助用户穿透问题表象、触及本质，最终形成可落地的思考结论。

当用户提出反问时，请先直接回答用户的反问，然后再继续追问引导思考。回答要简洁明了，针对性强，然后过渡到下一个引导问题。`
            },
            ...this.conversationHistory
          ]
          
          // 使用大模型回答用户的反问
          const counterResponse = await chatRequest(counterQuestionMessages)
          
          // 处理反问回答
          let counterAnswer = counterResponse.output.text
          // 提取回答部分，去掉可能的追问
          if (counterAnswer.includes('\n\n')) {
            counterAnswer = counterAnswer.split('\n\n')[0]
          }
          
          // 保存反问回答到state，用于在界面上显示
          this.counterAnswer = counterAnswer
          
          // 将反问回答添加到对话历史
          this.conversationHistory.push({ role: 'assistant', content: counterAnswer })
        } else {
          // 如果不是反问，清空之前的反问回答
          this.counterAnswer = ''
        }
        
        // 读取用户设置的提问数量
        const aiSettings = JSON.parse(localStorage.getItem('aiSettings') || '{"count": 5}')
        const maxQuestions = aiSettings.count || 5
        
        // 检查是否已经达到最大问题数量
        if (this.questions.length >= maxQuestions) {
          // 达到最大问题数量，显示建议提示
          this.showSuggestionPrompt = true
          return
        }
        
        // 尝试使用API生成下一个问题
        const response = await questionAPI.generateNextQuestion(
          this.currentTopic,
          this.conversationHistory,
          answer
        )
        
        const nextQuestion = response.data.question
        
        // 保存生成的问题
        this.questions.push(nextQuestion)
        this.currentQuestionIndex++
        this.conversationHistory.push({ role: 'assistant', content: nextQuestion })
        
        // 保存会话
        this.saveSession()
      } catch (error) {
        console.error('API调用失败，使用优化的模拟数据:', error)
        
        // 读取用户设置的提问数量和深度
        const aiSettings = JSON.parse(localStorage.getItem('aiSettings') || '{"count": 5, "depth": 2, "style": "严谨"}')
        const maxQuestions = aiSettings.count || 5
        const depth = Math.min(this.questions.length, aiSettings.depth || 2)
        const style = aiSettings.style || '严谨'
        
        // 检查是否已经达到最大问题数量
        if (this.questions.length >= maxQuestions) {
          // 达到最大问题数量，显示建议提示
          this.showSuggestionPrompt = true
          return
        }
        
        // 出错时使用优化的模拟问题，考虑用户设置的深度和风格
        const optimizedQuestion = this.generateOptimizedQuestion(this.currentTopic, depth, style)
        
        // 保存生成的问题
        this.questions.push(optimizedQuestion)
        this.currentQuestionIndex++
        this.conversationHistory.push({ role: 'assistant', content: optimizedQuestion })
        
        // 保存会话
        this.saveSession()
      } finally {
        this.isLoading = false
      }
    },
    
    // 提取所有对话中的关键词
    extractAllKeywords() {
      let allKeywords = []
      
      // 从当前话题提取关键词
      allKeywords = allKeywords.concat(this.extractKeywords(this.currentTopic))
      
      // 从所有回答中提取关键词
      this.answers.forEach(answer => {
        allKeywords = allKeywords.concat(this.extractKeywords(answer))
      })
      
      // 去重并返回前5个关键词
      return [...new Set(allKeywords)].slice(0, 5)
    },
    
    // 提取关键词（智能版，准确识别用户意图和情感）
    extractKeywords(text) {
      // 过滤掉停用词
      const stopWords = ['的', '了', '是', '在', '我', '有', '和', '就', '不', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '他', '她', '它', '我们', '你们', '他们', '她们', '它们', '来', '去', '说', '做', '想', '能', '不能', '可以', '不可以', '应该', '不应该', '会', '不会', '要', '不要', '比如', '最近', '发生', '一件', '事', '好像', '不知道', '什么时候', '才能', '彻底', '已经', '开始', '越', '越', '啊', '哦', '呢', '吧', '呀', '吗', '唉', '哎', '哼', '哈', '嘿', '嘻', '嗯', '哦', '呵', '啦', '啦', '嘛', '哟', '哒', '呢', '咯']
      
      // 确保text是字符串
      if (!text || typeof text !== 'string') {
        return []
      }
      
      // 特殊处理：先提取复合关键词（老人、孩子、带孩子等）
      let words = []
      
      // 检查并提取复合关键词
      const compoundKeywords = ['老人', '孩子', '带孩子', '育儿', '家庭', '成长', '认知', '控制', '苦恼', '闹心']
      compoundKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          words.push(keyword)
        }
      })
      
      // 然后进行普通分词，使用更安全的方式替代正则表达式
      let normalWords = []
      try {
        // 使用split方法分割字符串，避免正则表达式的flags属性错误
        const separators = [' ', ',', '，', '.', '。', '、', '！', '!', '?', '？', '；', ';', '：', ':']
        let tempText = text
        
        // 替换所有分隔符为空格
        separators.forEach(sep => {
          tempText = tempText.split(sep).join(' ')
        })
        
        // 按空格分割并过滤
        normalWords = tempText.split(' ').filter(word => {
          const trimmedWord = word.trim()
          return trimmedWord && !stopWords.includes(trimmedWord) && trimmedWord.length > 1
        })
      } catch (error) {
        console.error('分词失败:', error)
        normalWords = []
      }
      
      // 合并两种方式提取的关键词
      words = [...words, ...normalWords]
      
      // 计算关键词权重
      const wordWeights = {}
      words.forEach(word => {
        wordWeights[word] = (wordWeights[word] || 0) + 1
      })
      
      // 情感词和期待词（更全面的情感词汇表）
      const emotionWords = [
        // 积极情感
        '向往', '期待', '希望', '想要', '渴望', '盼望', '憧憬', '梦想', '喜欢', '爱', '想去', '想看', '想做', '愿意', '开心', '快乐', '高兴', '愉悦', '兴奋', '激动', '满足', '满意', '幸福', '欣慰', '感动', '惊喜', '惊喜', '自豪', '自信', '安心', '放心', '轻松', '愉快', '舒服', '舒坦', '惬意', '悠闲', '自在', '自由', '享受', '陶醉', '沉迷', '入迷',
        // 消极情感
        '烦恼', '痛苦', '难受', '不舒服', '压力', '焦虑', '担忧', '担心', '恐惧', '害怕', '不安', '不满', '失望', '沮丧', '挫折', '失败', '损失', '伤害', '生气', '愤怒', '恼火', '烦躁', '急躁', '着急', '紧张', '焦虑', '忧郁', '悲伤', '难过', '伤心', '悲痛', '绝望', '无助', '孤独', '寂寞', '空虚', '无聊', '疲惫', '累', '困倦', '疲惫', '厌倦', '厌恶', '反感', '讨厌', '憎恨', '怨恨',
        // 中性情感
        '好奇', '疑惑', '怀疑', '困惑', '迷茫', '犹豫', '迟疑', '纠结', '矛盾', '复杂', '平淡', '平静', '冷静', '理性', '客观', '主观', '感性', '直觉', '感觉', '感受', '体验', '经历', '回忆', '怀念', '想念', '思念'
      ]
      
      // 核心主题词（动态识别，不需要预定义具体主题）
      const isCoreTheme = (word) => {
        // 排除情感词和常用词，剩下的就是核心主题词
        return !emotionWords.includes(word) && !stopWords.includes(word) && word.length > 1
      }
      
      // 优先保留情感词、核心主题词和高频词
      const sortedWords = Object.entries(wordWeights)
        .sort(([wordA, weightA], [wordB, weightB]) => {
          // 情感词优先
          const isEmotionA = emotionWords.includes(wordA)
          const isEmotionB = emotionWords.includes(wordB)
          if (isEmotionA && !isEmotionB) return -1
          if (!isEmotionA && isEmotionB) return 1
          
          // 然后是核心主题词
          const isCoreA = isCoreTheme(wordA)
          const isCoreB = isCoreTheme(wordB)
          if (isCoreA && !isCoreB) return -1
          if (!isCoreA && isCoreB) return 1
          
          // 最后按权重排序
          return weightB - weightA
        })
        .map(([word]) => word)
      
      // 去重并返回前5个关键词
      return [...new Set(sortedWords)].slice(0, 5)
    },
    
    // 生成深度问题，基于深度思考引导者工作手册的三维思考引擎
    generateDeepQuestion(keywords, currentAnswer) {
      // 基于对话深度确定思考引导阶段
      const questionDepth = this.questions.length
      
      // 提取原话题的核心关键词，建立思考锚点
      const topicKeywords = this.extractKeywords(this.currentTopic)
      
      // 合并所有关键词，优先使用当前回答的关键词
      const allKeywords = [...new Set([...keywords, ...topicKeywords])].slice(0, 5)
      
      // 确定核心关键词
      const coreKeyword = allKeywords[0] || this.currentTopic
      
      // 分析用户情感：判断是否为情感表达
      const isPositiveEmotion = this.currentTopic.includes('啦') || this.currentTopic.includes('哦') || this.currentTopic.includes('啊') || 
                                this.currentTopic.includes('开心') || this.currentTopic.includes('快乐') || 
                                this.currentTopic.includes('高兴') || this.currentTopic.includes('愉悦') ||
                                this.currentTopic.includes('很快') || this.currentTopic.includes('终于') ||
                                this.currentTopic.includes('期待') || this.currentTopic.includes('希望')
      
      const isEmotionExpression = isPositiveEmotion || 
                                  this.currentTopic.includes('难过') || this.currentTopic.includes('痛苦') ||
                                  this.currentTopic.includes('烦恼') || this.currentTopic.includes('焦虑')
      
      // 分析对话历史，判断用户意图
      const isUserJustExpressingEmotion = isEmotionExpression && 
                                          !this.currentTopic.includes('？') && 
                                          !this.currentTopic.includes('吗') && 
                                          !this.currentTopic.includes('呢') &&
                                          !this.currentTopic.includes('什么') &&
                                          !this.currentTopic.includes('怎么') &&
                                          !this.currentTopic.includes('如何')
      
      // 三维思考引擎：融合苏格拉底诘问、第一性原理、金字塔理论
      const threeDimensionalQuestions = {
        // 情感表达专用问题 - 关注情感和意义
        emotion: [
          `"${coreKeyword}"给您带来了什么样的感受？`,
          `是什么让您对"${coreKeyword}"有这样的感受？`,
          `"${coreKeyword}"对您来说意味着什么？`,
          `您希望"${coreKeyword}"能给您带来什么？`,
          `这种感受会如何影响您接下来的状态？`
        ],
        
        // 第一步：表象拆解（苏格拉底式诘问）- Why层面
        surface: [
          `您认为"${coreKeyword}"的具体表现是什么？`,
          `这些表现背后您观察到了哪些规律或模式？`,
          `是什么让您觉得这是一个需要关注的问题？`,
          `这个问题对您的影响体现在哪些具体场景中？`,
          `您之前对这个问题有过哪些认知或假设？`
        ],
        
        // 第二步：本质穿透（马斯克式第一性原理）- How层面
        essence: [
          `如果我们剥离所有非必要因素，"${coreKeyword}"的本质是什么？`,
          `这个问题的根本驱动力是什么？`,
          `您认为解决这个问题的核心阻碍是什么？`,
          `如果从第一性原理出发，您会如何重新定义这个问题？`,
          `这个问题与其他领域的哪些问题具有相似的本质？`
        ],
        
        // 第三步：结构重建（金字塔理论）- What层面
        structure: [
          `基于您的思考，这个问题的核心结论是什么？`,
          `支持这个结论的关键论据有哪些？`,
          `您认为可以采取哪些具体行动来解决这个问题？`,
          `这些行动的优先级应该如何排序？`,
          `您将如何验证这些行动的效果？`
        ]
      }
      
      // 根据对话深度和用户意图确定思考阶段
      let questionPool
      if (isUserJustExpressingEmotion) {
        // 如果用户只是在表达情感，使用情感专用问题
        questionPool = threeDimensionalQuestions.emotion
      } else if (questionDepth < 2) {
        // 前两轮：表象拆解，苏格拉底式诘问
        questionPool = threeDimensionalQuestions.surface
      } else if (questionDepth < 4) {
        // 中间两轮：本质穿透，第一性原理
        questionPool = threeDimensionalQuestions.essence
      } else {
        // 最后一轮：结构重建，金字塔理论
        questionPool = threeDimensionalQuestions.structure
      }
      
      // 随机选择一个问题，但确保与上一轮对话相关
      // 避免重复问题，检查是否已经问过类似问题
      const askedQuestions = this.questions
      const availableQuestions = questionPool.filter(q => !askedQuestions.includes(q))
      
      // 如果所有问题都问过了，重新选择
      const selectedQuestion = availableQuestions.length > 0 
        ? availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
        : questionPool[Math.floor(Math.random() * questionPool.length)]
      
      // 生成问题
      return selectedQuestion
    },
    
    // 生成AI建议（个性化版，基于对话历史生成具体建议）
    async generateSuggestions() {
      this.isLoading = true
      this.error = null
      
      try {
        // 构建对话历史，包括当前话题、所有问题和所有回答
        const messages = [
          {
            role: 'system',
            content: `你是「三维思考引擎」，融合苏格拉底的诘问智慧、马斯克的第一性原理穿透力、金字塔理论的结构化思维框架，核心职责是通过层层追问，帮助用户穿透问题表象、触及本质，最终形成可落地的思考结论。

## 核心职责
1. 通过层层追问，帮助用户穿透问题表象、触及本质
2. 融合苏格拉底的诘问智慧、马斯克的第一性原理、金字塔理论
3. 生成深度、有递进关系、支持不同风格的问题
4. 基于用户的对话历史，生成个性化的AI建议

## 建议生成要求
1. 基于用户的对话历史，生成具体、个性化的AI建议
2. 建议要具有深度和启发性，能够引导用户深入思考
3. 避免使用固定模板，每个建议都要根据话题内容定制
4. 建议要具有可操作性，能够指导用户采取具体行动
5. 建议要与用户的对话内容高度相关，不能脱离上下文
6. 建议要符合用户的语言风格和思维方式

现在，请根据用户提供的对话历史，生成4条个性化的AI建议，每条建议要具体、有深度、有可操作性。`
          },
          {
            role: 'user',
            content: `话题：${this.currentTopic}\n问题和回答：${[...this.questions, ...this.answers].join('\n')}`
          }
        ]
        
        // 直接调用chatRequest函数，使用大模型生成建议
        const response = await chatRequest(messages)
        
        // 验证API返回结果
        if (response && response.output && response.output.text) {
          // 解析生成的建议，假设返回格式是分行的建议
          const suggestions = response.output.text.split('\n')
            .map(s => s.trim())
            .filter(s => s && s.length > 5)
            .filter(s => !s.startsWith('AI建议') && !s.startsWith('建议：'))
            .slice(0, 4)
          
          this.suggestions = suggestions
        } else {
          // API返回格式异常，使用基于对话内容生成的智能建议
          // 提取对话历史中的关键词
          const topicKeywords = this.extractKeywords(this.currentTopic)
          const allKeywords = this.extractAllKeywords()
          
          // 基于对话内容生成更具体的通用建议
          this.suggestions = [
            `基于你的对话，我注意到你对${this.currentTopic}的思考主要集中在${allKeywords.join('、')}等方面。建议你从这些核心关键词入手，进一步深入分析问题的本质。`,
            `你提到的${topicKeywords[0]}是一个很好的切入点，建议你围绕这个关键词，尝试从不同角度进行思考，比如从时间维度、空间维度、关系维度等。`,
            `根据你的回答，我建议你制定一个具体的行动计划，将你的思考转化为实际行动。可以先从最容易实现的小步骤开始，逐步推进。`,
            `持续反思是成长的关键。建议你定期回顾这次对话，评估你的思考过程和结果，不断优化你的思考方式和问题解决能力。`
          ]
        }
        
        this.showSuggestionPrompt = false
      } catch (error) {
        console.error('生成建议失败:', error)
        this.error = error.message
        // 生成默认建议
        this.suggestions = [
          "深度分析：建议从不同角度深入分析问题，找出根本原因。",
          "制定计划：根据分析结果，制定具体的解决方案和行动计划。",
          "行动实施：按照计划采取行动，并定期评估效果。",
          "持续改进：根据反馈调整解决方案，不断优化和改进。"
        ]
        this.showSuggestionPrompt = false
      } finally {
        this.isLoading = false
      }
    },
    
    // 跳过建议
    skipSuggestions() {
      this.showSuggestionPrompt = false
    },
    
    // 保存当前回答
    saveCurrentAnswer(answer) {
      this.answers[this.currentQuestionIndex] = answer
    },
    
    // 清除会话
    clearCurrentSession() {
      this.currentTopic = ''
      this.currentTopicType = 'other'
      this.questions = []
      this.answers = []
      this.currentQuestionIndex = 0
      this.error = null
      this.showSuggestionPrompt = false
      this.suggestions = []
      this.conversationHistory = []
    }
  }
})