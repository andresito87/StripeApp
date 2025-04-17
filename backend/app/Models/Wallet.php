<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    use HasFactory;

    protected $table = 'wallet'; // Especifica el nombre exacto de la tabla
    protected $primaryKey = 'id_wallet'; // Define la clave primaria
    public $timestamps = false; // Deshabilita timestamps si no tienes `created_at` y `updated_at`

    protected $fillable = [
        'description',
        'amount',
        'status',
        'id_type_error',
        'id_transaction',
        'id_wallet_type',
        'id_user',
        'id_refund',
        'date_created',
        'date_verified',
        'date_refunded'
    ];

    // Relación con el usuario (User)
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    // Relación con el tipo de transacción (WalletType)
    public function walletType()
    {
        return $this->belongsTo(WalletType::class, 'id_wallet_type', 'id_wallet_type');
    }

    // Relación con la tabla disputed_transactions
    public function dispute()
    {
        return $this->hasOne(DisputedTransaction::class, 'payment_intent_id', 'id_transaction');
    }

    // Relación con la tabla wallet_type_error
    public function walletTypeError()
    {
        return $this->belongsTo(WalletTypeError::class, 'id_wallet_type_error', 'id_wallet_type_error');
    }
}
