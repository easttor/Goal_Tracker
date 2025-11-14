#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Tests the deployed Goals Tracker application
 */

import https from 'https';

const url = 'https://uyraawddj1pn.space.minimax.io';

console.log('========================================');
console.log('Goals Tracker - Deployment Verification');
console.log('========================================\n');

console.log('Testing URL:', url);
console.log('Timestamp:', new Date().toISOString());
console.log('\n--- Running Tests ---\n');

// Test 1: HTTP Status Code
function testHttpStatus() {
    return new Promise((resolve, reject) => {
        console.log('Test 1: Checking HTTP Status...');
        
        https.get(url, (res) => {
            const status = res.statusCode;
            console.log('   Status Code:', status);
            
            if (status === 200) {
                console.log('   ✓ PASS: Server responding correctly\n');
                resolve(true);
            } else {
                console.log('   ✗ FAIL: Unexpected status code\n');
                resolve(false);
            }
        }).on('error', (err) => {
            console.log('   ✗ FAIL: Connection error:', err.message, '\n');
            resolve(false);
        });
    });
}

// Test 2: HTML Content
function testHtmlContent() {
    return new Promise((resolve, reject) => {
        console.log('Test 2: Checking HTML Content...');
        
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const hasHtmlTag = data.includes('<html');
                const hasRootDiv = data.includes('id="root"');
                const hasJsFile = data.includes('.js');
                const hasCssFile = data.includes('.css');
                const hasTitle = data.includes('<title>');
                
                console.log('   HTML tag present:', hasHtmlTag ? '✓' : '✗');
                console.log('   Root div present:', hasRootDiv ? '✓' : '✗');
                console.log('   JS file linked:', hasJsFile ? '✓' : '✗');
                console.log('   CSS file linked:', hasCssFile ? '✓' : '✗');
                console.log('   Title tag present:', hasTitle ? '✓' : '✗');
                
                const allPassed = hasHtmlTag && hasRootDiv && hasJsFile && hasCssFile;
                
                if (allPassed) {
                    console.log('   ✓ PASS: HTML structure is valid\n');
                    resolve(true);
                } else {
                    console.log('   ✗ FAIL: HTML structure incomplete\n');
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            console.log('   ✗ FAIL:', err.message, '\n');
            resolve(false);
        });
    });
}

// Test 3: Content Size
function testContentSize() {
    return new Promise((resolve, reject) => {
        console.log('Test 3: Checking Content Size...');
        
        https.get(url, (res) => {
            let size = 0;
            
            res.on('data', (chunk) => {
                size += chunk.length;
            });
            
            res.on('end', () => {
                console.log('   Content Size:', size, 'bytes');
                
                if (size > 100) {
                    console.log('   ✓ PASS: Content size is reasonable\n');
                    resolve(true);
                } else {
                    console.log('   ✗ FAIL: Content too small (possible error page)\n');
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            console.log('   ✗ FAIL:', err.message, '\n');
            resolve(false);
        });
    });
}

// Test 4: Response Headers
function testHeaders() {
    return new Promise((resolve, reject) => {
        console.log('Test 4: Checking Response Headers...');
        
        https.get(url, (res) => {
            const contentType = res.headers['content-type'];
            const cacheControl = res.headers['cache-control'];
            
            console.log('   Content-Type:', contentType);
            console.log('   Cache-Control:', cacheControl || 'Not set');
            
            const isHtml = contentType && contentType.includes('text/html');
            
            if (isHtml) {
                console.log('   ✓ PASS: Serving HTML content\n');
                resolve(true);
            } else {
                console.log('   ✗ FAIL: Not serving HTML\n');
                resolve(false);
            }
        }).on('error', (err) => {
            console.log('   ✗ FAIL:', err.message, '\n');
            resolve(false);
        });
    });
}

// Run all tests
async function runAllTests() {
    const results = [];
    
    results.push(await testHttpStatus());
    results.push(await testHtmlContent());
    results.push(await testContentSize());
    results.push(await testHeaders());
    
    console.log('========================================');
    console.log('VERIFICATION SUMMARY');
    console.log('========================================\n');
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log('Tests Passed:', passed, '/', total);
    console.log('Tests Failed:', total - passed, '/', total);
    console.log('Success Rate:', Math.round((passed / total) * 100) + '%\n');
    
    if (passed === total) {
        console.log('✓ ALL TESTS PASSED');
        console.log('✓ DEPLOYMENT IS SUCCESSFUL');
        console.log('✓ APPLICATION IS READY FOR USE\n');
        console.log('Access the application at:');
        console.log(url);
    } else {
        console.log('✗ SOME TESTS FAILED');
        console.log('✗ DEPLOYMENT MAY HAVE ISSUES');
        console.log('✗ REVIEW LOGS AND RETRY\n');
    }
    
    console.log('\n========================================');
}

// Execute tests
runAllTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
