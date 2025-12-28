<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Store extends Model
{
    protected $fillable = ['store_name', 'territory_id'];

    public function territory(): BelongsTo
    {
        return $this->belongsTo(Territory::class);
    }

    public function callSchedules(): HasMany
    {
        return $this->hasMany(CallSchedule::class);
    }
}
