<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CallSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CallScheduleController extends Controller
{
    /**
     * Get or create a call schedule for a store, date, and user.
     */
    public function getOrCreate(Request $request): JsonResponse
    {
        $request->validate([
            'store_id' => ['required', 'integer', 'exists:stores,id'],
            'call_date' => ['required', 'date'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $callSchedule = CallSchedule::firstOrCreate(
            [
                'store_id' => $request->store_id,
                'call_date' => $request->call_date,
                'user_id' => $request->user_id,
            ]
        );

        return response()->json($callSchedule);
    }
}
