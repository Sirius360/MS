# ===== simple-load-test.ps1 =====
# Simple PowerShell load test (alternative to k6)

param(
    [int]$Requests = 100,
    [int]$Concurrency = 10,
    [string]$Url = "http://localhost:3001/api/products?page=1&limit=10"
)

Write-Host "`n=== Simple Load Test ===" -ForegroundColor Cyan
Write-Host "URL: $Url"
Write-Host "Total Requests: $Requests"
Write-Host "Concurrency: $Concurrency"
Write-Host ""

$results = @()
$startTime = Get-Date

# Run requests in batches
$batchSize = $Concurrency
$batches = [math]::Ceiling($Requests / $batchSize)

for ($batch = 0; $batch -lt $batches; $batch++) {
    $jobs = @()
    $remaining = $Requests - ($batch * $batchSize)
    $currentBatch = [math]::Min($batchSize, $remaining)
    
    Write-Host "Batch $($batch + 1)/$batches - Running $currentBatch requests..." -NoNewline
    
    for ($i = 0; $i -lt $currentBatch; $i++) {
        $jobs += Start-Job -ScriptBlock {
            param($url)
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            try {
                $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 30
                $stopwatch.Stop()
                return @{
                    Success = $true
                    StatusCode = $response.StatusCode
                    Duration = $stopwatch.ElapsedMilliseconds
                    Size = $response.Content.Length
                    RateLimitRemaining = $response.Headers['RateLimit-Remaining']
                }
            } catch {
                $stopwatch.Stop()
                return @{
                    Success = $false
                    StatusCode = $_.Exception.Response.StatusCode.value__
                    Duration = $stopwatch.ElapsedMilliseconds
                    Error = $_.Exception.Message
                }
            }
        } -ArgumentList $Url
    }
    
    # Wait for all jobs in this batch
    $jobResults = $jobs | Wait-Job | Receive-Job
    $jobs | Remove-Job
    
    $results += $jobResults
    Write-Host " Done" -ForegroundColor Green
}

$endTime = Get-Date
$totalDuration = ($endTime - $startTime).TotalSeconds

# Calculate statistics
$successful = ($results | Where-Object { $_.Success }).Count
$failed = ($results | Where-Object { !$_.Success }).Count
$durations = ($results | Where-Object { $_.Success }).Duration
$avgDuration = ($durations | Measure-Object -Average).Average
$minDuration = ($durations | Measure-Object -Minimum).Minimum
$maxDuration = ($durations | Measure-Object -Maximum).Maximum
$p95Duration = ($durations | Sort-Object)[[math]::Floor($durations.Count * 0.95)]
$p99Duration = ($durations | Sort-Object)[[math]::Floor($durations.Count * 0.99)]
$requestsPerSec = $Requests / $totalDuration
$avgSize = (($results | Where-Object { $_.Success }).Size | Measure-Object -Average).Average

# Display results
Write-Host "`n=== Results ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  Total Time:        $([math]::Round($totalDuration, 2))s"
Write-Host "  Total Requests:    $Requests"
Write-Host "  Successful:        $successful ($(($successful / $Requests * 100).ToString('0.00'))%)"
Write-Host "  Failed:            $failed ($(($failed / $Requests * 100).ToString('0.00'))%)"
Write-Host "  Requests/sec:      $([math]::Round($requestsPerSec, 2))"
Write-Host ""
Write-Host "Response Times:" -ForegroundColor Yellow
Write-Host "  Min:               $([math]::Round($minDuration, 2))ms"
Write-Host "  Average:           $([math]::Round($avgDuration, 2))ms"
Write-Host "  Max:               $([math]::Round($maxDuration, 2))ms"
Write-Host "  p95:               $([math]::Round($p95Duration, 2))ms"
Write-Host "  p99:               $([math]::Round($p99Duration, 2))ms"
Write-Host ""
Write-Host "Data Transfer:" -ForegroundColor Yellow
Write-Host "  Avg Response Size: $([math]::Round($avgSize / 1024, 2)) KB"
Write-Host "  Total Data:        $([math]::Round($avgSize * $successful / 1024 / 1024, 2)) MB"
Write-Host ""

# Performance verdict
if ($avgDuration -lt 30 -and $p95Duration -lt 50) {
    Write-Host "✅ EXCELLENT Performance!" -ForegroundColor Green
} elseif ($avgDuration -lt 100 -and $p95Duration -lt 200) {
    Write-Host "✅ GOOD Performance" -ForegroundColor Green
} else {
    Write-Host "⚠️  Performance needs improvement" -ForegroundColor Yellow
}

# Check rate limiting
$rateLimited = ($results | Where-Object { $_.StatusCode -eq 429 }).Count
if ($rateLimited -gt 0) {
    Write-Host ""
    Write-Host "⚠️  $rateLimited requests were rate limited (429)" -ForegroundColor Yellow
}

Write-Host ""
