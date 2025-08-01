<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewOrderNotification extends Notification implements ShouldQueue
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
        $url = url('/admin/orders/' . $this->order->id);
        
        return (new MailMessage)
            ->subject('Nouvelle commande #' . $this->order->id)
            ->greeting('Nouvelle commande !')
            ->line('Une nouvelle commande a été passée sur ' . config('app.name') . '.')
            ->line('**Numéro de commande :** #' . $this->order->id)
            ->line('**Client :** ' . $this->order->user->name)
            ->line('**Email :** ' . $this->order->user->email)
            ->line('**Montant total :** ' . number_format($this->order->total, 2, ',', ' ') . ' €')
            ->line('**Méthode de paiement :** ' . $this->order->payment_method)
            ->action('Voir la commande', $url)
            ->line('Merci d\'effectuer le traitement de cette commande dans les plus brefs délais.');
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
            'user_id' => $this->order->user_id,
            'amount' => $this->order->total,
            'message' => 'Nouvelle commande #' . $this->order->id . ' de ' . $this->order->user->name
        ];
    }
}
