import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

console.log('[MINIMAL] Starting minimal test app')

function MinimalApp() {
  console.log('[MINIMAL] Rendering MinimalApp')
  return (
    <div style={{ padding: '20px', fontSize: '24px', color: '#000', backgroundColor: '#fff' }}>
      <h1 style={{ color: '#6366f1' }}>Goals Tracker App</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db' }}>
        <p>Status: App loaded successfully</p>
        <p>Time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  document.body.innerHTML = '<div style="color:red;padding:20px;">ERROR: Root element not found!</div>'
  throw new Error('Root element not found')
}

console.log('[MINIMAL] Root element found, rendering')

createRoot(rootElement).render(
  <StrictMode>
    <MinimalApp />
  </StrictMode>,
)

console.log('[MINIMAL] Render complete')
