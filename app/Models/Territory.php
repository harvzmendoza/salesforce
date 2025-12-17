<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Territory extends Model
{
    protected $fillable = ['territory_name', 'district_id'];

    public function district()
    {
        return $this->belongsTo(District::class);
    }
}
