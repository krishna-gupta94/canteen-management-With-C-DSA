# test_endpoints.ps1
echo "Testing GET /"
$response1 = Invoke-WebRequest -Uri "http://localhost:8080/" -Method Get -ErrorAction SilentlyContinue
echo $response1.Content

echo "Testing GET /api/health"
$response2 = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -Method Get -ErrorAction SilentlyContinue
echo $response2.Content

echo "Testing Unknown Route GET /unknown"
try {
    Invoke-WebRequest -Uri "http://localhost:8080/unknown" -Method Get
} catch {
    echo $_.Exception.Response.StatusCode
}

echo "Testing Unsupported Method POST /api/health"
try {
    Invoke-WebRequest -Uri "http://localhost:8080/api/health" -Method Post
} catch {
    echo $_.Exception.Response.StatusCode
}
