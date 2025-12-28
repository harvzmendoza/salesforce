<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CallSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'call_date',
        'user_id',
    ];
}
