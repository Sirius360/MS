# Load Testing Guide

## Prerequisites

Install k6 on Windows:

```powershell
# Using Chocolatey
choco install k6

# Or download from: https://k6.io/docs/get-started/installation/
```

## Test Scripts

### 1. Performance Test (k6-test-products.js)

Comprehensive load test with ramping VUs:

- 30s: Ramp to 10 users
- 1m: Ramp to 50 users
- 2m: Ramp to 100 users
- 1m: Stay at 100 users
- 30s: Ramp down

```bash
k6 run k6-test-products.js
```

**Tests:**

- Products list pagination
- Field selection (sparse responses)
- Single product lookup
- Search functionality
- Product groups (cached)

**Thresholds:**

- 95% of requests < 100ms
- Error rate < 1%

### 2. Rate Limit Test (k6-test-rate-limit.js)

Verifies rate limiting works correctly:

```bash
k6 run k6-test-rate-limit.js
```

**Expected:**

- First 100 requests: Success (200)
- Requests 101+: Rate limited (429)
- Rate limit headers present

### 3. Cache Test (k6-test-cache.js)

Measures cache effectiveness:

```bash
k6 run k6-test-cache.js
```

**Measures:**

- First request (cache MISS)
- Subsequent requests (cache HIT)
- Cache improvement percentage

## Running Tests

### All Tests

```bash
# Run all tests
k6 run k6-test-products.js
k6 run k6-test-rate-limit.js
k6 run k6-test-cache.js
```

### Custom Options

```bash
# Quick test (10 users, 30s)
k6 run --vus 10 --duration 30s k6-test-products.js

# Stress test (200 users)
k6 run --vus 200 --duration 2m k6-test-products.js
```

## Expected Results

### Performance Test

```
http_req_duration............: avg=10-30ms p95=30-50ms
http_req_failed..............: 0.00%
http_reqs....................: 10000-20000 total
```

### Rate Limit Test

```
Total: 110 requests
Successful: 100
Rate limited: 10+
✅ Rate limiting WORKING
```

### Cache Test

```
First request: 15-30ms
Cached requests: 1-5ms
Improvement: 80-95%
✅ Cache VERY EFFECTIVE
```

## Interpreting Results

### Good Performance

- Average response time < 30ms
- p95 < 50ms
- p99 < 100ms
- Error rate < 1%
- Throughput > 200 req/s

### Excellent Performance

- Average < 10ms
- p95 < 30ms
- p99 < 50ms
- Error rate < 0.1%
- Throughput > 500 req/s

## Troubleshooting

### High Response Times

- Check server CPU usage
- Verify cache is working
- Check database queries

### High Error Rate

- Check server logs
- Verify endpoints are accessible
- Check rate limiting threshold

### Low Throughput

- Increase VUS gradually
- Check network bottlenecks
- Monitor server resources
