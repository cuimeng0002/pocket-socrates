<template>
  <div class="settings">
    <div class="container">
      <h2>设置</h2>
      
      <el-card class="settings-card">
        <h3>AI设置</h3>
        <el-form label-width="120px">
          <el-form-item label="提问深度">
            <el-slider v-model="aiSettings.depth" :min="1" :max="3" :marks="{ 1: '基础', 2: '进阶', 3: '专家' }"></el-slider>
          </el-form-item>
          
          <el-form-item label="提问数量">
            <el-input-number v-model="aiSettings.count" :min="3" :max="10" :step="1"></el-input-number>
          </el-form-item>
          
          <el-form-item label="提问风格">
            <el-radio-group v-model="aiSettings.style">
              <el-radio label="严谨">严谨</el-radio>
              <el-radio label="轻松">轻松</el-radio>
              <el-radio label="幽默">幽默</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        
        <div class="actions">
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
          <el-button @click="resetSettings">重置</el-button>
          <el-button @click="goBackToConversation">返回对话</el-button>
        </div>
      </el-card>
      
      <el-card class="settings-card">
        <h3>意见反馈</h3>
        <el-form label-width="120px" ref="feedbackFormRef" :model="feedbackForm" status-icon>
          <el-form-item label="反馈类型" prop="type" required>
            <el-select v-model="feedbackForm.type" placeholder="请选择反馈类型">
              <el-option label="功能建议" value="suggestion"></el-option>
              <el-option label="bug报告" value="bug"></el-option>
              <el-option label="体验优化" value="experience"></el-option>
              <el-option label="其他" value="other"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="反馈内容" prop="content" required>
            <el-input 
              v-model="feedbackForm.content" 
              type="textarea" 
              :rows="5" 
              placeholder="请详细描述您的反馈内容"
            ></el-input>
          </el-form-item>
          
          <el-form-item label="联系方式" prop="contact">
            <el-input 
              v-model="feedbackForm.contact" 
              placeholder="请留下您的联系方式（可选）"
            ></el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              @click="submitFeedback" 
              :loading="isSubmitting"
            >
              {{ isSubmitting ? '提交中...' : '提交反馈' }}
            </el-button>
            <el-button @click="resetFeedback">重置</el-button>
          </el-form-item>
        </el-form>
        
        <!-- 反馈列表 -->
        <div class="feedback-list-section">
          <div class="feedback-list-header" @click="toggleFeedbackList">
            <h4>我的反馈列表</h4>
            <span class="toggle-icon">{{ showFeedbackList ? '▼' : '▶' }}</span>
          </div>
          
          <div v-if="showFeedbackList" class="feedback-list">
            <div v-if="feedbacks.length === 0" class="empty-feedback">
              <p>暂无反馈记录</p>
            </div>
            
            <el-timeline v-else>
              <el-timeline-item
                v-for="feedback in feedbacks"
                :key="feedback.id"
                :timestamp="formatDate(feedback.createdAt)"
              >
                <el-card class="feedback-item-card">
                  <div class="feedback-item-header">
                    <el-tag :type="feedback.type === 'bug' ? 'danger' : feedback.type === 'suggestion' ? 'success' : 'info'">
                      {{ formatFeedbackType(feedback.type) }}
                    </el-tag>
                    <el-button 
                      type="danger" 
                      size="small" 
                      circle
                      @click="deleteFeedback(feedback.id)"
                      title="删除反馈"
                    >
                      <i class="el-icon-delete"></i>
                    </el-button>
                  </div>
                  
                  <div class="feedback-item-content">
                    {{ feedback.content }}
                  </div>
                  
                  <div v-if="feedback.contact" class="feedback-item-contact">
                    <strong>联系方式：</strong>{{ feedback.contact }}
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </el-card>
      
      <el-card class="settings-card">
        <h3>关于</h3>
        <div class="about-content">
          <p>口袋里的苏格拉底 v0.1.0</p>
          <p>用提问引发深度思考</p>
          <p>© 2025 口袋里的苏格拉底</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElForm, ElMessageBox } from 'element-plus'

const router = useRouter()

// AI设置
const aiSettings = ref({
  depth: 2,
  count: 5,
  style: '严谨'
})

// 反馈表单引用
const feedbackFormRef = ref(null)

// 反馈表单数据
const feedbackForm = ref({
  type: '',
  content: '',
  contact: ''
})

// 提交状态
const isSubmitting = ref(false)

