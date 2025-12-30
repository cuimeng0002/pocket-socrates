<template>
  <div class="record-detail">
    <div class="container">
      <h2>思考记录详情</h2>
      
      <div v-if="isLoading" class="loading">
        <el-skeleton :rows="5" animated></el-skeleton>
      </div>
      
      <div v-else-if="!record" class="no-record">
        <p>未找到思考记录</p>
        <el-button type="primary" @click="router.push('/records')">返回列表</el-button>
      </div>
      
      <div v-else class="record-content">
        <el-card class="record-card">
          <div class="record-header">
            <h3>{{ record.topic }}</h3>
            <div class="record-meta">
              <el-tag size="small">{{ record.topicType }}</el-tag>
              <span class="record-date">{{ formatDate(record.createdAt) }}</span>
            </div>
          </div>
          
          <div class="record-questions">
            <h4>问题与回答</h4>
            <div 
              v-for="(question, index) in record.questions" 
              :key="index"
              class="question-item"
            >
              <div class="question">
                <span class="question-number">{{ index + 1 }}.</span>
                <span class="question-content">{{ question }}</span>
              </div>
              <div class="answer">
                <span class="answer-label">我的回答：</span>
                <span class="answer-content">{{ record.answers[index] || '未回答' }}</span>
              </div>
            </div>
          </div>
          
          <div class="record-actions">
            <el-button @click="router.push('/records')">返回列表</el-button>
            <el-button type="primary" @click="showShareModal = true">分享记录</el-button>
          </div>
        </el-card>
      </div>
      
      <!-- 分享模态框 -->
      <el-dialog
        v-model="showShareModal"
        title="分享思考记录"
        width="400px"
        destroy-on-close
      >
        <div class="share-modal-content">
          <div class="share-url-section">
            <p class="share-title">分享链接</p>
            <el-input
              v-model="shareUrl"
              readonly
              placeholder="分享链接"
              class="share-url-input"
            >
              <template #append>
                <el-button @click="copyShareUrl" :loading="isCopying">
                  {{ isCopying ? '复制中...' : '复制链接' }}
                </el-button>
              </template>
            </el-input>
            <p class="share-tip">复制链接后，您可以粘贴到任意平台分享</p>
          </div>
          
          <div class="share-platforms">
            <p class="share-title">分享到社交媒体</p>
            <div class="platforms-grid">
              <!-- 微信好友 -->
              <div class="platform-item" @click="shareToWechat">
                <div class="platform-icon wechat">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.605 15.934c-.481.438-.944.821-1.525 1.117-1.391.764-2.868 1.143-4.416 1.143-1.548 0-3.025-.379-4.416-1.143-.581-.296-1.044-.679-1.525-1.117-.246-.219-.479-.456-.681-.716-.195-.276-.365-.568-.503-.877-.138-.309-.242-.638-.311-.987-.069-.349-.098-.713-.098-1.091 0-.378.029-.742.098-1.091.069-.349.173-.678.311-.987.138-.309.308-.599.503-.877.202-.26.435-.497.681-.716.481-.438.944-.821 1.525-1.117 1.391-.764 2.868-1.143 4.416-1.143s3.025.379 4.416 1.143c.581.296 1.044.679 1.525 1.117.246.219.479.456.681.716.195.276.365.568.503.877.138.309.242.638.311.987.069.349.098.713.098 1.091 0 .378-.029.742-.098 1.091-.069.349-.173.678-.311.987-.138.309-.308.599-.503.877-.202.26-.435.497-.681.716zM9.356 14.733c-.397.357-.78.661-1.157.887-.811.471-1.701.713-2.575.713-.615 0-1.182-.128-1.69-.375-.096-.046-.184-.1-.264-.162.723-.19 1.399-.445 2.062-.763.535-.252 1.018-.567 1.47-.916.44-.353.809-.75 1.071-1.178.275-.448.453-.937.531-1.436.079-.499.12-1.023.12-1.572 0-.549-.041-1.073-.12-1.572-.078-.499-.256-.988-.531-1.436-.262-.428-.631-.825-1.071-1.178-.452-.349-.935-.664-1.47-.916-.663-.318-1.339-.573-2.062-.763-.08.062-.168.116-.264.162-.508.247-1.075.375-1.69.375-.874 0-1.764-.242-2.575-.713-.377-.226-.76-.53-1.157-.887-.367-.336-.678-.721-.941-1.137.187.082.386.157.597.227.942.333 1.952.505 2.983.505.528 0 1.052-.042 1.557-.123.573-.091 1.118-.223 1.66-.389.503-.154.979-.344 1.448-.555.499-.222.968-.479 1.414-.763.45-.289.863-.614 1.24-.961.372-.352.702-.731.986-1.137.334.445.595.926.788 1.43.178.471.272.976.291 1.508.019.532-.053 1.043-.173 1.557-.127.531-.312 1.032-.556 1.518-.234.463-.527.902-.867 1.313-.326.394-.699.748-1.117 1.058-.418.311-.883.577-1.383.794-.498.217-1.03.386-1.594.506-.576.121-1.157.182-1.743.182-.992 0-1.98-.168-2.93-.489-.204-.069-.396-.14-.575-.221.303.448.629.854.98 1.222z"/>
                  </svg>
                </div>
                <p class="platform-name">微信好友</p>
              </div>
              
              <!-- 微信朋友圈 -->
              <div class="platform-item" @click="shareToWechatMoments">
                <div class="platform-icon wechat-moments">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.514 0-10-4.486-10-10S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm1.335-8.361c.845 0 1.533-.688 1.533-1.533s-.688-1.533-1.533-1.533-1.533.688-1.533 1.533.688 1.533 1.533 1.533zm-2.67 0c.845 0 1.533-.688 1.533-1.533s-.688-1.533-1.533-1.533-1.533.688-1.533 1.533.688 1.533 1.533 1.533zm-2.67 0c.845 0 1.533-.688 1.533-1.533s-.688-1.533-1.533-1.533-1.533.688-1.533 1.533.688 1.533 1.533 1.533zM12 19c-3.859 0-7-3.14-7-7 0-1.93.742-3.682 1.938-4.946L12 12l7.062-4.946C18.258 8.318 19 10.07 19 12c0 3.86-3.141 7-7 7z"/>
                  </svg>
                </div>
                <p class="platform-name">朋友圈</p>
              </div>
              
              <!-- 抖音 -->
              <div class="platform-item" @click="shareToDouyin">
                <div class="platform-icon douyin">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.514 0-10-4.486-10-10S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm3.276-7.303l-5.952-3.144c-.148-.078-.333-.078-.481 0l-5.952 3.144c-.199.105-.266.362-.161.561.105.199.362.266.561.161l5.706-3.018 5.706 3.018c.078.041.161.062.243.062.125 0 .25-.041.344-.125.199-.105.266-.362.161-.561z"/>
                  </svg>
                </div>
                <p class="platform-name">抖音</p>
              </div>
              
              <!-- 小红书 -->
              <div class="platform-item" @click="shareToXiaohongshu">
                <div class="platform-icon xiaohongshu">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.514 0-10-4.486-10-10S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm4.996-14.002c-.021-.57-.237-1.074-.585-1.422-.348-.348-.852-.564-1.422-.585-.021-.002-.042-.003-.063-.003-1.105 0-2.005.9-2.005 2.005 0 .021.001.042.003.063-.57.021-1.074.237-1.422.585-.348.348-.564.852-.585 1.422-.002.021-.003.042-.003.063 0 1.105.9 2.005 2.005 2.005.021 0 .042-.001.063-.003.57-.021 1.074-.237 1.422-.585.348-.348.564-.852.585-1.422.002-.021.003-.042.003-.063 1.105 0 2.005-.9 2.005-2.005 0-.021-.001-.042-.003-.063zm-6.571 1.57c-.469 0-.85.381-.85.85s.381.85.85.85.85-.381.85-.85-.381-.85-.85-.85zm6.571 0c-.469 0-.85.381-.85.85s.381.85.85.85.85-.381.85-.85-.381-.85-.85-.85zm0 3.42c-.469 0-.85.381-.85.85s.381.85.85.85.85-.381.85-.85-.381-.85-.85-.85zm-6.571 0c-.469 0-.85.381-.85.85s.381.85.85.85.85-.381.85-.85-.381-.85-.85-.85z"/>
                  </svg>
                </div>
                <p class="platform-name">小红书</p>
              </div>
              
              <!-- 微博 -->
              <div class="platform-item" @click="shareToWeibo">
                <div class="platform-icon weibo">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.971 17.336c-2.617 0-4.745-2.128-4.745-4.745 0-.216.021-.425.062-.633.062-.312.354-.541.677-.479.312.062.541.354.479.677-.021.167-.031.333-.031.501 0 1.938 1.573 3.51 3.51 3.51.5 0 .927-.208 1.239-.552.062-.062.094-.146.062-.239-.031-.083-.115-.135-.208-.125-.229.01-.469.031-.708.031zM9.792 10.286c0 .501-.406.906-.906.906-.501 0-.906-.406-.906-.906s.406-.906.906-.906c.5 0 .906.406.906.906zm6.354 0c0 .501-.406.906-.906.906-.501 0-.906-.406-.906-.906s.406-.906.906-.906c.5 0 .906.406.906.906zm-3.177 3.177c0 .501-.406.906-.906.906-.501 0-.906-.406-.906-.906s.406-.906.906-.906c.5 0 .906.406.906.906zm3.177 0c0 .501-.406.906-.906.906-.501 0-.906-.406-.906-.906s.406-.906.906-.906c.5 0 .906.406.906.906zm-6.354 0c0 .501-.406.906-.906.906-.501 0-.906-.406-.906-.906s.406-.906.906-.906c.5 0 .906.406.906.906zm3.177 3.177c0 .501-.406.906-.906.906-.501 0-.906-.406-.906-.906s.406-.906.906-.906c.5 0 .906.406.906.906zm-6.354 0c0 .501-.406.906-.906.906-.501 0-.906-.406-.906-.906s.406-.906.906-.906c.5 0 .906.406.906.906z"/>
                  </svg>
                </div>
                <p class="platform-name">微博</p>
              </div>
              
              <!-- 复制链接 -->
              <div class="platform-item" @click="copyShareUrl">
                <div class="platform-icon copy">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                </div>
                <p class="platform-name">复制链接</p>
              </div>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecordStore } from '../store/record'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const recordStore = useRecordStore()

