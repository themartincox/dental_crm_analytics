#!/usr/bin/env node

/**
 * Performance testing script for AES CRM
 * Tests the marketing landing page for Core Web Vitals
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting AES CRM Performance Test...\n');

// Check if build exists
const buildPath = path.join(__dirname, '../build');
if (!fs.existsSync(buildPath)) {
  console.log('❌ Build directory not found. Please run "npm run build" first.');
  process.exit(1);
}

// Test URLs
const testUrls = [
  'http://localhost:4028',
  'http://localhost:4028/pricing',
  'http://localhost:4028/contact'
];

// Performance thresholds
const thresholds = {
  performance: 80,
  accessibility: 90,
  'best-practices': 90,
  seo: 90,
  'first-contentful-paint': 2000,
  'largest-contentful-paint': 2500,
  'total-blocking-time': 300,
  'cumulative-layout-shift': 0.1
};

async function runLighthouseTest(url, outputPath) {
  try {
    console.log(`🔍 Testing ${url}...`);
    
    const command = `lighthouse "${url}" --output=json,html --output-path="${outputPath}" --chrome-flags="--headless" --quiet`;
    
    execSync(command, { stdio: 'pipe' });
    
    // Read and parse results
    const jsonPath = `${outputPath}.report.json`;
    if (fs.existsSync(jsonPath)) {
      const results = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      console.log(`✅ ${url} - Performance: ${results.lhr.categories.performance.score * 100}`);
      console.log(`   LCP: ${results.lhr.audits['largest-contentful-paint'].displayValue}`);
      console.log(`   FCP: ${results.lhr.audits['first-contentful-paint'].displayValue}`);
      console.log(`   TBT: ${results.lhr.audits['total-blocking-time'].displayValue}`);
      console.log(`   CLS: ${results.lhr.audits['cumulative-layout-shift'].displayValue}\n`);
      
      return results;
    }
  } catch (error) {
    console.log(`❌ Error testing ${url}: ${error.message}\n`);
    return null;
  }
}

async function runPerformanceTests() {
  const results = [];
  
  for (const url of testUrls) {
    const urlName = url.replace('http://localhost:4028', '').replace('/', '') || 'homepage';
    const outputPath = path.join(__dirname, `../lighthouse-${urlName}`);
    
    const result = await runLighthouseTest(url, outputPath);
    if (result) {
      results.push({
        url,
        performance: result.lhr.categories.performance.score * 100,
        lcp: result.lhr.audits['largest-contentful-paint'].numericValue,
        fcp: result.lhr.audits['first-contentful-paint'].numericValue,
        tbt: result.lhr.audits['total-blocking-time'].numericValue,
        cls: result.lhr.audits['cumulative-layout-shift'].numericValue
      });
    }
  }
  
  // Generate summary report
  console.log('📊 Performance Test Summary:');
  console.log('============================');
  
  results.forEach(result => {
    const urlName = result.url.replace('http://localhost:4028', '').replace('/', '') || 'homepage';
    console.log(`\n${urlName.toUpperCase()}:`);
    console.log(`  Performance Score: ${result.performance.toFixed(0)}/100`);
    console.log(`  LCP: ${(result.lcp / 1000).toFixed(2)}s ${result.lcp < 2500 ? '✅' : '❌'}`);
    console.log(`  FCP: ${(result.fcp / 1000).toFixed(2)}s ${result.fcp < 1800 ? '✅' : '❌'}`);
    console.log(`  TBT: ${result.tbt.toFixed(0)}ms ${result.tbt < 300 ? '✅' : '❌'}`);
    console.log(`  CLS: ${result.cls.toFixed(3)} ${result.cls < 0.1 ? '✅' : '❌'}`);
  });
  
  // Overall assessment
  const avgPerformance = results.reduce((sum, r) => sum + r.performance, 0) / results.length;
  const avgLcp = results.reduce((sum, r) => sum + r.lcp, 0) / results.length;
  const avgFcp = results.reduce((sum, r) => sum + r.fcp, 0) / results.length;
  
  console.log('\n🎯 Overall Assessment:');
  console.log(`  Average Performance: ${avgPerformance.toFixed(0)}/100`);
  console.log(`  Average LCP: ${(avgLcp / 1000).toFixed(2)}s`);
  console.log(`  Average FCP: ${(avgFcp / 1000).toFixed(2)}s`);
  
  if (avgPerformance >= 80 && avgLcp < 2500 && avgFcp < 1800) {
    console.log('\n🎉 Performance targets met! Ready for production.');
  } else {
    console.log('\n⚠️  Performance targets not met. Consider additional optimizations.');
  }
}

// Run tests
runPerformanceTests().catch(console.error);
