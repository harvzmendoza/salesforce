<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CallSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'call_date',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'call_date' => 'date',
        ];
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function callRecording(): HasOne
    {
        return $this->hasOne(CallRecording::class);
    }
}
