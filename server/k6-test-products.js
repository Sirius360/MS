// ===== k6-test-products.js =====
// k6 load test for products endpoint

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const productListDuration = new Trend('product_list_duration');
const singleProductDuration = new Trend('single_product_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 50 },    // Ramp up to 50 users
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '1m', target: 100 },   // Stay at 100 users
    { duration: '30s', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'],  // 95% of requests should be below 100ms
    http_req_failed: ['rate<0.01'],    // Error rate should be less than 1%
    errors: ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:3001';

export default function () {
  // Test 1: Get products list with pagination
  const productListRes = http.get(`${BASE_URL}/api/products?page=1&limit=20`);
  
  check(productListRes, {
    'products list status is 200': (r) => r.status === 200,
    'products list has data': (r) => {
      const body = JSON.parse(r.body);
      return body.success === true && Array.isArray(body.data);
    },
    'products list response time < 100ms': (r) => r.timings.duration < 100,
  }) || errorRate.add(1);
  
  productListDuration.add(productListRes.timings.duration);

  // Test 2: Get products with field selection
  const sparseRes = http.get(`${BASE_URL}/api/products?page=1&limit=20&fields=id,name,salePrice`);
  
  check(sparseRes, {
    'sparse response status is 200': (r) => r.status === 200,
    'sparse response is smaller': (r) => r.body.length < productListRes.body.length,
    'sparse response time < 50ms': (r) => r.timings.duration < 50,
  }) || errorRate.add(1);

  // Test 3: Get single product (should be cached after first request)
  const singleProductRes = http.get(`${BASE_URL}/api/products/6a412b7b-9487-4f25-8d6b-03e5d0e8f4a3`);
  
  check(singleProductRes, {
    'single product status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'single product response time < 50ms': (r) => r.timings.duration < 50,
  });
  
  if (singleProductRes.status === 200) {
    singleProductDuration.add(singleProductRes.timings.duration);
  }

  // Test 4: Search products
  const searchRes = http.get(`${BASE_URL}/api/products/search?query=iphone`);
  
  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 100ms': (r) => r.timings.duration < 100,
  }) || errorRate.add(1);

  // Test 5: Get product groups (heavily cached)
  const groupsRes = http.get(`${BASE_URL}/api/product-groups`);
  
  check(groupsRes, {
    'groups status is 200': (r) => r.status === 200,
    'groups response time < 30ms': (r) => r.timings.duration < 30,
  }) || errorRate.add(1);

  sleep(0.5); // Wait 500ms between iterations
}

export function handleSummary(data) {
  return {
    'k6-results.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const { indent = '', enableColors = false } = options;
  
  const metrics = data.metrics;
  
  return `
${indent}Test Summary
${indent}============
${indent}
${indent}Total Requests:     ${metrics.http_reqs.values.count}
${indent}Request Rate:       ${metrics.http_reqs.values.rate.toFixed(2)} req/s
${indent}Failed Requests:    ${metrics.http_req_failed?.values.passes || 0}
${indent}
${indent}Response Times:
${indent}  Average:          ${metrics.http_req_duration.values.avg.toFixed(2)}ms
${indent}  Median (p50):     ${metrics.http_req_duration.values.med.toFixed(2)}ms
${indent}  p95:              ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
${indent}  p99:              ${metrics.http_req_duration.values['p(99)'].toFixed(2)}ms
${indent}  Max:              ${metrics.http_req_duration.values.max.toFixed(2)}ms
${indent}
${indent}Custom Metrics:
${indent}  Product List:     ${metrics.product_list_duration?.values.avg.toFixed(2)}ms (avg)
${indent}  Single Product:   ${metrics.single_product_duration?.values.avg.toFixed(2)}ms (avg)
${indent}  Error Rate:       ${((metrics.errors?.values.rate || 0) * 100).toFixed(2)}%
${indent}
${indent}Virtual Users:
${indent}  Max:              ${metrics.vus_max.values.max}
${indent}
${indent}Data Transfer:
${indent}  Sent:             ${(metrics.data_sent.values.count / 1024 / 1024).toFixed(2)} MB
${indent}  Received:         ${(metrics.data_received.values.count / 1024 / 1024).toFixed(2)} MB
  `;
}
