<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCallRecordingRequest;
use App\Http\Requests\UpdateCallRecordingRequest;
use App\Models\CallRecording;
use Illuminate\Http\JsonResponse;

class CallRecordingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $recordings = CallRecording::with('callSchedule')->latest()->get();

        return response()->json($recordings);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCallRecordingRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['product_id'] = json_encode($data['product_id']);

        $recording = CallRecording::create($data);

        return response()->json($recording->load('callSchedule'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(CallRecording $callRecording): JsonResponse
    {
        return response()->json($callRecording->load('callSchedule'));
    }

    /**
     * Get recording by call schedule ID.
     */
    public function getBySchedule(int $callScheduleId): JsonResponse
    {
        $recording = CallRecording::where('call_schedule_id', $callScheduleId)->first();

        if (! $recording) {
            return response()->json(['message' => 'Recording not found'], 404);
        }

        // Decode product_id JSON and load products
        if ($recording->product_id) {
            $productIds = json_decode($recording->product_id, true);
            if (is_array($productIds)) {
                $recording->products = \App\Models\Product::whereIn('id', $productIds)->get();
            }
        }

        return response()->json($recording->load('callSchedule'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCallRecordingRequest $request, CallRecording $callRecording): JsonResponse
    {
        $data = $request->validated();
        $data['product_id'] = json_encode($data['product_id']);

        $callRecording->update($data);

        return response()->json($callRecording->load('callSchedule'));
    }

    /**
     * Update post activity for a recording.
     */
    public function updatePostActivity(int $id): JsonResponse
    {
        $request = request();
        $request->validate([
            'post_activity' => ['nullable', 'string'],
        ]);

        $recording = CallRecording::findOrFail($id);
        $recording->update([
            'post_activity' => $request->post_activity ?: null,
        ]);

        return response()->json($recording->load('callSchedule'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CallRecording $callRecording): JsonResponse
    {
        $callRecording->delete();

        return response()->json(null, 204);
    }
}