const recordId = computed(() => route.params.id)
const record = ref(null)
const isLoading = ref(true)

// 分享模态框
const showShareModal = ref(false)
// 分享链接
const shareUrl = computed(() => {
  return `${window.location.origin}/records/${record.value?.id}`
})
// 复制状态
const isCopying = ref(false)

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 加载记录详情
const loadRecord = () => {
  isLoading.value = true
  try {
    const recordData = recordStore.getRecordById(recordId.value)
    record.value = recordData
  } catch (error) {
    console.error('加载记录详情失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 复制分享链接
const copyShareUrl = async () => {
  if (!shareUrl.value) return
  
  try {
    isCopying.value = true
    await navigator.clipboard.writeText(shareUrl.value)
    ElMessage.success('分享链接已复制到剪贴板')
    showShareModal.value = false
  } catch (error) {
    console.error('复制链接失败:', error)
    ElMessage.error('复制链接失败，请重试')
  } finally {
    isCopying.value = false
  }
}

// 分享到微信好友
const shareToWechat = () => {
  copyShareUrl()
  ElMessage.info('请在微信中粘贴链接分享给好友')
}

// 分享到微信朋友圈
const shareToWechatMoments = () => {
  copyShareUrl()
  ElMessage.info('请在微信朋友圈中粘贴链接分享')
}

// 分享到抖音
const shareToDouyin = () => {
  copyShareUrl()
  ElMessage.info('请在抖音中粘贴链接分享')
}

// 分享到小红书
const shareToXiaohongshu = () => {
  copyShareUrl()
  ElMessage.info('请在小红书笔记中粘贴链接分享')
}

// 分享到微博
const shareToWeibo = () => {
  const shareText = `我的思考记录：${record.value?.topic} ${shareUrl.value}`
  const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl.value)}&title=${encodeURIComponent(shareText)}`
  window.open(weiboUrl, '_blank', 'width=600,height=400')
}

// 页面加载时加载记录详情
onMounted(() => {
  loadRecord()
})
</script>

<style scoped>
.record-detail {
  padding: 2rem 0;
}

.record-card {
  margin-top: 1rem;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.record-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--text-primary);
}

.record-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.record-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.record-questions {
  margin: 1.5rem 0;
}

.record-questions h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.question-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.question {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.question-number {
  font-weight: bold;
  color: var(--primary-color);
  margin-top: 0.25rem;
}

.question-content {
  flex: 1;
  line-height: 1.6;
  color: var(--text-primary);
}

.answer {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.answer-label {
  font-weight: bold;
  color: var(--success-color);
  margin-top: 0.25rem;
}

.answer-content {
  flex: 1;
  line-height: 1.6;
  color: var(--text-primary);
}

.record-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  margin-top: 1.5rem;
}

.loading {
  margin: 2rem 0;
}

.no-record {
  text-align: center;
  padding: 3rem;
  background: #f5f7fa;
  border-radius: 8px;
  margin: 2rem 0;
}

/* 分享模态框样式 */
.share-modal-content {
  padding: 1rem 0;
}

.share-url-section {
  margin-bottom: 1.5rem;
}

.share-title {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.share-url-input {
  margin-bottom: 0.5rem;
}

.share-tip {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.share-platforms {
  margin-top: 1.5rem;
}

.platforms-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.platform-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}

.platform-item:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.platform-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.platform-icon.wechat {
  background-color: #07c160;
}

.platform-icon.wechat-moments {
  background-color: #07c160;
}

.platform-icon.douyin {
  background-color: #fe2c55;
}

.platform-icon.xiaohongshu {
  background-color: #ff2442;
}

.platform-icon.weibo {
  background-color: #e6162d;
}

.platform-icon.copy {
  background-color: #409eff;
}

.platform-name {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .platforms-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .record-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .record-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>