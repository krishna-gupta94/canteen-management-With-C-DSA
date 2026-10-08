# test_auth.ps1
$url = "http://localhost:8080"
$ErrorActionPreference = "Stop"

function Test-Request {
    param($Method, $Route, $Body, $Token, $ExpectedStatus)
    $headers = @{}
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    
    try {
        $res = Invoke-RestMethod -Uri "$url$Route" -Method $Method -Headers $headers -Body $Body -ContentType "application/json" -SkipHttpErrorCheck -StatusCodeVariable "status"
        if ($status -eq $ExpectedStatus) { Write-Host "PASS: $Method $Route -> $status" -ForegroundColor Green }
        else { Write-Host "FAIL: $Method $Route -> Expected $ExpectedStatus but got $status" -ForegroundColor Red }
        return $res
    } catch {
        Write-Host "FAIL: Server error or unreachable" -ForegroundColor Red
        return $null
    }
}

Write-Host "--- Testing Registration ---"
$reg1 = '{"name":"Alice","email":"alice@test.com","password":"pwd"}'
$res = Test-Request -Method POST -Route "/api/student/register" -Body $reg1 -ExpectedStatus 201

Write-Host "--- Testing Duplicate Registration ---"
Test-Request -Method POST -Route "/api/student/register" -Body $reg1 -ExpectedStatus 400

Write-Host "--- Testing Login ---"
$login = '{"email":"alice@test.com","password":"pwd"}'
$resLogin = Test-Request -Method POST -Route "/api/student/login" -Body $login -ExpectedStatus 200
$token = $resLogin.token

Write-Host "--- Testing Wrong Password ---"
$loginFail = '{"email":"alice@test.com","password":"wrong"}'
Test-Request -Method POST -Route "/api/student/login" -Body $loginFail -ExpectedStatus 401

Write-Host "--- Testing Authenticated Endpoint (Student) ---"
Test-Request -Method GET -Route "/api/auth/me" -Token $token -ExpectedStatus 200
Test-Request -Method GET -Route "/api/test/student-only" -Token $token -ExpectedStatus 200

Write-Host "--- Testing Forbidden (Student trying Admin route) ---"
Test-Request -Method GET -Route "/api/test/admin-only" -Token $token -ExpectedStatus 403

Write-Host "--- Testing Missing Token ---"
Test-Request -Method GET -Route "/api/auth/me" -ExpectedStatus 401

Write-Host "--- Testing Admin Login ---"
$adminLogin = '{"email":"admin@canteen.com","password":"admin123"}'
$adminRes = Test-Request -Method POST -Route "/api/admin/login" -Body $adminLogin -ExpectedStatus 200
$adminToken = $adminRes.token

Write-Host "--- Testing Authenticated Endpoint (Admin) ---"
Test-Request -Method GET -Route "/api/test/admin-only" -Token $adminToken -ExpectedStatus 200

Write-Host "--- Testing Logout ---"
Test-Request -Method POST -Route "/api/auth/logout" -Token $token -ExpectedStatus 200
Test-Request -Method GET -Route "/api/auth/me" -Token $token -ExpectedStatus 401
