// ===== k6-test-cache.js =====
// k6 test to measure cache effectiveness

import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

const firstRequestDuration = new Trend('first_request_duration');
const cachedRequestDuration = new Trend('cached_request_duration');

export const options = {
  vus: 1,
  iterations: 100,
};

const BASE_URL = 'http://localhost:3001';

export default function () {
  if (__ITER === 0) {
    // First request - cache miss
    const res = http.get(`${BASE_URL}/api/products?page=1&limit=10`);
    firstRequestDuration.add(res.timings.duration);
    console.log(`First request (cache MISS): ${res.timings.duration.toFixed(2)}ms`);
  } else {
    // Subsequent requests - cache hit
    const res = http.get(`${BASE_URL}/api/products?page=1&limit=10`);
    cachedRequestDuration.add(res.timings.duration);
    
    if (__ITER % 20 === 0) {
      console.log(`Request ${__ITER} (cache HIT): ${res.timings.duration.toFixed(2)}ms`);
    }
  }
}

export function handleSummary(data) {
  const firstReq = data.metrics.first_request_duration.values.avg;
  const cachedReq = data.metrics.cached_request_duration.values.avg;
  const improvement = ((firstReq - cachedReq) / firstReq * 100).toFixed(2);
  
  console.log(`\n=== Cache Performance Test ===`);
  console.log(`First request (cache MISS): ${firstReq.toFixed(2)}ms`);
  console.log(`Average cached request (cache HIT): ${cachedReq.toFixed(2)}ms`);
  console.log(`Cache improvement: ${improvement}%`);
  console.log(`\nCache is ${improvement > 50 ? '✅ VERY EFFECTIVE' : improvement > 20 ? '✅ EFFECTIVE' : '⚠️ NEEDS TUNING'}`);
  
  return {
    stdout: '',
  };
}
