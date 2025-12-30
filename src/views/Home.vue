<template>
  <div class="home">
    <div class="container">
      <div class="hero-section fade-in">
        <div class="hero-content">
          <h1 class="hero-title">口袋里的苏格拉底</h1>
          <p class="hero-subtitle">用提问引发深度思考</p>
          <p class="hero-description">让思考成为一种习惯，让智慧照亮生活的每一个角落</p>
        </div>
      </div>
      
      <div class="quick-start card fade-in" style="animation-delay: 0.2s;">
        <div class="topic-input-section">
          <div class="form-group">
            <label for="topic" class="form-label">您想要思考什么？</label>
            <textarea 
              id="topic"
              v-model="topic" 
              placeholder="例如：我想辞职，在体制内工作太无聊了..."
              class="form-textarea"
              rows="3"
              @input="onTopicInput"
            ></textarea>
          </div>
          
          <div class="topic-actions">
            <div class="select-wrapper">
              <label for="topicType" class="form-label">话题类型</label>
              <select 
                id="topicType"
                v-model="topicType"
                class="form-input"
              >
                <option value="work">职场</option>
                <option value="life">生活</option>
                <option value="study">学习</option>
                <option value="other">其他</option>
              </select>
            </div>
            
            <button 
              type="button"
              @click="startThinking"
              class="btn btn-primary pulse"
              :disabled="!topic.trim()"
            >
              开始思考
            </button>
          </div>
        </div>
      </div>
      
      <div class="features fade-in" style="animation-delay: 0.4s;">
        <h2 class="section-title">核心价值</h2>
        <div class="feature-grid">
          <div class="feature-item card">
            <div class="feature-icon">💡</div>
            <h3 class="feature-title">深度追问</h3>
            <p class="feature-description">苏格拉底式层层追问，帮您穿透问题表象，触及本质</p>
          </div>
          <div class="feature-item card">
            <div class="feature-icon">📝</div>
            <h3 class="feature-title">思考记录</h3>
            <p class="feature-description">完整保存您的思考过程，见证思维的成长与进化</p>
          </div>
          <div class="feature-item card">
            <div class="feature-icon">🎯</div>
            <h3 class="feature-title">智能洞察</h3>
            <p class="feature-description">AI驱动的个性化建议，帮您找到行动方向</p>
          </div>
        </div>
      </div>
      
      <!-- 示例展示 -->
      <div class="examples fade-in" style="animation-delay: 0.6s;">
        <h2 class="section-title">开始您的思考之旅</h2>
        <div class="example-grid">
          <div class="example-item" @click="setExampleTopic('我想辞职，在体制内工作太无聊了...')">
            <div class="example-icon">💼</div>
            <div class="example-content">
              <h3>职场困惑</h3>
              <p>我想辞职，在体制内工作太无聊了...</p>
            </div>
          </div>
          <div class="example-item" @click="setExampleTopic('孩子教育问题让我很焦虑...')">
            <div class="example-icon">👨👩👧👦</div>
            <div class="example-content">
              <h3>家庭关系</h3>
              <p>孩子教育问题让我很焦虑...</p>
            </div>
          </div>
          <div class="example-item" @click="setExampleTopic('如何提高学习效率？')">
            <div class="example-icon">📚</div>
            <div class="example-content">
              <h3>学习成长</h3>
              <p>如何提高学习效率？</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '../store/question'

const router = useRouter()
const questionStore = useQuestionStore()

const topic = ref('')
const topicType = ref('other')

// 添加示例话题选择功能
const setExampleTopic = (exampleTopic) => {
  topic.value = exampleTopic
  // 自动识别话题类型
  if (exampleTopic.includes('辞职') || exampleTopic.includes('工作') || exampleTopic.includes('职场')) {
    topicType.value = 'work'
  } else if (exampleTopic.includes('孩子') || exampleTopic.includes('教育') || exampleTopic.includes('家庭')) {
    topicType.value = 'life'
  } else if (exampleTopic.includes('学习') || exampleTopic.includes('效率')) {
    topicType.value = 'study'
  } else {
    topicType.value = 'other'
  }
  
  // 滚动到输入框并使其获得焦点
  setTimeout(() => {
    const textarea = document.getElementById('topic')
    if (textarea) {
      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' })
      textarea.focus()
    }
  }, 100)
}

// 添加输入事件处理
const onTopicInput = () => {
  // 可以在这里添加实时验证或建议
}

