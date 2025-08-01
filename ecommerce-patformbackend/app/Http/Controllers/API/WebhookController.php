<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Event as StripeEvent;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class WebhookController extends Controller
{
    /**
     * Gérer les webhooks Stripe
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook.secret');

        try {
            $event = Webhook::constructEvent(
                $payload, $sigHeader, $webhookSecret
            );
        } catch (\UnexpectedValueException $e) {
            // Payload invalide
            Log::error('Webhook Stripe: Payload invalide', ['error' => $e->getMessage()]);
            throw new BadRequestHttpException('Payload invalide');
        } catch (SignatureVerificationException $e) {
            // Signature invalide
            Log::error('Webhook Stripe: Signature invalide', ['error' => $e->getMessage()]);
            throw new BadRequestHttpException('Signature invalide');
        }

        // Traiter l'événement en fonction de son type
        switch ($event->type) {
            case 'payment_intent.succeeded':
                $this->handlePaymentIntentSucceeded($event->data->object);
                break;
            
            case 'payment_intent.payment_failed':
                $this->handlePaymentIntentFailed($event->data->object);
                break;
            
            case 'charge.refunded':
                $this->handleChargeRefunded($event->data->object);
                break;
            
            // Ajouter d'autres types d'événements au besoin
            
            default:
                Log::info('Webhook Stripe: Événement non géré', ['type' => $event->type]);
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Traiter un paiement réussi
     *
     * @param  \Stripe\PaymentIntent  $paymentIntent
     * @return void
     */
    protected function handlePaymentIntentSucceeded($paymentIntent)
    {
        // Trouver le paiement dans la base de données
        $payment = Payment::where('transaction_id', $paymentIntent->id)->first();
        
        if (!$payment) {
            Log::warning('Webhook Stripe: Paiement non trouvé', ['payment_intent' => $paymentIntent->id]);
            return;
        }

        // Mettre à jour le statut du paiement
        $payment->update([
            'status' => 'completed',
            'paid_at' => now(),
            'details->payment_intent_status' => $paymentIntent->status,
        ]);

        // Mettre à jour le statut de la commande
        if ($order = $payment->order) {
            $order->update([
                'status' => 'processing',
                'paid_at' => now(),
            ]);

            // Envoyer une notification au client
            $order->user->notify(new \App\Notifications\OrderPaid($order));

            // Envoyer une notification à l'administrateur
            $adminEmail = config('app.admin.email');
            if ($adminEmail) {
                \Illuminate\Support\Facades\Notification::route('mail', $adminEmail)
                    ->notify(new \App\Notifications\NewOrderNotification($order));
            }
            
            Log::info('Webhook Stripe: Paiement marqué comme payé', [
                'order_id' => $order->id,
                'payment_id' => $payment->id,
                'amount' => $payment->amount,
            ]);
        }
    }

    /**
     * Traiter un échec de paiement
     *
     * @param  \Stripe\PaymentIntent  $paymentIntent
     * @return void
     */
    protected function handlePaymentIntentFailed($paymentIntent)
    {
        // Trouver le paiement dans la base de données
        $payment = Payment::where('transaction_id', $paymentIntent->id)->first();
        
        if (!$payment) {
            Log::warning('Webhook Stripe: Paiement échoué non trouvé', ['payment_intent' => $paymentIntent->id]);
            return;
        }

        // Mettre à jour le statut du paiement
        $payment->update([
            'status' => 'failed',
            'details->failure_message' => $paymentIntent->last_payment_error->message ?? 'Échec du paiement',
            'details->payment_intent_status' => $paymentIntent->status,
        ]);

        // Mettre à jour le statut de la commande
        if ($order = $payment->order) {
            $order->update(['status' => 'payment_failed']);
            
            Log::warning('Webhook Stripe: Paiement échoué', [
                'order_id' => $order->id,
                'payment_id' => $payment->id,
                'error' => $paymentIntent->last_payment_error->message ?? null,
            ]);
        }
    }

    /**
     * Traiter un remboursement
     *
     * @param  \Stripe\Charge  $charge
     * @return void
     */
    protected function handleChargeRefunded($charge)
    {
        // Trouver le paiement dans la base de données
        $payment = Payment::where('transaction_id', $charge->payment_intent)->first();
        
        if (!$payment) {
            Log::warning('Webhook Stripe: Paiement pour remboursement non trouvé', ['payment_intent' => $charge->payment_intent]);
            return;
        }

        // Mettre à jour le statut du paiement
        $payment->update([
            'status' => 'refunded',
            'refunded_at' => now(),
            'details->refund_id' => $charge->refunds->data[0]->id ?? null,
        ]);

        // Mettre à jour le statut de la commande
        if ($order = $payment->order) {
            $order->update(['status' => 'refunded']);
            
            Log::info('Webhook Stripe: Paiement remboursé', [
                'order_id' => $order->id,
                'payment_id' => $payment->id,
                'amount_refunded' => $charge->amount_refunded / 100,
            ]);
        }
    }
}
