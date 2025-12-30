<template>
  <div class="thinking">
    <div class="container">
      <div class="thinking-header">
        <h2>{{ currentTopic }}</h2>
        <el-tag size="small">{{ topicType }}</el-tag>
      </div>
      
      <div class="thinking-content">
        <div class="questions-section">
          <h3>苏格拉底的提问</h3>
          
          <!-- 加载状态 -->
          <div v-if="isLoading" class="loading">
            <el-skeleton :rows="3" animated></el-skeleton>
          </div>
          
          <!-- 无问题状态 -->
          <div v-else-if="!currentQuestion" class="no-questions">
            <p>暂无提问，请点击"开始思考"按钮</p>
            <el-button type="primary" @click="generateFirstQuestion">开始思考</el-button>
          </div>
          
          <!-- 显示当前问题 -->
          <div v-else class="current-question">
            <!-- 问题导航器 -->
            <div class="question-navigator">
              <h4>问题导航</h4>
              <div class="question-list">
                <div 
                  v-for="(question, index) in questions" 
                  :key="index"
                  class="question-nav-item"
                  :class="{ 'active': index === currentQuestionIndex, 'answered': answers[index] }"
                  @click="goToQuestion(index)"
                >
                  <span class="question-nav-number">{{ index + 1 }}</span>
                  <span class="question-nav-content">{{ question.substring(0, 30) }}...</span>
                </div>
              </div>
            </div>
            
            <div class="question-item">
              <div class="question-header">
                <div class="question-number">{{ currentQuestionIndex + 1 }}</div>
                <div class="question-content">{{ currentQuestion }}</div>
              </div>
              <!-- 显示AI对用户反问的回答 -->
              <div v-if="counterAnswer" class="counter-answer">
                <div class="counter-answer-label">AI回答：</div>
                <div class="counter-answer-content">{{ counterAnswer }}</div>
              </div>
              <el-input 
                v-model="currentAnswer" 
                placeholder="请输入您的回答..." 
                type="textarea"
                :rows="3"
                resize="none"
                @input="saveCurrentAnswer"
              ></el-input>
            </div>
            
            <!-- 问题导航按钮 -->
            <div class="question-navigation">
              <el-button 
                type="default" 
                @click="goToPreviousQuestion"
                :disabled="currentQuestionIndex === 0 || isLoading"
              >
                上一个问题
              </el-button>
              
              <el-button 
                type="primary" 
                @click="generateNextQuestion" 
                :loading="isLoading"
                :disabled="!currentAnswer.trim() && hasNextQuestion || isLoading"
              >
                {{ hasNextQuestion ? '下一个问题' : '完成思考' }}
              </el-button>
            </div>
          </div>
          
          <!-- 建议提示 -->
          <div v-if="showSuggestionPrompt" class="suggestion-prompt">
            <div class="prompt-content">
              <p>您已经完成了所有问题的回答。</p>
              <p>是否想听一听我的建议？</p>
            </div>
            <div class="prompt-actions">
              <el-button type="primary" @click="generateSuggestions" :loading="isLoading">
                想听建议
              </el-button>
              <el-button @click="skipSuggestions">不需要，谢谢</el-button>
            </div>
          </div>
          
          <!-- AI建议 -->
          <div v-if="suggestions.length > 0" class="suggestions-section">
            <h4>AI建议</h4>
            <div class="suggestions-list">
              <div v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-item">
                <div class="suggestion-number">{{ index + 1 }}</div>
                <div class="suggestion-content">{{ suggestion }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="actions-section">
          <el-button @click="saveRecord">保存记录</el-button>
          <el-button @click="router.back()">返回首页</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '../store/question'
import { useRecordStore } from '../store/record'

const router = useRouter()
const questionStore = useQuestionStore()
const recordStore = useRecordStore()

// 从store获取状态
const currentTopic = computed(() => questionStore.currentTopic)
const topicType = computed(() => questionStore.currentTopicType)
const questions = computed(() => questionStore.questions)
const answers = computed(() => questionStore.answers)
const currentQuestion = computed(() => questionStore.currentQuestion)
const currentQuestionIndex = computed(() => questionStore.currentQuestionIndex)
const isLoading = computed(() => questionStore.isLoading)
const hasNextQuestion = computed(() => questionStore.hasNextQuestion)
const isLastQuestion = computed(() => questionStore.isLastQuestion)
const showSuggestionPrompt = computed(() => questionStore.showSuggestionPrompt)
const suggestions = computed(() => questionStore.suggestions)
const counterAnswer = computed(() => questionStore.counterAnswer)

// 用户当前回答
const currentAnswer = ref('')

// 生成第一个问题
const generateFirstQuestion = async () => {
  if (!currentTopic.value) {
    router.push('/')
    return
  }
  
  try {
    // 使用try-catch确保不会抛出异常
    await questionStore.generateFirstQuestion(currentTopic.value, topicType.value)
  } catch (error) {
    console.error('生成第一个问题失败:', error)
    // 生成失败时，显示错误信息并提供返回首页的选项
    alert('生成问题失败，请返回首页重新尝试')
    router.push('/')
  }
}

// 基于当前回答生成下一个问题
const generateNextQuestion = async () => {
  if (!currentAnswer.value.trim()) {
    return
  }
  
  await questionStore.generateNextQuestion(currentAnswer.value)
  // 重置当前回答
  currentAnswer.value = ''
}

// 返回上一个问题
const goToPreviousQuestion = () => {
  questionStore.goToPreviousQuestion()
  // 更新当前回答
  currentAnswer.value = questionStore.currentAnswer || ''
}

// 前进到下一个问题
const goToNextQuestion = () => {
  questionStore.goToNextQuestion()
  // 更新当前回答
  currentAnswer.value = questionStore.currentAnswer || ''
}

// 跳转到指定问题
const goToQuestion = (index) => {
  // 保存当前回答
  if (currentAnswer.value.trim()) {
    questionStore.saveCurrentAnswer(currentAnswer.value)
  }
  // 跳转到指定问题
  questionStore.currentQuestionIndex = index
  // 更新当前回答
  currentAnswer.value = questionStore.currentAnswer || ''
}

// 保存当前回答
const saveCurrentAnswer = () => {
  questionStore.saveCurrentAnswer(currentAnswer.value)
  questionStore.saveSession()
}

// 生成AI建议
const generateSuggestions = async () => {
  await questionStore.generateSuggestions()
}

// 跳过建议
const skipSuggestions = () => {
  questionStore.skipSuggestions()
}

// 保存记录
const saveRecord = () => {
  if (questionStore.questions.length === 0) {
    return
  }
  
  recordStore.addRecord({
    topic: currentTopic.value,
    topicType: topicType.value,
    questions: questionStore.questions,
    answers: questionStore.answers
  })
  
  router.push('/records')
}

// 页面加载时自动生成第一个问题或恢复会话
onMounted(async () => {
  // 尝试恢复会话
  const sessionRestored = questionStore.restoreSession()
  
  // 检查是否有当前话题
  if (!currentTopic.value) {
    // 如果没有话题，返回首页
    router.push('/')
    return
  }
  
  // 如果没有问题，生成第一个问题
  if (questionStore.questions.length === 0) {
    await generateFirstQuestion()
  }
  
  // 更新当前回答
  currentAnswer.value = questionStore.currentAnswer || ''
})

// 组件卸载时保存会话
onBeforeUnmount(() => {
  questionStore.saveSession()
})
</script>

<style scoped>
.thinking {
  padding: 2rem 0;
}

.thinking-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.thinking-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.questions-section {
  margin-bottom: 2rem;
}

/* 当前问题样式 */
.current-question {
  margin-bottom: 2rem;
}

/* AI反问回答样式 */
.counter-answer {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  font-size: 0.95rem;
  line-height: 1.6;
}

.counter-answer-label {
  font-weight: 600;
  color: #52c41a;
  margin-bottom: 0.5rem;
}

.counter-answer-content {
  color: var(--text-primary);
}

/* 问题导航器样式 */
.question-navigator {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.question-navigator h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.question-nav-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  line-height: 1.5;
}

.question-nav-item:hover {
  background-color: #ecf5ff;
  border-color: #91d5ff;
  transform: translateX(4px);
}

.question-nav-item.active {
  background-color: #e6f7ff;
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.question-nav-item.answered {
  border-left: 3px solid #52c41a;
}

.question-nav-number {
  min-width: 20px;
  flex-shrink: 0;
  font-weight: bold;
  color: var(--primary-color);
  margin-top: 0.1rem;
}

.question-nav-content {
  flex: 1;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
}

/* 滚动条样式 - 增强浏览器兼容性 */
/* WebKit浏览器滚动条样式 */
.question-list::-webkit-scrollbar {
  width: 6px;
}

.question-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.question-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.question-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Firefox浏览器滚动条样式 */
.question-list {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

/* IE/Edge浏览器滚动条样式 */
@supports (-ms-ime-align: auto) {
  .question-list {
    -ms-overflow-style: -ms-autohiding-scrollbar;
  }
}

.question-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.question-number {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--primary-color);
  min-width: 24px;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.question-content {
  flex: 1;
  font-size: 1.1rem;
  word-break: break-word;
  white-space: normal;
  line-height: 1.6;
  color: var(--text-primary);
}

/* 问题导航按钮 */
.question-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
  gap: 1rem;
}

.question-navigation .el-button {
  flex: 1;
  min-width: 120px;
}

.question-navigation .el-button--primary {
  flex: 2;
}

/* 建议提示样式 */
.suggestion-prompt {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
}

.prompt-content {
  margin-bottom: 1.5rem;
}

.prompt-content p {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.prompt-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* AI建议样式 */
.suggestions-section {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
}

.suggestions-section h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.suggestion-item {
  display: flex;
  gap: 0.75rem;
}

.suggestion-number {
  font-size: 1rem;
  font-weight: bold;
  color: var(--success-color);
  min-width: 20px;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.suggestion-content {
  flex: 1;
  line-height: 1.6;
  color: var(--text-primary);
  word-break: break-word;
}

/* 操作按钮 */
.actions-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

/* 加载状态 */
.loading {
  margin: 2rem 0;
}

/* 无问题状态 */
.no-questions {
  text-align: center;
  padding: 3rem;
  background: #f5f7fa;
  border-radius: 8px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  /* 优化整体容器 */
  .thinking {
    padding: 1rem 0;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  /* 优化思考内容区域 */
  .thinking-content {
    padding: 1rem;
  }
  
  /* 优化问题导航器 */
  .question-navigator {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .question-list {
    max-height: 150px;
  }
  
  .question-nav-item {
    padding: 0.6rem;
    font-size: 0.85rem;
  }
  
  /* 优化问题项 */
  .question-item {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .question-header {
    gap: 0.5rem;
  }
  
  .question-number {
    font-size: 1.1rem;
  }
  
  .question-content {
    font-size: 1rem;
  }
  
  /* 优化AI反问回答 */
  .counter-answer {
    padding: 0.8rem;
    margin: 0.8rem 0;
    font-size: 0.9rem;
  }
  
  /* 优化问题导航按钮 */
  .question-navigation {
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  
  .question-navigation .el-button {
    flex: 1;
    min-width: auto;
    width: 100%;
  }
  
  /* 优化建议提示 */
  .suggestion-prompt {
    padding: 1rem;
    margin: 1.5rem 0;
  }
  
  .prompt-actions {
    flex-direction: column;
    gap: 0.5rem;
    justify-content: stretch;
  }
  
  /* 优化AI建议 */
  .suggestions-section {
    padding: 1rem;
    margin: 1.5rem 0;
  }
  
  .suggestions-section h4 {
    font-size: 1rem;
  }
  
  .suggestion-item {
    gap: 0.5rem;
  }
  
  /* 优化操作按钮 */
  .actions-section {
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }
}
</style>
