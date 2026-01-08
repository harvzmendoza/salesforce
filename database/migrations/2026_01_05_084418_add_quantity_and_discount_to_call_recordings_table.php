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
        Schema::table('call_recordings', function (Blueprint $table) {
            $table->integer('quantity')->nullable()->after('product_id');
            $table->decimal('discount', 10, 2)->nullable()->after('quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('call_recordings', function (Blueprint $table) {
            $table->dropColumn(['quantity', 'discount']);
        });
    }
};
