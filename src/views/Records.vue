<template>
  <div class="records">
    <div class="container">
      <h2>我的思考记录</h2>
      
      <div v-if="records.length === 0" class="no-records">
        <p>暂无思考记录</p>
        <el-button type="primary" @click="router.push('/')">开始思考</el-button>
      </div>
      
      <div v-else class="records-list">
        <el-card 
          v-for="record in records" 
          :key="record.id"
          class="record-card"
        >
          <div class="record-header">
            <h3>{{ record.topic }}</h3>
            <div class="record-meta">
              <el-tag size="small">{{ record.topicType }}</el-tag>
              <span class="record-date">{{ formatDate(record.createdAt) }}</span>
            </div>
          </div>
          
          <div class="record-content">
            <div class="questions-preview">
              <h4>提问预览</h4>
              <ul>
                <li v-for="(question, index) in record.questions.slice(0, 3)" :key="index">
                  {{ question }}
                </li>
                <li v-if="record.questions.length > 3" class="more-questions">
                  还有 {{ record.questions.length - 3 }} 个提问...
                </li>
              </ul>
            </div>
            
            <div class="record-actions">
              <el-button size="small" @click="viewRecord(record)">查看详情</el-button>
              <el-button size="small" type="danger" @click="deleteRecord(record.id)">删除</el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRecordStore } from '../store/record'

const router = useRouter()
const recordStore = useRecordStore()

const records = computed(() => recordStore.records)

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 查看记录详情
const viewRecord = (record) => {
  router.push(`/records/${record.id}`)
}

// 删除记录
const deleteRecord = (id) => {
  recordStore.deleteRecord(id)
}
</script>

<style scoped>
.records {
  padding: 2rem 0;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.record-card {
  margin-bottom: 1rem;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.record-header h3 {
  margin: 0;
  font-size: 1.2rem;
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

.record-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.questions-preview {
  flex: 1;
}

.questions-preview ul {
  margin: 0;
  padding-left: 1.5rem;
}

.questions-preview li {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.more-questions {
  color: var(--text-secondary);
  font-style: italic;
}

.record-actions {
  display: flex;
  gap: 0.5rem;
}

.no-records {
  text-align: center;
  padding: 3rem;
  background: #f5f7fa;
  border-radius: 8px;
  margin: 2rem 0;
}
</style>
