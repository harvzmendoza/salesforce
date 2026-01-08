<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CallRecording extends Model
{
    use HasFactory;

    protected $fillable = [
        'call_schedule_id',
        'product_id',
        'signature',
        'post_activity',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'product_id' => 'array',
        ];
    }

    public function callSchedule(): BelongsTo
    {
        return $this->belongsTo(CallSchedule::class);
    }
}
