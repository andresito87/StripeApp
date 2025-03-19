<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DisputedTransaction extends Model
{
    use HasFactory;

    protected $table = 'disputed_transactions';

    protected $fillable = [
        'dispute_id',
        'payment_intent_id',
        'reason',
        'status',
    ];

    public function wallet()
    {
        return $this->belongsTo(Wallet::class, 'payment_intent_id', 'id_transaction');
    }
}
