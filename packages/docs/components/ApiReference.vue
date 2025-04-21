<template>
  <div class="api-reference">
    <div v-if="loading" class="api-loading">
      <div class="spinner"></div>
      <p>Loading API documentation...</p>
    </div>
    
    <div v-else>
      <div class="api-overview" v-if="moduleData">
        <h2>{{ moduleData.name }}</h2>
        <p v-if="moduleData.summary">{{ moduleData.summary }}</p>
        <div v-if="moduleData.description" v-html="renderMarkdown(moduleData.description)"></div>
      </div>
      
      <div v-if="composables.length > 0" class="api-section">
        <h3>Composables</h3>
        
        <div v-for="composable in composables" :key="composable.name" class="api-item">
          <h4 :id="composable.name">
            {{ composable.name }}
            <a :href="`#${composable.name}`" class="hash-link">#</a>
          </h4>
          
          <div v-if="composable.description" class="api-description" v-html="renderMarkdown(composable.description)"></div>
          
          <div class="api-signature">
            <pre><code>{{ composable.signature }}</code></pre>
          </div>
          
          <div v-if="composable.params && composable.params.length > 0" class="api-params">
            <h5>Parameters</h5>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="param in composable.params" :key="param.name">
                  <td>{{ param.name }}</td>
                  <td><code>{{ param.type }}</code></td>
                  <td v-if="param.description" v-html="renderMarkdown(param.description)"></td>
                  <td v-else>-</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-if="composable.returns" class="api-returns">
            <h5>Returns</h5>
            <p><code>{{ composable.returns.type }}</code></p>
            <div v-if="composable.returns.description" v-html="renderMarkdown(composable.returns.description)"></div>
          </div>
          
          <div v-if="composable.examples && composable.examples.length > 0" class="api-examples">
            <h5>Examples</h5>
            <div v-for="(example, i) in composable.examples" :key="i">
              <div v-if="example.description" v-html="renderMarkdown(example.description)"></div>
              <pre><code>{{ example.code }}</code></pre>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="interfaces.length > 0" class="api-section">
        <h3>Interfaces</h3>
        
        <div v-for="interface_ in interfaces" :key="interface_.name" class="api-item">
          <h4 :id="interface_.name">
            {{ interface_.name }}
            <a :href="`#${interface_.name}`" class="hash-link">#</a>
          </h4>
          
          <div v-if="interface_.description" class="api-description" v-html="renderMarkdown(interface_.description)"></div>
          
          <div class="api-props">
            <h5>Properties</h5>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="prop in interface_.properties" :key="prop.name">
                  <td>{{ prop.name }}</td>
                  <td><code>{{ prop.type }}</code></td>
                  <td v-if="prop.description" v-html="renderMarkdown(prop.description)"></td>
                  <td v-else>-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div v-if="types.length > 0" class="api-section">
        <h3>Types</h3>
        
        <div v-for="type in types" :key="type.name" class="api-item">
          <h4 :id="type.name">
            {{ type.name }}
            <a :href="`#${type.name}`" class="hash-link">#</a>
          </h4>
          
          <div v-if="type.description" class="api-description" v-html="renderMarkdown(type.description)"></div>
          
          <div class="api-signature">
            <pre><code>{{ type.signature }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  module: {
    type: String,
    required: true
  }
})

const loading = ref(true)
const moduleData = ref<any>(null)
const composables = ref<any[]>([])
const interfaces = ref<any[]>([])
const types = ref<any[]>([])

// Render markdown to HTML
function renderMarkdown(markdown: string): string {
  return marked.parse(markdown)
}

// Load API documentation
async function loadApiDocs() {
  loading.value = true
  
  try {
    // In a real implementation, this would fetch from an API or load from generated files
    // For now, we'll use a mock response
    const moduleName = props.module
    
    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (moduleName === 'auth') {
      moduleData.value = {
        name: 'Auth Module',
        summary: 'Authentication utilities for Pincast applications',
        description: 'The auth module provides composables and utilities for user authentication in Pincast applications.'
      }
      
      composables.value = [
        {
          name: 'useAuth',
          description: 'Composable for managing authentication state and operations.',
          signature: 'function useAuth(): AuthComposable',
          returns: {
            type: 'AuthComposable',
            description: 'Object containing authentication state and methods'
          },
          examples: [
            {
              description: 'Basic usage:',
              code: `import { useAuth } from '@pincast/sdk'

// Initialize auth
const auth = useAuth()

// Reactive state
const isAuthenticated = computed(() => auth.isAuthenticated.value)

// Methods
function login() {
  auth.login()
}

function logout() {
  auth.logout()
}`
            }
          ]
        }
      ]
      
      interfaces.value = [
        {
          name: 'AuthComposable',
          description: 'Interface returned by the useAuth composable.',
          properties: [
            { name: 'isAuthenticated', type: 'Ref<boolean>', description: 'Whether the user is currently authenticated' },
            { name: 'isLoading', type: 'Ref<boolean>', description: 'Whether authentication is currently loading' },
            { name: 'userData', type: 'Ref<UserData | null>', description: 'User data if authenticated' },
            { name: 'login', type: '() => void', description: 'Redirect to login page' },
            { name: 'logout', type: '() => void', description: 'Sign out the current user' },
            { name: 'getToken', type: '() => Promise<string | null>', description: 'Get the current authentication token' }
          ]
        },
        {
          name: 'UserData',
          description: 'Interface representing authenticated user data.',
          properties: [
            { name: 'sub', type: 'string', description: 'User ID' },
            { name: 'name', type: 'string', description: 'User\'s display name' },
            { name: 'email', type: 'string', description: 'User\'s email address' },
            { name: 'picture', type: 'string | null', description: 'URL to user\'s profile picture' }
          ]
        }
      ]
    } else {
      // Default empty response
      moduleData.value = {
        name: `${props.module.charAt(0).toUpperCase() + props.module.slice(1)} Module`,
        summary: `API documentation for the ${props.module} module.`,
        description: 'No detailed documentation available yet.'
      }
    }
  } catch (error) {
    console.error('Failed to load API documentation:', error)
  } finally {
    loading.value = false
  }
}

// Watch for module changes
watchEffect(() => {
  if (props.module) {
    loadApiDocs()
  }
})

onMounted(() => {
  loadApiDocs()
})
</script>

<style scoped>
.api-reference {
  margin: 2rem 0;
}

.api-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #2563eb;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.api-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.api-item {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.api-description {
  margin-bottom: 1rem;
}

.api-signature {
  margin-bottom: 1.5rem;
}

.api-signature pre {
  background-color: #1f2937;
  color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.375rem;
  overflow-x: auto;
}

.api-params h5,
.api-returns h5,
.api-examples h5,
.api-props h5 {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid #e5e7eb;
}

th {
  background-color: #f3f4f6;
  font-weight: 600;
}

.hash-link {
  opacity: 0;
  transition: opacity 0.2s;
  margin-left: 0.5rem;
  color: #6b7280;
  text-decoration: none;
}

h4:hover .hash-link {
  opacity: 1;
}
</style>