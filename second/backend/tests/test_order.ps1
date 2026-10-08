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

Write-Host "--- Setup: Register/Login ---"
$stu = '{"name":"Bob","email":"bob@cart.com","password":"pwd"}'
Test-Request -Method POST -Route "/api/student/register" -Body $stu -ExpectedStatus 201
$stuLogin = '{"email":"bob@cart.com","password":"pwd"}'
$resStu = Test-Request -Method POST -Route "/api/student/login" -Body $stuLogin -ExpectedStatus 200
$stuToken = $resStu.token

$adminLogin = '{"email":"admin@canteen.com","password":"admin123"}'
$resAdmin = Test-Request -Method POST -Route "/api/admin/login" -Body $adminLogin -ExpectedStatus 200
$adminToken = $resAdmin.token

Write-Host "--- Admin adds Food ---"
$f1 = '{"name":"Fries","category":"Snacks","price":40,"stock":10,"availability":true}'
Test-Request -Method POST -Route "/api/admin/foods" -Token $adminToken -Body $f1 -ExpectedStatus 201

Write-Host "--- Student Cart Tests ---"
Test-Request -Method GET -Route "/api/cart" -Token $stuToken -ExpectedStatus 200

$c1 = '{"food_id":1, "quantity":3}'
Test-Request -Method POST -Route "/api/cart" -Token $stuToken -Body $c1 -ExpectedStatus 201

# Duplicate adds to quantity
Test-Request -Method POST -Route "/api/cart" -Token $stuToken -Body $c1 -ExpectedStatus 201

$c2 = '{"quantity":5}'
Test-Request -Method PUT -Route "/api/cart/1" -Token $stuToken -Body $c2 -ExpectedStatus 200

Write-Host "--- Overstock Test ---"
$c3 = '{"quantity":999}'
Test-Request -Method PUT -Route "/api/cart/1" -Token $stuToken -Body $c3 -ExpectedStatus 400

Write-Host "--- Student Place Order ---"
$orderRes = Test-Request -Method POST -Route "/api/orders" -Token $stuToken -ExpectedStatus 201
$orderId = $orderRes.order_id

Write-Host "--- Empty Cart Validation ---"
Test-Request -Method POST -Route "/api/orders" -Token $stuToken -ExpectedStatus 400

Write-Host "--- Order Verification ---"
$orders = Test-Request -Method GET -Route "/api/orders" -Token $stuToken -ExpectedStatus 200
if ($orders.data.Count -gt 0) { Write-Host "PASS: Order found in history" -ForegroundColor Green } else { Write-Host "FAIL: Order not found" -ForegroundColor Red }

Write-Host "--- Admin Queue Processing ---"
$next = Test-Request -Method POST -Route "/api/admin/orders/next" -Token $adminToken -ExpectedStatus 200
if ($next.order_id -eq $orderId) { Write-Host "PASS: Admin dequeued correct order" -ForegroundColor Green } else { Write-Host "FAIL: Queue issue" -ForegroundColor Red }

Write-Host "--- Status Transition ---"
$statusReq = '{"status": 2}' # READY
Test-Request -Method PUT -Route "/api/admin/orders/$orderId/status" -Token $adminToken -Body $statusReq -ExpectedStatus 200

$badStatus = '{"status": 0}' # PENDING (Invalid from READY)
Test-Request -Method PUT -Route "/api/admin/orders/$orderId/status" -Token $adminToken -Body $badStatus -ExpectedStatus 400
