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

Write-Host "--- Admin Login ---"
$adminLogin = '{"email":"admin@canteen.com","password":"admin123"}'
$adminRes = Test-Request -Method POST -Route "/api/admin/login" -Body $adminLogin -ExpectedStatus 200
$adminToken = $adminRes.token

Write-Host "--- Admin Add Food ---"
$f1 = '{"name":"Burger","category":"Snacks","price":50,"stock":20,"availability":true}'
$resF1 = Test-Request -Method POST -Route "/api/admin/foods" -Token $adminToken -Body $f1 -ExpectedStatus 201

$f2 = '{"name":"Pizza","category":"Snacks","price":120,"stock":3,"availability":true}'
Test-Request -Method POST -Route "/api/admin/foods" -Token $adminToken -Body $f2 -ExpectedStatus 201

$f3 = '{"name":"Coke","category":"Drinks","price":30,"stock":0,"availability":true}'
Test-Request -Method POST -Route "/api/admin/foods" -Token $adminToken -Body $f3 -ExpectedStatus 201

$f4 = '{"name":"Pasta","category":"Meals","price":80,"stock":10,"availability":false}'
Test-Request -Method POST -Route "/api/admin/foods" -Token $adminToken -Body $f4 -ExpectedStatus 201

Write-Host "--- Admin Get All Foods ---"
Test-Request -Method GET -Route "/api/admin/foods" -Token $adminToken -ExpectedStatus 200

Write-Host "--- Admin Update Price (Pizza to 150) ---"
$priceUpdate = '{"price": 150}'
Test-Request -Method PUT -Route "/api/admin/foods/2/price" -Token $adminToken -Body $priceUpdate -ExpectedStatus 200

Write-Host "--- Admin Low Stock ---"
$low = Test-Request -Method GET -Route "/api/admin/foods/low-stock" -Token $adminToken -ExpectedStatus 200
if ($low.data.Count -eq 1 -and $low.data[0].name -eq "Pizza") { Write-Host "PASS: Low stock logic" -ForegroundColor Green } else { Write-Host "FAIL: Low stock logic" -ForegroundColor Red }

Write-Host "--- Admin Out of Stock ---"
$out = Test-Request -Method GET -Route "/api/admin/foods/out-of-stock" -Token $adminToken -ExpectedStatus 200
if ($out.data.Count -eq 1 -and $out.data[0].name -eq "Coke") { Write-Host "PASS: Out of stock logic" -ForegroundColor Green } else { Write-Host "FAIL: Out of stock logic" -ForegroundColor Red }

Write-Host "--- Public Menu (Should hide Pasta and Coke) ---"
$pub = Test-Request -Method GET -Route "/api/foods" -ExpectedStatus 200
if ($pub.data.Count -eq 2) { Write-Host "PASS: Public filter logic" -ForegroundColor Green } else { Write-Host "FAIL: Public filter logic" -ForegroundColor Red }

Write-Host "--- Public Search (urg) ---"
$search = Test-Request -Method GET -Route "/api/foods/search?q=urg" -ExpectedStatus 200
if ($search.data[0].name -eq "Burger") { Write-Host "PASS: Linear Search" -ForegroundColor Green } else { Write-Host "FAIL: Linear Search" -ForegroundColor Red }

Write-Host "--- Public Sort (Price Descending) ---"
$sort = Test-Request -Method GET -Route "/api/foods?sort=price_desc" -ExpectedStatus 200
if ($sort.data[0].name -eq "Pizza") { Write-Host "PASS: Sort logic (Pizza $150 first)" -ForegroundColor Green } else { Write-Host "FAIL: Sort logic" -ForegroundColor Red }

Write-Host "--- Filter by Category ---"
$cat = Test-Request -Method GET -Route "/api/foods/filter?category=Drinks" -ExpectedStatus 200
if ($cat.data.Count -eq 0) { Write-Host "PASS: Filter logic (Coke is 0 stock so hidden from public Drinks)" -ForegroundColor Green } else { Write-Host "FAIL: Filter logic" -ForegroundColor Red }

Write-Host "--- Admin Delete Food ---"
Test-Request -Method DELETE -Route "/api/admin/foods/1" -Token $adminToken -ExpectedStatus 200
$afterDel = Test-Request -Method GET -Route "/api/foods" -ExpectedStatus 200
if ($afterDel.data.Count -eq 1) { Write-Host "PASS: Soft Delete successful" -ForegroundColor Green } else { Write-Host "FAIL: Soft Delete" -ForegroundColor Red }
