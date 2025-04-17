<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalletTypeError extends Model
{
    use HasFactory;

    protected $table = 'wallet_type_error';
    protected $primaryKey = 'id_wallet_type_error';
    public $timestamps = false;

    protected $fillable = ['code', 'description'];

    // Relación con Wallet (un tipo de error puede estar en muchas transacciones)
    public function wallets()
    {
        return $this->hasMany(Wallet::class, 'id_wallet_type_error', 'id_wallet_type_error');
    }
}
