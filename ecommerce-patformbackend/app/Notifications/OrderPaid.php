<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPaid extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The order instance.
     *
     * @var \App\Models\Order
     */
    public $order;

    /**
     * Create a new notification instance.
     *
     * @param  \App\Models\Order  $order
     * @return void
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $url = url('/orders/' . $this->order->id);
        
        return (new MailMessage)
            ->subject('Confirmation de paiement - Commande #' . $this->order->id)
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line('Nous avons bien reçu votre paiement pour la commande #' . $this->order->id . '.')
            ->line('**Montant total :** ' . number_format($this->order->total, 2, ',', ' ') . ' €')
            ->line('**Méthode de paiement :** ' . $this->order->payment_method)
            ->action('Voir ma commande', $url)
            ->line('Merci pour votre achat sur ' . config('app.name') . ' !')
            ->line('Nous vous tiendrons informé de l\'avancement de votre commande par email.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'order_id' => $this->order->id,
            'amount' => $this->order->total,
            'message' => 'Votre paiement pour la commande #' . $this->order->id . ' a été accepté.'
        ];
    }
}
