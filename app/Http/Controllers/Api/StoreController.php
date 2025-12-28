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

        // Add recording status for each store
        if ($hasCallDateFilter && $hasUserIdFilter) {
            $callScheduleIds = \App\Models\CallSchedule::where('call_date', $request->call_date)
                ->where('user_id', $request->user_id)
                ->whereIn('store_id', $stores->pluck('id'))
                ->pluck('id');

            $recordings = \App\Models\CallRecording::whereIn('call_schedule_id', $callScheduleIds)
                ->get()
                ->keyBy('call_schedule_id');

            $callSchedules = \App\Models\CallSchedule::whereIn('id', $callScheduleIds)
                ->get()
                ->keyBy('store_id');

            $stores = $stores->map(function ($store) use ($callSchedules, $recordings) {
                $callSchedule = $callSchedules->get($store->id);
                $recording = $callSchedule ? $recordings->get($callSchedule->id) : null;

                $store->has_recording = $recording !== null;
                $store->has_post_activity = $recording && ! empty($recording->post_activity);
                $store->call_schedule_id = $callSchedule?->id;

                return $store;
            });
        } else {
            // If filters not complete, set defaults
            $stores = $stores->map(function ($store) {
                $store->has_recording = false;
                $store->has_post_activity = false;
                $store->call_schedule_id = null;

                return $store;
            });
        }

        return response()->json($stores);
    }
}
