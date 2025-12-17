<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    protected $fillable = ['store_name', 'territory_id'];

    public function territory()
    {
        return $this->belongsTo(Territory::class);
    }
}
