<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\ApiErrorException;

class PaymentController extends Controller
{
    /**
     * Constructor
     */
    public function __construct()
    {
        // Initialiser l'API Stripe avec la clé secrète
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Créer une intention de paiement pour une commande
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createPaymentIntent(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'payment_method_id' => 'required|string',
            'save_payment_method' => 'boolean',
        ]);

        $order = Order::findOrFail($validated['order_id']);
        $user = Auth::user();

        // Vérifier que l'utilisateur est autorisé à payer cette commande
        if ($order->user_id !== $user->id) {
            return response()->json([
                'message' => 'Non autorisé à payer cette commande.'
            ], 403);
        }

        // Vérifier que la commande n'a pas déjà été payée
        if ($order->payment && $order->payment->status === 'completed') {
            return response()->json([
                'message' => 'Cette commande a déjà été payée.'
            ], 422);
        }

        try {
            // Créer ou mettre à jour le client Stripe
            $stripeCustomer = $this->getOrCreateStripeCustomer($user);

            // Créer l'intention de paiement
            $paymentIntent = PaymentIntent::create([
                'amount' => $order->total * 100, // Montant en centimes
                'currency' => 'eur',
                'customer' => $stripeCustomer->id,
                'payment_method' => $validated['payment_method_id'],
                'off_session' => false,
                'confirm' => true,
                'confirmation_method' => 'manual',
                'return_url' => config('app.frontend_url') . '/commande/confirmation',
                'metadata' => [
                    'order_id' => $order->id,
                    'user_id' => $user->id,
                ],
            ]);

            // Sauvegarder la méthode de paiement pour une utilisation future si demandé
            if ($validated['save_payment_method'] ?? false) {
                $this->savePaymentMethod($stripeCustomer->id, $validated['payment_method_id']);
            }

            // Mettre à jour le paiement dans la base de données
            $payment = $order->payment ?? $order->payment()->make();
            $payment->fill([
                'payment_method' => 'stripe',
                'transaction_id' => $paymentIntent->id,
                'amount' => $order->total,
                'status' => $paymentIntent->status,
                'details' => [
                    'payment_intent' => $paymentIntent->id,
                    'payment_method' => $validated['payment_method_id'],
                    'customer' => $stripeCustomer->id,
                ],
            ]);
            $payment->save();

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'requires_action' => $paymentIntent->status === 'requires_action',
                'payment_intent_id' => $paymentIntent->id,
                'status' => $paymentIntent->status,
            ]);

        } catch (\Stripe\Exception\CardException $e) {
            // Erreur de carte
            return response()->json([
                'error' => $e->getMessage(),
                'code' => $e->getError()->code,
                'decline_code' => $e->getError()->decline_code ?? null,
                'message' => 'Erreur lors du traitement du paiement. Veuillez vérifier les informations de votre carte.',
            ], 400);
        } catch (\Exception $e) {
            // Autres erreurs
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer plus tard.',
            ], 500);
        }
    }

    /**
     * Confirmer un paiement qui nécessite une action supplémentaire (3D Secure, etc.)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function confirmPayment(Request $request)
    {
        $validated = $request->validate([
            'payment_intent_id' => 'required|string',
            'payment_method_id' => 'required|string',
        ]);

        try {
            $paymentIntent = PaymentIntent::retrieve($validated['payment_intent_id']);
            
            // Confirmer l'intention de paiement
            $paymentIntent->confirm([
                'payment_method' => $validated['payment_method_id'],
                'return_url' => config('app.frontend_url') . '/commande/confirmation',
            ]);

            // Mettre à jour le statut du paiement dans la base de données
            $payment = Payment::where('transaction_id', $paymentIntent->id)->first();
            if ($payment) {
                $payment->update([
                    'status' => $paymentIntent->status,
                    'details->payment_intent_status' => $paymentIntent->status,
                ]);

                // Si le paiement est réussi, mettre à jour le statut de la commande
                if ($paymentIntent->status === 'succeeded') {
                    $this->handleSuccessfulPayment($payment);
                }
            }

            return response()->json([
                'status' => $paymentIntent->status,
                'requires_action' => $paymentIntent->status === 'requires_action',
                'client_secret' => $paymentIntent->client_secret,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Erreur lors de la confirmation du paiement.',
            ], 500);
        }
    }

    /**
     * Rembourser un paiement
     *
     * @param  \App\Models\Payment  $payment
     * @return \Illuminate\Http\JsonResponse
     */
    public function refund(Payment $payment)
    {
        // Vérifier que l'utilisateur est un administrateur
        if (!Auth::user()->isAdmin()) {
            return response()->json([
                'message' => 'Non autorisé. Seuls les administrateurs peuvent effectuer des remboursements.'
            ], 403);
        }

        // Vérifier que le paiement peut être remboursé
        if ($payment->status !== 'completed') {
            return response()->json([
                'message' => 'Seuls les paiements complétés peuvent être remboursés.'
            ], 422);
        }

        try {
            // Effectuer le remboursement via Stripe
            $refund = \Stripe\Refund::create([
                'payment_intent' => $payment->transaction_id,
                'reason' => 'requested_by_customer',
            ]);

            // Mettre à jour le statut du paiement
            $payment->update([
                'status' => 'refunded',
                'refunded_at' => now(),
                'details->refund_id' => $refund->id,
            ]);

            // Mettre à jour le statut de la commande associée
            if ($payment->order) {
                $payment->order->update(['status' => 'refunded']);
            }

            return response()->json([
                'message' => 'Paiement remboursé avec succès',
                'refund' => $refund,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Erreur lors du remboursement du paiement.',
            ], 500);
        }
    }

    /**
     * Obtenir ou créer un client Stripe pour l'utilisateur
     *
     * @param  \App\Models\User  $user
     * @return \Stripe\Customer
     */
    protected function getOrCreateStripeCustomer($user)
    {
        // Si l'utilisateur a déjà un ID client Stripe, récupérer le client
        if ($user->stripe_id) {
            return \Stripe\Customer::retrieve($user->stripe_id);
        }

        // Sinon, créer un nouveau client Stripe
        $customer = \Stripe\Customer::create([
            'email' => $user->email,
            'name' => $user->name,
            'phone' => $user->phone,
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);

        // Enregistrer l'ID client Stripe pour l'utilisateur
        $user->stripe_id = $customer->id;
        $user->save();

        return $customer;
    }

    /**
     * Sauvegarder une méthode de paiement pour une utilisation future
     *
     * @param  string  $customerId
     * @param  string  $paymentMethodId
     * @return void
     */
    protected function savePaymentMethod($customerId, $paymentMethodId)
    {
        // Attacher la méthode de paiement au client
        $paymentMethod = \Stripe\PaymentMethod::retrieve($paymentMethodId);
        $paymentMethod->attach(['customer' => $customerId]);

        // Définir comme méthode de paiement par défaut
        \Stripe\Customer::update($customerId, [
            'invoice_settings' => ['default_payment_method' => $paymentMethodId]
        ]);
    }

    /**
     * Traiter un paiement réussi
     *
     * @param  \App\Models\Payment  $payment
     * @return void
     */
    protected function handleSuccessfulPayment($payment)
    {
        // Mettre à jour le statut du paiement
        $payment->update([
            'status' => 'completed',
            'paid_at' => now(),
        ]);

        // Mettre à jour le statut de la commande
        if ($order = $payment->order) {
            $order->update([
                'status' => 'processing',
                'paid_at' => now(),
            ]);

            // Envoyer une notification au client
            // $order->user->notify(new OrderPaid($order));

            // Envoyer une notification à l'administrateur
            // Notification::route('mail', config('mail.admin_address'))
            //     ->notify(new NewOrderNotification($order));
        }
    }
}
