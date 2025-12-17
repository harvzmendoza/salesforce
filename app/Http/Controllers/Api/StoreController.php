<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $stores = Store::query()
            ->select(['id', 'store_name'])
            ->orderBy('store_name')
            ->get();

        return response()->json($stores);
    }
}


