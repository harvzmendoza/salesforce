<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('call_recordings', function (Blueprint $table) {
            $table->id();
            $table->integer('call_schedule_id');
            $table->longText('product_id');
            $table->longText('signature');
            $table->longText('post_activity');
            $table->timestamps();
        });
    }
};