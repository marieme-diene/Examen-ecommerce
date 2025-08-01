<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PaymentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Seuls les administrateurs peuvent voir tous les paiements
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Payment $payment): bool
    {
        // L'utilisateur peut voir son propre paiement ou un administrateur peut voir n'importe quel paiement
        return $user->id === $payment->order->user_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Les paiements sont créés via le processus de commande, pas directement par l'utilisateur
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Payment $payment): bool
    {
        // Seuls les administrateurs peuvent mettre à jour un paiement
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Payment $payment): bool
    {
        // Les paiements ne devraient pas être supprimés, seulement remboursés
        return false;
    }
    
    /**
     * Determine whether the user can refund the payment.
     */
    public function refund(User $user, Payment $payment): bool
    {
        // Seuls les administrateurs peuvent effectuer des remboursements
        // et seulement si le paiement est complété et n'a pas déjà été remboursé
        return $user->isAdmin() && 
               $payment->status === 'completed' && 
               $payment->status !== 'refunded';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Payment $payment): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Payment $payment): bool
    {
        return false;
    }
}
