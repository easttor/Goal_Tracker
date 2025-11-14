// Simple test script to verify Supabase authentication works
const SUPABASE_URL = 'https://poadoavnqqtdkqnpszaw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYWRvYXZucXF0ZGtxbnBzemF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTM1NTgsImV4cCI6MjA3NzY4OTU1OH0.3nZZjRvIsGm2twqkSHP0UN8kCjgLpy5FYo7mBCLUoag'

async function testAuth() {
    console.log('Testing anonymous authentication...')
    
    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({})
    })
    
    const data = await response.json()
    console.log('Auth response:', JSON.stringify(data, null, 2))
    
    if (data.user) {
        console.log('✓ Anonymous authentication successful')
        console.log('User ID:', data.user.id)
        return data.user.id
    } else {
        console.log('✗ Authentication failed')
        return null
    }
}

testAuth().catch(console.error)
