#!/usr/bin/env pwsh

Write-Host "Testing API endpoints..." -ForegroundColor Cyan

# Test health endpoint
try {
    Write-Host "`nTesting /api/health..." -ForegroundColor Yellow
    $health = Invoke-RestMethod -Uri "https://ad-rewards-app.vercel.app/api/health" -Method GET
    Write-Host "✓ Health check passed:" -ForegroundColor Green
    $health | ConvertTo-Json
}
catch {
    Write-Host "✗ Health check failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test migrate endpoint with POST
try {
    Write-Host "`nTesting /api/migrate (POST)..." -ForegroundColor Yellow
    $headers = @{"x-api-key" = "pk_adrewards_3b4700d6-72b3-479f-9471-b3812d167c90"}
    $response = Invoke-RestMethod -Uri "https://ad-rewards-app.vercel.app/api/migrate" -Method POST -Headers $headers -ContentType "application/json"
    Write-Host "✓ Migrate endpoint responded:" -ForegroundColor Green
    $response | ConvertTo-Json
}
catch {
    Write-Host "✗ Migrate endpoint failed:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Message: $($_.Exception.Message)"
}

# Also test with OPTIONS
try {
    Write-Host "`nTesting /api/migrate (OPTIONS)..." -ForegroundColor Yellow
    $options = Invoke-WebRequest -Uri "https://ad-rewards-app.vercel.app/api/migrate" -Method OPTIONS
    Write-Host "✓ OPTIONS succeeded:" -ForegroundColor Green
    $options.Headers | ConvertTo-Json
}
catch {
    Write-Host "✗ OPTIONS failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
