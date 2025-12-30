<template>
  <div id="app">
    <header class="app-header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <h1 class="logo-text">口袋里的苏格拉底</h1>
          </div>
          
          <nav class="nav">
            <router-link to="/" class="nav-item">首页</router-link>
            <router-link to="/records" class="nav-item">思考记录</router-link>
            <router-link to="/settings" class="nav-item">设置</router-link>
          </nav>
        </div>
      </div>
    </header>
    
    <main class="app-main">
      <router-view />
    </main>
    
    <footer class="app-footer">
      <div class="container">
        <p>&copy; 2025 口袋里的苏格拉底 | 用提问引发深度思考</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
// App组件的逻辑
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-text {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.nav {
  display: flex;
  gap: 1.5rem;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.nav-item:hover {
  opacity: 0.8;
}

.nav-item.router-link-active {
  opacity: 0.8;
  border-bottom: 2px solid white;
}

.app-main {
  min-height: calc(100vh - 150px);
  background-color: var(--background-color);
}

.app-footer {
  background: #f8f9fa;
  text-align: center;
  padding: 1rem 0;
  border-top: 1px solid #e9ecef;
}

.app-footer p {
  margin: 0;
  color: #6c757d;
}

/* 响应式导航样式 */
@media (max-width: 768px) {
  /* 优化移动端导航布局 */
  .header-content {
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem;
  }
  
  /* 减小移动端标题字体大小 */
  .logo-text {
    font-size: 1.2rem;
    text-align: center;
  }
  
  /* 优化移动端导航链接 */
  .nav {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav-item {
    font-size: 0.9rem;
    padding: 0.3rem 0.5rem;
    border-radius: 4px;
  }
  
  /* 优化移动端导航链接激活状态 */
  .nav-item.router-link-active {
    border-bottom: none;
    background-color: rgba(255, 255, 255, 0.2);
  }
}

/* 超小屏幕设备优化 */
@media (max-width: 480px) {
  .logo-text {
    font-size: 1rem;
  }
  
  .nav {
    gap: 0.8rem;
  }
  
  .nav-item {
    font-size: 0.85rem;
    padding: 0.25rem 0.4rem;
  }
}
</style>
