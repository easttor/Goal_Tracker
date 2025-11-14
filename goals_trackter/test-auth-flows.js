import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://poadoavnqqtdkqnpszaw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYWRvYXZucXF0ZGtxbnBzemF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTM1NTgsImV4cCI6MjA3NzY4OTU1OH0.3nZZjRvIsGm2twqkSHP0UN8kCjgLpy5FYo7mBCLUoag';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthFlows() {
  console.log('\n=== Testing Supabase Authentication Flows ===\n');

  // Test 1: Sign up new user
  console.log('Test 1: Sign Up New User');
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'test123456';
  
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });
  
  if (signUpError) {
    console.log('✗ Sign up error:', signUpError.message);
  } else {
    console.log('✓ Sign up successful');
    console.log('  User ID:', signUpData.user?.id);
    console.log('  Email:', signUpData.user?.email);
    console.log('  Email confirmed:', signUpData.user?.email_confirmed_at ? 'Yes' : 'No');
    console.log('  Session exists:', signUpData.session ? 'Yes' : 'No');
  }

  // Test 2: Sign in with demo account
  console.log('\nTest 2: Demo Account Sign In');
  const demoEmail = 'demo@goalsapp.com';
  const demoPassword = 'demo123456';
  
  // Try to sign in first
  let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: demoPassword,
  });
  
  if (signInError && signInError.message.includes('Invalid login credentials')) {
    console.log('  Demo account does not exist, creating...');
    
    // Create demo account
    const { data: demoSignUpData, error: demoSignUpError } = await supabase.auth.signUp({
      email: demoEmail,
      password: demoPassword,
    });
    
    if (demoSignUpError) {
      console.log('✗ Demo account creation error:', demoSignUpError.message);
    } else {
      console.log('✓ Demo account created');
      console.log('  Email confirmed:', demoSignUpData.user?.email_confirmed_at ? 'Yes' : 'No');
      
      // Try signing in again
      const { data: retrySignInData, error: retrySignInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });
      
      if (retrySignInError) {
        console.log('✗ Demo sign in error after creation:', retrySignInError.message);
      } else {
        console.log('✓ Demo sign in successful after creation');
      }
    }
  } else if (signInError) {
    console.log('✗ Demo sign in error:', signInError.message);
  } else {
    console.log('✓ Demo account sign in successful');
    console.log('  User ID:', signInData.user?.id);
  }

  // Test 3: Sign in with newly created account
  console.log('\nTest 3: Sign In With New Account');
  
  // Sign out first
  await supabase.auth.signOut();
  
  const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });
  
  if (newSignInError) {
    console.log('✗ New account sign in error:', newSignInError.message);
  } else {
    console.log('✓ New account sign in successful');
    console.log('  User ID:', newSignInData.user?.id);
  }

  // Test 4: Get current session
  console.log('\nTest 4: Get Current Session');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.log('✗ Session error:', sessionError.message);
  } else if (sessionData.session) {
    console.log('✓ Session exists');
    console.log('  User:', sessionData.session.user?.email);
  } else {
    console.log('✗ No active session');
  }

  console.log('\n=== Tests Complete ===\n');
}

testAuthFlows().catch(console.error);
