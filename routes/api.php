<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');

Route::apiResource('tasks', TaskController::class)->middleware('auth:sanctum');

Route::post('/tasks/batch-sync', [TaskController::class, 'batchSync'])->middleware('auth:sanctum');

Route::apiResource('attendances', AttendanceController::class)->middleware('auth:sanctum');
