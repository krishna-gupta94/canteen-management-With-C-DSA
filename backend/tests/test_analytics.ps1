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
        Write-Host "FAIL: Server error or unreachable ($Method $Route)" -ForegroundColor Red
        return $null
    }
}

Write-Host "--- Admin Login ---"
$adminLogin = '{"email":"admin@canteen.com","password":"admin123"}'
$resAdmin = Test-Request -Method POST -Route "/api/admin/login" -Body $adminLogin -ExpectedStatus 200
$adminToken = $resAdmin.token

Write-Host "--- Student Login (Assumes Bob exists from test_order.ps1) ---"
$stuLogin = '{"email":"bob@cart.com","password":"pwd"}'
$resStu = Test-Request -Method POST -Route "/api/student/login" -Body $stuLogin -ExpectedStatus 200
$stuToken = $resStu.token

Write-Host "--- Get Student Order History ---"
$history = Test-Request -Method GET -Route "/api/orders/history" -Token $stuToken -ExpectedStatus 200
if ($history.data.Count -gt 0) { Write-Host "PASS: History retrieved" -ForegroundColor Green } else { Write-Host "WARN: History empty (did you run test_order.ps1 first?)" -ForegroundColor Yellow }

if ($history.data.Count -gt 0) {
    $orderId = $history.data[0].order_id
    
    Write-Host "--- Get Order Detail ---"
    Test-Request -Method GET -Route "/api/orders/$orderId" -Token $stuToken -ExpectedStatus 200
    
    Write-Host "--- Get Order Receipt ---"
    $receipt = Test-Request -Method GET -Route "/api/orders/$orderId/receipt" -Token $stuToken -ExpectedStatus 200
    if ($receipt.data.total -gt 0) { Write-Host "PASS: Receipt generated" -ForegroundColor Green }
    
    Write-Host "--- Push Order to Completed (Admin) ---"
    # test_order left it in READY if it finished. 
    # Force to COMPLETED so it shows up in analytics
    $statusReq = '{"status": 3}'
    Test-Request -Method PUT -Route "/api/admin/orders/$orderId/status" -Token $adminToken -Body $statusReq -ExpectedStatus 200
}

Write-Host "--- Admin Daily Sales ---"
$today = Get-Date -Format "yyyy-MM-dd"
$sales = Test-Request -Method GET -Route "/api/admin/sales/daily?date=$today" -Token $adminToken -ExpectedStatus 200
if ($sales.data.completed_orders -ge 0) { Write-Host "PASS: Daily sales retrieved" -ForegroundColor Green }

Write-Host "--- Admin Popular Foods ---"
$pop = Test-Request -Method GET -Route "/api/admin/popular-foods" -Token $adminToken -ExpectedStatus 200
if ($pop.data.Count -gt 0) { Write-Host "PASS: Popular foods retrieved" -ForegroundColor Green }
