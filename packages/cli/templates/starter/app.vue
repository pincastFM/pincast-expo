<template>
  <div class="app-container">
    <header class="app-header">
      <h1>{{ appTitle }}</h1>
      <div v-if="auth.isAuthenticated" class="user-info">
        Welcome, {{ auth.userData?.name || 'Player' }}
      </div>
      <button v-if="!auth.isAuthenticated" @click="auth.login" class="login-button">
        Login
      </button>
      <button v-else @click="auth.logout" class="logout-button">
        Logout
      </button>
    </header>

    <main class="main-content">
      <NuxtPage />
    </main>

    <footer class="app-footer">
      <p>Built with Pincast SDK</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@pincast/sdk';

// Get app title from pincast config
const appTitle = 'Pincast Adventure';

// Initialize auth
const auth = useAuth();
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2563eb;
  color: white;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.login-button, .logout-button {
  background-color: white;
  color: #2563eb;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.user-info {
  font-size: 0.9rem;
  margin-right: 1rem;
}

.main-content {
  flex: 1;
  padding: 2rem;
}

.app-footer {
  padding: 1rem;
  text-align: center;
  background-color: #f3f4f6;
  font-size: 0.8rem;
  color: #6b7280;
}
</style>