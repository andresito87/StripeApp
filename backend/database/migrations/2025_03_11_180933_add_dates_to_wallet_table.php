<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDatesToWalletTable extends Migration
{
    public function up()
    {
        Schema::table('wallet', function (Blueprint $table) {
            // Agregar las nuevas columnas
            $table->string('id_refund')->nullable()->after('id_user');
            $table->timestamp('date_verified')->nullable()->after('id_refund');
            $table->timestamp('date_refunded')->nullable()->after('date_verified');
        });
    }

    public function down()
    {
        Schema::table('wallet', function (Blueprint $table) {
            // Eliminar las columnas en caso de que la migración sea revertida
            $table->dropColumn(['date_verified', 'date_refunded']);
        });
    }
}
