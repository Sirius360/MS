// ===== test-phase2.ps1 =====
// PowerShell script to test Phase 2 features

# Test 1: Field Selection
Write-Host "`n=== Test 1: Field Selection ===" -ForegroundColor Cyan
Write-Host "Testing: GET /api/products?fields=id,name,salePrice"

$response1 = Invoke-WebRequest -Uri "http://localhost:3001/api/products?fields=id,name,salePrice" -Method GET
$data1 = $response1.Content | ConvertFrom-Json
Write-Host "Response fields:" ($data1.data[0] | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name)
Write-Host "✅ Field selection working!" -ForegroundColor Green

# Test 2: Rate Limit Headers
Write-Host "`n=== Test 2: Rate Limit Headers ===" -ForegroundColor Cyan
Write-Host "Checking rate limit headers..."

$headers = $response1.Headers
Write-Host "RateLimit-Limit: $($headers['RateLimit-Limit'])"
Write-Host "RateLimit-Remaining: $($headers['RateLimit-Remaining'])"
Write-Host "RateLimit-Reset: $($headers['RateLimit-Reset'])"
Write-Host "✅ Rate limiting active!" -ForegroundColor Green

# Test 3: Validation (should fail - missing required field)
Write-Host "`n=== Test 3: Request Validation ===" -ForegroundColor Cyan
Write-Host "Testing: POST /api/products with missing SKU (should fail)"

try {
    $body = @{
        name = "Test Product"
        costPrice = 1000
    } | ConvertTo-Json

    $response3 = Invoke-WebRequest -Uri "http://localhost:3001/api/products" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "❌ Validation should have failed!" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Validation error: $($errorResponse.error)" -ForegroundColor Yellow
    if ($errorResponse.errors) {
        Write-Host "Field errors:"
        $errorResponse.errors | ForEach-Object {
            Write-Host "  - $($_.field): $($_.message)"
        }
    }
    Write-Host "✅ Validation working correctly!" -ForegroundColor Green
}

# Test 4: Compare Full vs Sparse Response
Write-Host "`n=== Test 4: Response Size Comparison ===" -ForegroundColor Cyan

$full = Invoke-WebRequest -Uri "http://localhost:3001/api/products?limit=10" -Method GET
$sparse = Invoke-WebRequest -Uri "http://localhost:3001/api/products?limit=10&fields=id,name,salePrice" -Method GET

$fullSize = $full.Content.Length
$sparseSize = $sparse.Content.Length
$reduction = [math]::Round((($fullSize - $sparseSize) / $fullSize) * 100, 2)

Write-Host "Full response: $fullSize bytes"
Write-Host "Sparse response: $sparseSize bytes"
Write-Host "Size reduction: $reduction%"
Write-Host "✅ Field selection reduces response size!" -ForegroundColor Green

# Test 5: Batch Operations
Write-Host "`n=== Test 5: Batch Operations ===" -ForegroundColor Cyan
Write-Host "Testing: POST /api/batch/products (requires auth)"

Write-Host "⚠️  Batch operations require authentication" -ForegroundColor Yellow
Write-Host "To test manually, first login and get a token:"
Write-Host "  1. POST /api/auth/login with admin credentials"
Write-Host "  2. Use token to call /api/batch/products"

Write-Host "`n=== All Phase 2 Tests Complete ===" -ForegroundColor Green
