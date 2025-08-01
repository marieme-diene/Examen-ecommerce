<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * Afficher la liste des commandes de l'utilisateur connecté
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $user = Auth::user();
        $orders = $user->orders()
            ->with(['items.product', 'payment'])
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    /**
     * Créer une nouvelle commande
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string',
            'shipping_city' => 'required|string|max:100',
            'shipping_postal_code' => 'required|string|max:20',
            'shipping_country' => 'required|string|max:100',
            'notes' => 'nullable|string',
        ]);

        // Démarrer une transaction de base de données
        return \DB::transaction(function () use ($user, $validated) {
            // Calculer le total de la commande et vérifier le stock
            $total = 0;
            $orderItems = [];
            
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                
                // Vérifier le stock
                if ($product->stock < $item['quantity']) {
                    return response()->json([
                        'message' => "Stock insuffisant pour le produit: {$product->name}",
                        'product_id' => $product->id,
                        'available_stock' => $product->stock
                    ], 422);
                }
                
                // Calculer le sous-total
                $subtotal = $product->price * $item['quantity'];
                $total += $subtotal;
                
                // Préparer les éléments de commande
                $orderItems[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'total' => $subtotal,
                ];
                
                // Mettre à jour le stock
                $product->decrement('stock', $item['quantity']);
            }
            
            // Créer la commande
            $order = $user->orders()->create([
                'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                'status' => 'pending',
                'total' => $total,
                'shipping_address' => $validated['shipping_address'],
                'shipping_city' => $validated['shipping_city'],
                'shipping_postal_code' => $validated['shipping_postal_code'],
                'shipping_country' => $validated['shipping_country'],
                'notes' => $validated['notes'] ?? null,
            ]);
            
            // Ajouter les articles à la commande
            $order->items()->createMany($orderItems);
            
            // Créer un paiement en attente
            $payment = $order->payment()->create([
                'amount' => $total,
                'status' => 'pending',
                'payment_method' => 'credit_card', // À remplacer par la méthode de paiement réelle
                'transaction_id' => 'TXN-' . strtoupper(Str::random(10)),
            ]);
            
            return response()->json([
                'message' => 'Commande créée avec succès',
                'order' => $order->load('items.product', 'payment'),
                'payment_required' => true,
                'payment_id' => $payment->id
            ], 201);
        });
    }

    /**
     * Afficher les détails d'une commande spécifique
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Order $order)
    {
        // Vérifier que l'utilisateur est autorisé à voir cette commande
        $this->authorize('view', $order);
        
        return response()->json($order->load('items.product', 'payment'));
    }

    /**
     * Mettre à jour le statut d'une commande (pour les administrateurs)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Order $order)
    {
        // Vérifier que l'utilisateur est un administrateur
        if (!Auth::user()->isAdmin()) {
            return response()->json([
                'message' => 'Non autorisé. Seuls les administrateurs peuvent modifier les commandes.'
            ], 403);
        }
        
        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                Rule::in(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
            ],
            'tracking_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);
        
        // Mettre à jour la commande
        $order->update($validated);
        
        return response()->json([
            'message' => 'Commande mise à jour avec succès',
            'order' => $order->load('items.product', 'payment')
        ]);
    }

    /**
     * Annuler une commande (pour l'utilisateur)
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancel(Order $order)
    {
        // Vérifier que l'utilisateur est autorisé à annuler cette commande
        $this->authorize('update', $order);
        
        // Vérifier que la commande peut être annulée
        if (!in_array($order->status, ['pending', 'processing'])) {
            return response()->json([
                'message' => 'Cette commande ne peut plus être annulée.'
            ], 422);
        }
        
        // Mettre à jour le statut de la commande
        $order->update(['status' => 'cancelled']);
        
        // Rembourser le paiement si nécessaire
        if ($order->payment && $order->payment->status === 'completed') {
            // Ici, vous ajouteriez la logique de remboursement
            // Par exemple, avec Stripe ou un autre processeur de paiement
            $order->payment->update(['status' => 'refunded']);
        }
        
        // Restaurer le stock des produits
        foreach ($order->items as $item) {
            $product = $item->product;
            $product->increment('stock', $item->quantity);
        }
        
        return response()->json([
            'message' => 'Commande annulée avec succès',
            'order' => $order->load('items.product', 'payment')
        ]);
    }
}
