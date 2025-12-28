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
        $query = Store::query()
            ->select(['stores.id', 'stores.store_name'])
            ->distinct();

        $hasCallDateFilter = $request->has('call_date') && $request->call_date;
        $hasUserIdFilter = $request->has('user_id') && $request->user_id;

        // Join call_schedules if either filter is present
        if ($hasCallDateFilter || $hasUserIdFilter) {
            $query->join('call_schedules', 'stores.id', '=', 'call_schedules.store_id');

            if ($hasCallDateFilter) {
                $query->whereDate('call_schedules.call_date', $request->call_date);
            }

            if ($hasUserIdFilter) {
                $query->where('call_schedules.user_id', $request->user_id);
            }
        }

        $stores = $query->orderBy('stores.store_name')->get();

        return response()->json($stores);
    }
}
