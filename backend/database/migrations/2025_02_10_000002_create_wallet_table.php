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
        Schema::create('wallet', function (Blueprint $table) {
            $table->id('id_wallet'); // Llave primaria con AUTO_INCREMENT
            $table->string('description', 64);
            $table->float('amount');
            $table->dateTime('date_created')->default(now());
            $table->string('status', 20)->nullable();
            $table->string('id_transaction', 256)->nullable();
            $table->unsignedBigInteger('id_wallet_type');
            $table->unsignedBigInteger('id_user');

            // Índices y claves foráneas
            $table->foreign('id_user')->references('id_user')->on('users')->onDelete('cascade');
            $table->foreign('id_wallet_type')->references('id_wallet_type')->on('wallet_type')->onDelete('cascade');
        });

        DB::statement("ALTER TABLE wallet AUTO_INCREMENT = 15;");
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('wallet');
    }
};
