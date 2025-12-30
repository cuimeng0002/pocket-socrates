import { defineStore } from 'pinia'

export const useRecordStore = defineStore('record', {
  state: () => ({
    records: JSON.parse(localStorage.getItem('thinkingRecords')) || []
  }),
  
  actions: {
    addRecord(record) {
      const newRecord = {
        id: Date.now().toString(),
        topic: record.topic,
        topicType: record.topicType,
        questions: record.questions,
        answers: record.answers,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      this.records.unshift(newRecord)
      this.saveRecords()
    },
    
    deleteRecord(id) {
      this.records = this.records.filter(record => record.id !== id)
      this.saveRecords()
    },
    
    getRecordById(id) {
      return this.records.find(record => record.id === id)
    },
    
    saveRecords() {
      localStorage.setItem('thinkingRecords', JSON.stringify(this.records))
    }
  }
})
