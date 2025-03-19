<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('disputed_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('dispute_id')->unique(); // ID único de la disputa
            $table->string('payment_intent_id')->index(); // ID de Payment Intent (clave foránea)
            $table->string('status')->default('pending');
            $table->text('reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disputed_transactions');
    }
};

