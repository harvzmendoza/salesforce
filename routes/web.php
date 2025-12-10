<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Serve PWA manifest from build directory
Route::get('/manifest.webmanifest', function () {
    // Check build directory first (production)
    $manifestPath = public_path('build/manifest.webmanifest');

    // Fallback to public root if not in build (dev or alternative setup)
    if (! File::exists($manifestPath)) {
        $manifestPath = public_path('manifest.webmanifest');
    }

    if (File::exists($manifestPath)) {
        return response(File::get($manifestPath), 200)
            ->header('Content-Type', 'application/manifest+json');
    }

    // Return a minimal manifest if file doesn't exist (prevents 404 errors)
    return response()->json([
        'name' => config('app.name', 'Laravel'),
        'short_name' => config('app.name', 'Laravel'),
        'start_url' => '/',
        'display' => 'standalone',
        'theme_color' => '#1b1b18',
        'background_color' => '#FDFDFC',
        'icons' => [],
    ], 200)->header('Content-Type', 'application/manifest+json');
});

// Serve service worker from build directory
Route::get('/sw.js', function () {
    $swPath = public_path('build/sw.js');

    if (File::exists($swPath)) {
        return response(File::get($swPath), 200)
            ->header('Content-Type', 'application/javascript');
    }

    // Return empty service worker if file doesn't exist (prevents 404 errors)
    return response('// Service worker not found', 200)
        ->header('Content-Type', 'application/javascript');
});

// React SPA routes - all authenticated routes serve the same view
Route::get('/login', function () {
    return view('tasks');
});

Route::get('/dashboard', function () {
    return view('tasks');
})->middleware('auth');

Route::get('/tasks', function () {
    return view('tasks');
})->middleware('auth');