// 反馈列表
const feedbacks = ref([])
// 显示反馈列表
const showFeedbackList = ref(false)

// 保存设置
const saveSettings = () => {
  // 这里可以保存设置到localStorage或后端
  localStorage.setItem('aiSettings', JSON.stringify(aiSettings.value))
  ElMessage.success('设置已保存')
  console.log('设置已保存:', aiSettings.value)
}

// 重置设置
const resetSettings = () => {
  aiSettings.value = {
    depth: 2,
    count: 5,
    style: '严谨'
  }
}

// 返回对话
const goBackToConversation = () => {
  // 如果有未保存的设置，先保存
  saveSettings()
  // 直接跳转到thinking页面，确保用户能回到对话
  router.push('/thinking')
}

// 加载设置
const loadSettings = () => {
  const saved = localStorage.getItem('aiSettings')
  if (saved) {
    aiSettings.value = JSON.parse(saved)
  }
}

// 加载反馈列表
const loadFeedbacks = () => {
  const saved = localStorage.getItem('feedbacks')
  if (saved) {
    feedbacks.value = JSON.parse(saved).reverse() // 倒序排列，最新的在前面
  }
}

// 初始化时加载设置和反馈列表
onMounted(() => {
  loadSettings()
  loadFeedbacks()
})

// 提交反馈
const submitFeedback = async () => {
  if (!feedbackFormRef.value) return
  
  try {
    await feedbackFormRef.value.validate()
    isSubmitting.value = true
    
    // 这里可以添加实际的反馈提交逻辑，比如调用API
    // 暂时使用模拟提交
    setTimeout(() => {
      // 保存到localStorage
      const feedbacksList = JSON.parse(localStorage.getItem('feedbacks') || '[]')
      feedbacksList.push({
        ...feedbackForm.value,
        id: Date.now(),
        createdAt: new Date().toISOString()
      })
      localStorage.setItem('feedbacks', JSON.stringify(feedbacksList))
      
      ElMessage.success('反馈提交成功，感谢您的参与！')
      resetFeedback()
      loadFeedbacks() // 重新加载反馈列表
      isSubmitting.value = false
    }, 1000)
    
  } catch (error) {
    console.error('表单验证失败:', error)
    isSubmitting.value = false
  }
}

// 重置反馈表单
const resetFeedback = () => {
  if (feedbackFormRef.value) {
    feedbackFormRef.value.resetFields()
  }
  feedbackForm.value = {
    type: '',
    content: '',
    contact: ''
  }
}

// 删除反馈
const deleteFeedback = (id) => {
  ElMessageBox.confirm('确定要删除这条反馈吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从列表中删除
    feedbacks.value = feedbacks.value.filter(item => item.id !== id)
    // 保存到localStorage
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks.value))
    ElMessage.success('反馈已删除')
  }).catch(() => {
    // 取消删除
  })
}

// 切换反馈列表显示
const toggleFeedbackList = () => {
  showFeedbackList.value = !showFeedbackList.value
}

// 格式化反馈类型显示
const formatFeedbackType = (type) => {
  const typeMap = {
    suggestion: '功能建议',
    bug: 'bug报告',
    experience: '体验优化',
    other: '其他'
  }
  return typeMap[type] || type
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}
</script>

<style scoped>
.settings {
  padding: 2rem 0;
}

.settings-card {
  margin-bottom: 2rem;
}

.settings-card h3 {
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
}

.actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
}

.about-content {
  color: var(--text-secondary);
}

/* 反馈列表样式 */
.feedback-list-section {
  margin-top: 2rem;
  border-top: 1px solid #e9ecef;
  padding-top: 1.5rem;
}

.feedback-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
}

.feedback-list-header:hover {
  color: var(--primary-color);
}

.feedback-list-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.toggle-icon {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.feedback-list {
  margin-top: 1rem;
}

.empty-feedback {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: var(--text-secondary);
}

.feedback-item-card {
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.feedback-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.feedback-item-header .el-tag {
  margin-right: 0.5rem;
}

.feedback-item-content {
  margin-bottom: 0.75rem;
  line-height: 1.6;
  color: var(--text-primary);
}

.feedback-item-contact {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #e9ecef;
}

/* 时间线样式 */
.el-timeline {
  padding-left: 0;
}

.el-timeline-item {
  margin-bottom: 1.5rem;
}

.el-timeline-item__timestamp {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .feedback-item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
