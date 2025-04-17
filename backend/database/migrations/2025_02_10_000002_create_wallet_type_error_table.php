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
        Schema::create('wallet_type_error', function (Blueprint $table) {
            $table->id('id_wallet_type_error');
            $table->string('code')->unique();
            $table->string('description');
        });

        // Insertar datos iniciales
        DB::table('wallet_type_error')->insert([
            [
                'code' => 'succeeded',
                'description' => 'Transacción exitosa',
            ],
            [
                'code' => 'failure',
                'description' => 'Transacción fallida',
            ],
            [
                'code' => 'disputed',
                'description' => 'Transacción en disputa',
            ],
            [
                'code' => 'requires_action',
                'description' => 'Transacción que requiere acción',
            ],
            [
                'code' => 'blocked',
                'description' => 'Transacción bloqueada',
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('wallet_type_error');
    }
};
