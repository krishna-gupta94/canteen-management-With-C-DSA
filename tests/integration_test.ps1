# Integration Test Script for Canteen Management System Backend & API
$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8080/api"
$results = @()

function Run-Test {
    param(
        [string]$Name,
        [scriptblock]$Action
    )
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $data = & $Action
        $sw.Stop()
        $script:results += [PSCustomObject]@{
            Test = $Name
            Status = "PASS"
            DurationMs = $sw.ElapsedMilliseconds
            Details = "Success"
        }
        Write-Host " [PASS] $Name ($($sw.ElapsedMilliseconds)ms)" -ForegroundColor Green
        return $data
    } catch {
        $sw.Stop()
        $msg = $_.Exception.Message
        $script:results += [PSCustomObject]@{
            Test = $Name
            Status = "FAIL"
            DurationMs = $sw.ElapsedMilliseconds
            Details = $msg
        }
        Write-Host " [FAIL] $Name : $msg" -ForegroundColor Red
        return $null
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  CANTEEN MANAGEMENT SYSTEM - INTEGRATION TEST RUNNER     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Health Check
Run-Test "1. Health Check (GET /api/health)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    if (-not $res.success) { throw "Health check returned false" }
}

# 2. Student Register
$studentEmail = "test_student_$(Get-Random)@college.edu"
$studentData = Run-Test "2. Student Register (POST /api/student/register)" {
    $body = @{
        name = "Kavya Patel"
        email = $studentEmail
        password = "student_secret_123"
        phone = "9876543210"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/student/register" -Method Post -Body $body -ContentType "application/json"
    if (-not $res.success) { throw "Registration failed" }
    return $res
}

# 3. Student Login
$studentAuth = Run-Test "3. Student Login (POST /api/student/login)" {
    $body = @{
        email = $studentEmail
        password = "student_secret_123"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/student/login" -Method Post -Body $body -ContentType "application/json"
    if (-not $res.token) { throw "No token returned" }
    return $res
}
$studentToken = $studentAuth.token
$studentHeaders = @{ Authorization = "Bearer $studentToken" }

# 4. Student Auth Verification (GET /api/auth/me)
Run-Test "4. Student Auth Identity (GET /api/auth/me)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Headers $studentHeaders
    if ($res.role -ne 0) { throw "Expected role 0 (Student), got $($res.role)" }
}

# 5. Admin Login
$adminAuth = Run-Test "5. Admin Login (POST /api/admin/login)" {
    $body = @{
        email = "admin.demo@canteen.local"
        password = "941046"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/login" -Method Post -Body $body -ContentType "application/json"
    if (-not $res.token) { throw "No admin token returned" }
    return $res
}
$adminToken = $adminAuth.token
$adminHeaders = @{ Authorization = "Bearer $adminToken" }

# 6. Admin Auth Verification (GET /api/auth/me)
Run-Test "6. Admin Auth Identity (GET /api/auth/me)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Headers $adminHeaders
    if ($res.role -ne 1) { throw "Expected role 1 (Admin), got $($res.role)" }
}

# 7. Menu Browsing (GET /api/foods)
$foods = Run-Test "7. Menu Browsing (GET /api/foods)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/foods"
    if (-not $res.success -or $res.data.Count -eq 0) { throw "No foods returned" }
    return $res.data
}

# 8. Food Search (GET /api/foods/search?q=Burger)
Run-Test "8. Food Search (GET /api/foods/search?q=Burger)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/foods/search?q=Burger"
    if (-not $res.success -or $res.data.Count -eq 0) { throw "Search returned 0 items" }
}

# 9. Food Filter & Sort (GET /api/foods/filter)
Run-Test "9. Food Filter & Sort (GET /api/foods/filter?category=Fast%20Food&sort=price_asc)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/foods/filter?category=Fast%20Food&sort=price_asc"
    if (-not $res.success) { throw "Filter failed" }
}

# 10. Add Items to Cart (POST /api/cart)
Run-Test "10. Add Items to Cart (POST /api/cart)" {
    $targetFood = ($foods | Where-Object { $_.stock -ge 5 -and $_.availability -eq $true })[0]
    if (-not $targetFood) { $targetFood = $foods[0] }
    $script:testFood = $targetFood
    $body = @{
        food_id = $targetFood.food_id
        quantity = 2
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/cart" -Method Post -Headers $studentHeaders -Body $body -ContentType "application/json"
    if (-not $res.success) { throw "Add to cart failed" }
}

# 11. View Cart (GET /api/cart)
Run-Test "11. View Cart (GET /api/cart)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/cart" -Headers $studentHeaders
    if (-not $res.success -or $res.data.Count -eq 0) { throw "Cart is empty" }
}

# 12. Update Cart Quantity (PUT /api/cart/:food_id)
Run-Test "12. Update Cart Quantity (PUT /api/cart/:food_id)" {
    $targetFood = $script:testFood
    $body = @{ quantity = 3 } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/cart/$($targetFood.food_id)" -Method Put -Headers $studentHeaders -Body $body -ContentType "application/json"
    if (-not $res.success) { throw "Update cart failed" }
}

# 13. Checkout / Place Order (POST /api/orders)
$orderRes = Run-Test "13. Checkout / Place Order (POST /api/orders)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -Headers $studentHeaders
    if (-not $res.success -or -not $res.order_id) { throw "Place order failed" }
    return $res
}
$newOrderId = $orderRes.order_id

# 14. Student Order History (GET /api/orders/history)
Run-Test "14. Student Order History (GET /api/orders/history)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/orders/history" -Headers $studentHeaders
    if (-not $res.success -or $res.data.Count -eq 0) { throw "Order history empty" }
}