const startThinking = () => {
  if (!topic.value.trim()) {
    return
  }
  
  // 初始化新会话，清空旧数据
  questionStore.initSession(topic.value, topicType.value)
  router.push('/thinking')
}
</script>

<style scoped>
.home {
  padding: 2rem 0;
  min-height: calc(100vh - 150px);
}

/* 英雄区域 */
.hero-section {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}



.hero-title {
  font-size: 3rem;
  margin: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin: 0;
  color: var(--text-primary);
  font-weight: 500;
}

.hero-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0;
  line-height: 1.6;
}

/* 浮动动画 - 增强浏览器兼容性 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
    -webkit-transform: translateY(0px);
    -ms-transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
    -webkit-transform: translateY(-10px);
    -ms-transform: translateY(-10px);
  }
}

/* 快速开始区域 */
.quick-start {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  margin: 2rem 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(74, 144, 226, 0.1);
  transition: all 0.3s ease;
}

.quick-start:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.topic-input-section {
  margin-top: 1rem;
}

/* 表单标签样式 */
.form-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
  letter-spacing: 0.3px;
}

/* 确保textarea能够正常显示 */
.form-textarea {
  width: 100%;
  padding: 1.25rem;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
  background-color: #fafbfc;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 140px;
  margin-bottom: 1.5rem;
  box-sizing: border-box;
  font-family: inherit;
  background-image: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
}

.form-textarea::placeholder {
  color: #a0aec0;
  font-style: italic;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.3rem rgba(74, 144, 226, 0.1);
  background-color: white;
  transform: translateY(-1px);
}

/* 确保select和button布局正确 */
.topic-actions {
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.select-wrapper {
  flex: 1;
  min-width: 200px;
}

.form-input {
  width: 100%;
  padding: 1.125rem 1.25rem;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-primary);
  background-color: #fafbfc;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  font-family: inherit;
  background-image: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.3rem rgba(74, 144, 226, 0.1);
  background-color: white;
  transform: translateY(-1px);
}

/* 按钮样式 */
.btn {
  display: inline-block;
  padding: 1.125rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
  min-width: 160px;
  font-family: inherit;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  color: white;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.3);
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.5s ease;
}

.btn-primary:hover:not(:disabled)::before {
  left: 100%;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(74, 144, 226, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  background: #e2e8f0;
}

/* 脉冲动画效果 */
.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(74, 144, 226, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 144, 226, 0);
  }
}

/* 核心价值区域 */
.features {
  margin-top: 5rem;
  padding: 3rem 0;
}

.section-title {
  text-align: center;
  margin-bottom: 3rem;
  color: var(--text-primary);
  font-size: 2.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-item {
  text-align: center;
  padding: 2.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid rgba(74, 144, 226, 0.1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.feature-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-item:hover::before {
  transform: scaleX(1);
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  font-size: 4.5rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
}

.feature-item:hover .feature-icon {
  transform: scale(1.1) rotate(5deg);
}

.feature-title {
  margin: 0.5rem 0 1rem;
  color: var(--text-primary);
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.3;
}

.feature-description {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.7;
  font-size: 1rem;
}

/* 示例展示区域 */
.examples {
  margin-top: 5rem;
  padding-bottom: 4rem;
}

.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.example-item {
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  background-image: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
}

.example-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-color: var(--primary-color);
  background-image: linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%);
}

.example-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
}

.example-item:hover .example-icon {
  transform: scale(1.1) rotate(5deg);
}

.example-content h3 {
  margin: 0 0 0.75rem;
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.3;
}

.example-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 英雄区域 */
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .hero-description {
    font-size: 1rem;
    padding: 0 1rem;
  }
  
  /* 快速开始区域 */
  .quick-start {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  /* 优化话题操作区域的布局 */
  .topic-actions {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .select-wrapper {
    min-width: auto;
  }
  
  .btn {
    min-width: auto;
  }
  
  /* 优化核心价值区域 */
  .feature-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 1rem;
  }
  
  .feature-item {
    padding: 1.5rem;
  }
  
  /* 优化示例展示区域 */
  .example-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 1rem;
  }
  
  .example-item {
    padding: 1.5rem;
  }
}

/* 全局触摸优化 */
.btn, .example-item, .feature-item {
  min-width: 44px;
  min-height: 44px;
  padding: 0.5rem;
}
</style>
