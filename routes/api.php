<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\CallRecordingController;
use App\Http\Controllers\Api\CallScheduleController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');

Route::apiResource('tasks', TaskController::class)->middleware('auth:sanctum');

Route::post('/tasks/batch-sync', [TaskController::class, 'batchSync'])->middleware('auth:sanctum');

Route::apiResource('attendances', AttendanceController::class)->middleware('auth:sanctum');
Route::get('/stores', [StoreController::class, 'index'])->middleware('auth:sanctum');
Route::get('/products', [ProductController::class, 'index'])->middleware('auth:sanctum');
Route::post('/call-schedules/get-or-create', [CallScheduleController::class, 'getOrCreate'])->middleware('auth:sanctum');
Route::apiResource('call-recordings', CallRecordingController::class)->middleware('auth:sanctum');
Route::get('/call-recordings/schedule/{callScheduleId}', [CallRecordingController::class, 'getBySchedule'])->middleware('auth:sanctum');
Route::put('/call-recordings/{id}/post-activity', [CallRecordingController::class, 'updatePostActivity'])->middleware('auth:sanctum');
