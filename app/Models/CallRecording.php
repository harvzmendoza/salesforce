<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CallRecording extends Model
{
    use HasFactory;

    protected $fillable = [
        'call_schedule_id',
        'name',
        'price',
        'quantity',
        'discount',
        'signature',
        'post_activity',
    ];
}
