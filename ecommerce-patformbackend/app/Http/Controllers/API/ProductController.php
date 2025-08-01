<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * Afficher une liste des produits
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $products = Product::with('category')
            ->latest()
            ->paginate(10);

        return response()->json($products);
    }

    /**
     * Enregistrer un nouveau produit
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:100',
        ]);

        // Gestion de l'upload de l'image
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
            $validated['image_url'] = Storage::url($imagePath);
        }

        // Génération du slug
        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(5);
        
        // Valeur par défaut pour is_active
        $validated['is_active'] = $validated['is_active'] ?? true;

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Produit créé avec succès',
            'product' => $product->load('category')
        ], 201);
    }

    /**
     * Afficher un produit spécifique
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Product $product)
    {
        return response()->json($product->load('category'));
    }

    /**
     * Mettre à jour un produit existant
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'category_id' => ['sometimes', 'required', 'integer', Rule::exists('categories', 'id')],
            'image' => 'nullable|image|max:2048',
            'is_active' => 'sometimes|boolean',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:100',
        ]);

        // Gestion de la mise à jour de l'image
        if ($request->hasFile('image')) {
            // Supprimer l'ancienne image si elle existe
            if ($product->image_url) {
                $oldImagePath = str_replace('/storage', 'public', $product->image_url);
                Storage::delete($oldImagePath);
            }
            
            $imagePath = $request->file('image')->store('products', 'public');
            $validated['image_url'] = Storage::url($imagePath);
        }

        // Mise à jour du slug si le nom a changé
        if ($request->has('name') && $request->name !== $product->name) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(5);
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Produit mis à jour avec succès',
            'product' => $product->load('category')
        ]);
    }

    /**
     * Supprimer un produit
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Product $product)
    {
        // Supprimer l'image associée si elle existe
        if ($product->image_url) {
            $imagePath = str_replace('/storage', 'public', $product->image_url);
            Storage::delete($imagePath);
        }

        $product->delete();

        return response()->json([
            'message' => 'Produit supprimé avec succès'
        ]);
    }

    /**
     * Recherche avancée de produits
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $query = Product::query()->with('category');
        if ($request->filled('q')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->q . '%')
                  ->orWhere('description', 'like', '%' . $request->q . '%');
            });
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }
        if ($request->filled('available')) {
            if ($request->available) {
                $query->where('stock', '>', 0);
            }
        }
        $products = $query->paginate(12);
        return response()->json($products);
    }
}
