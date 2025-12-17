<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class District extends Model
{
    protected $fillable = ['region_id', 'district_name'];

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function territories()
    {
        return $this->hasMany(Territory::class);
    }
}
