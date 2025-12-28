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
        $recording = CallRecording::create($request->validated());

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

        return response()->json($recording->load('callSchedule'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCallRecordingRequest $request, CallRecording $callRecording): JsonResponse
    {
        $callRecording->update($request->validated());

        return response()->json($callRecording->load('callSchedule'));
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
