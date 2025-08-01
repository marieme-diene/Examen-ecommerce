<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'amount',
        'payment_method',
        'transaction_id',
        'status',
        'details'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'details' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the order that owns the payment.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Mark the payment as completed.
     */
    public function markAsCompleted(): void
    {
        $this->update(['status' => 'completed']);
        $this->order()->update(['payment_status' => 'paid']);
    }

    /**
     * Mark the payment as failed.
     */
    public function markAsFailed(): void
    {
        $this->update(['status' => 'failed']);
        $this->order()->update(['payment_status' => 'failed']);
    }
}
