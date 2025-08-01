<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// routes/api.php
Route::prefix('api')->group(function () {
    // Auth Routes
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        // Products
        Route::apiResource('products', ProductController::class);
        // Categories
        Route::apiResource('categories', CategoryController::class);
        // Orders
        Route::apiResource('orders', OrderController::class);
        // Payments
        Route::apiResource('payments', PaymentController::class);
    });
});
