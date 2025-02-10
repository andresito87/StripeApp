<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('wallet_type', function (Blueprint $table) {
            $table->id('id_wallet_type'); // Clave primaria
            $table->string('type_name', 10)->unique(); // PUSH o POP
        });

        // Insertar los valores PUSH y POP por defecto
        DB::table('wallet_type')->insert([
            ['id_wallet_type' => 1, 'type_name' => 'PUT'],
            ['id_wallet_type' => 2, 'type_name' => 'POP']
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_type');
    }
};
