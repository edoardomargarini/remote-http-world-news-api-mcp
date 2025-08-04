#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🌍 Testing World News API MCP Server...\n');

if (!process.env.WORLD_NEWS_API_KEY) {
  console.error('❌ WORLD_NEWS_API_KEY environment variable is not set');
  console.error('Please set your World News API key:');
  console.error('export WORLD_NEWS_API_KEY="your_api_key_here"');
  process.exit(1);
}

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: { ...process.env, WORLD_NEWS_API_KEY: process.env.WORLD_NEWS_API_KEY }
});

// Test 1: List tools
console.log('📋 Test 1: Listing available tools...');
const listToolsRequest = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
});

server.stdin.write(listToolsRequest + '\n');

// Test 2: Search for news
setTimeout(() => {
  console.log('\n🔍 Test 2: Searching for news about technology...');
  const searchRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'search_news',
      arguments: {
        text: 'technology',
        language: 'en',
        number: 3
      }
    }
  });
  
  server.stdin.write(searchRequest + '\n');
}, 1000);

// Handle server output
let responseCount = 0;
server.stdout.on('data', (data) => {
  const response = data.toString();
  responseCount++;
  
  if (responseCount === 1) {
    console.log('✅ Tools list response received');
    try {
      const parsed = JSON.parse(response);
      if (parsed.result && parsed.result.tools) {
        console.log(`   Found ${parsed.result.tools.length} tools:`);
        parsed.result.tools.forEach((tool, index) => {
          console.log(`   ${index + 1}. ${tool.name}: ${tool.description}`);
        });
      }
    } catch (e) {
      console.log('   Raw response:', response);
    }
  } else if (responseCount === 2) {
    console.log('\n✅ News search response received');
    try {
      const parsed = JSON.parse(response);
      if (parsed.result && parsed.result.content) {
        const content = JSON.parse(parsed.result.content[0].text);
        if (content.news && content.news.length > 0) {
          console.log(`   Found ${content.news.length} news articles:`);
          content.news.forEach((article, index) => {
            console.log(`   ${index + 1}. ${article.title || 'No title'}`);
            console.log(`      Source: ${article.source_country || 'Unknown'}`);
            console.log(`      Published: ${article.publish_date || 'Unknown'}`);
          });
        } else {
          console.log('   No news articles found');
        }
      }
    } catch (e) {
      console.log('   Raw response:', response);
    }
    
    // End test
    setTimeout(() => {
      console.log('\n🎉 World News API MCP Server test completed!');
      server.kill();
      process.exit(0);
    }, 1000);
  }
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

server.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Server process exited with code ${code}`);
    process.exit(1);
  }
});
