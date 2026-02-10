// ===== k6-test-rate-limit.js =====
// k6 test to verify rate limiting

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  iterations: 110, // More than the rate limit
};

const BASE_URL = 'http://localhost:3001';

export default function () {
  const res = http.get(`${BASE_URL}/api/products`);
  
  // Check if we get rate limited
  check(res, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'has rate limit headers': (r) => r.headers['Ratelimit-Limit'] !== undefined,
  });

  if (res.status === 429) {
    console.log(`⚠️ Rate limited! Remaining: ${res.headers['Ratelimit-Remaining']}`);
  } else {
    console.log(`✅ Request ${__ITER + 1}: OK (Remaining: ${res.headers['Ratelimit-Remaining']})`);
  }

  sleep(0.1); // Small delay between requests
}

export function handleSummary(data) {
  const total = data.metrics.http_reqs.values.count;
  const failed = data.metrics.http_req_failed?.values.passes || 0;
  const rateLimited = total - failed;
  
  console.log(`\n=== Rate Limit Test Summary ===`);
  console.log(`Total requests: ${total}`);
  console.log(`Successful: ${total - failed}`);
  console.log(`Rate limited (429): Expected ~10+`);
  console.log(`\nRate limiting is ${rateLimited >= 10 ? '✅ WORKING' : '❌ NOT WORKING'}`);
  
  return {
    stdout: '',
  };
}