# 15. Order Detail (GET /api/orders/:id)
Run-Test "15. Order Detail (GET /api/orders/$newOrderId)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/orders/$newOrderId" -Headers $studentHeaders
    if (-not $res.success -or $res.data.order_id -ne $newOrderId) { throw "Order detail mismatch" }
}

# 16. Order Receipt (GET /api/orders/:id/receipt)
Run-Test "16. Order Receipt (GET /api/orders/$newOrderId/receipt)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/orders/$newOrderId/receipt" -Headers $studentHeaders
    if (-not $res.success -or -not $res.data.canteen_name) { throw "Receipt generation failed" }
}

# 17. Admin Orders List (GET /api/admin/orders)
Run-Test "17. Admin Orders List (GET /api/admin/orders)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/orders" -Headers $adminHeaders
    if (-not $res.success) { throw "Failed to retrieve admin orders" }
}

# 18. Admin FIFO Queue (GET /api/admin/orders/queue)
Run-Test "18. Admin FIFO Queue (GET /api/admin/orders/queue)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/orders/queue" -Headers $adminHeaders
    if (-not $res.success) { throw "Failed to retrieve FIFO queue" }
}

# 19. Update Order Status (PUT /api/admin/orders/:id/status)
Run-Test "19. Update Order Status (PUT /api/admin/orders/$newOrderId/status)" {
    $body = @{ status = 1 } | ConvertTo-Json # Preparing
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/orders/$newOrderId/status" -Method Put -Headers $adminHeaders -Body $body -ContentType "application/json"
    if (-not $res.success) { throw "Update status failed" }
}

# 20. Process Next Order in Queue (POST /api/admin/orders/next)
Run-Test "20. Process Next Order (POST /api/admin/orders/next)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/orders/next" -Method Post -Headers $adminHeaders
    if (-not $res.success) { throw "Process next order failed" }
}

# 21. Admin Dashboard (GET /api/admin/dashboard)
Run-Test "21. Admin Dashboard (GET /api/admin/dashboard)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/dashboard" -Headers $adminHeaders
    if (-not $res.success -or -not $res.data.total_food_items) { throw "Dashboard summary missing" }
}

# 22. Admin Inventory Summary (GET /api/admin/inventory/summary)
Run-Test "22. Admin Inventory Summary (GET /api/admin/inventory/summary)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/inventory/summary" -Headers $adminHeaders
    if (-not $res.success) { throw "Inventory summary failed" }
}

# 23. Admin Low Stock (GET /api/admin/foods/low-stock)
Run-Test "23. Admin Low Stock (GET /api/admin/foods/low-stock)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/foods/low-stock" -Headers $adminHeaders
    if (-not $res.success) { throw "Low stock failed" }
}

# 24. Admin Out of Stock (GET /api/admin/foods/out-of-stock)
Run-Test "24. Admin Out of Stock (GET /api/admin/foods/out-of-stock)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/foods/out-of-stock" -Headers $adminHeaders
    if (-not $res.success) { throw "Out of stock failed" }
}

# 25. Admin Add Food (POST /api/admin/foods)
$addedFood = Run-Test "25. Admin Add Food (POST /api/admin/foods)" {
    $body = @{
        name = "Masala Chai Special"
        category = "Beverages"
        description = "Cardamom and ginger infused tea."
        price = 25
        stock = 50
        availability = 1
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/foods" -Method Post -Headers $adminHeaders -Body $body -ContentType "application/json"
    if (-not $res.success) { throw "Add food failed" }
    return $res
}
$addedFoodId = $addedFood.food_id

# 26. Admin Update Food Price (PUT /api/admin/foods/:id/price)
Run-Test "26. Admin Update Food Price (PUT /api/admin/foods/$addedFoodId/price)" {
    $body = @{ price = 30 } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/foods/$addedFoodId/price" -Method Put -Headers $adminHeaders -Body $body -ContentType "application/json"
    if (-not $res.success) { throw "Update food price failed" }
}

# 27. Admin Update Food Stock (PUT /api/admin/foods/:id/stock)
Run-Test "27. Admin Update Food Stock (PUT /api/admin/foods/$addedFoodId/stock)" {
    $body = @{ stock = 45 } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/foods/$addedFoodId/stock" -Method Put -Headers $adminHeaders -Body $body -ContentType "application/json"
    if (-not $res.success) { throw "Update food stock failed" }
}

# 28. Admin Delete Food (DELETE /api/admin/foods/:id)
Run-Test "28. Admin Delete Food (DELETE /api/admin/foods/$addedFoodId)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/foods/$addedFoodId" -Method Delete -Headers $adminHeaders
    if (-not $res.success) { throw "Delete food failed" }
}

# 29. Admin Popular Foods (GET /api/admin/popular-foods)
Run-Test "29. Admin Popular Foods (GET /api/admin/popular-foods)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/popular-foods" -Headers $adminHeaders
    if (-not $res.success) { throw "Popular foods failed" }
}

# 30. Admin Daily Sales (GET /api/admin/sales/daily)
Run-Test "30. Admin Daily Sales (GET /api/admin/sales/daily)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/sales/daily" -Headers $adminHeaders
    if (-not $res.success) { throw "Daily sales failed" }
}

# 31. Clear Cart (DELETE /api/cart)
Run-Test "31. Clear Cart (DELETE /api/cart)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/cart" -Method Delete -Headers $studentHeaders
    if (-not $res.success) { throw "Clear cart failed" }
}

# 32. Logout (POST /api/auth/logout)
Run-Test "32. Logout (POST /api/auth/logout)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/logout" -Method Post -Headers $studentHeaders
    if (-not $res.success) { throw "Logout failed" }
}

Write-Host "==========================================================" -ForegroundColor Cyan
$passCount = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$totalCount = $results.Count
Write-Host "SUMMARY: $passCount / $totalCount tests passed successfully." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
