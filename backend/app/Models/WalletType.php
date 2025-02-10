<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalletType extends Model
{
    use HasFactory;

    protected $table = 'wallet_type';
    protected $primaryKey = 'id_wallet_type';
    public $timestamps = false;

    protected $fillable = ['type_name'];

    // Relación con Wallet (un tipo puede estar en muchas transacciones)
    public function wallets()
    {
        return $this->hasMany(Wallet::class, 'id_wallet_type', 'id_wallet_type');
    }
}
