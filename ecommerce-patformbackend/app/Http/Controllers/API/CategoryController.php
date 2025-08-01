<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * Afficher une liste des catégories
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $categories = Category::withCount('products')
            ->latest()
            ->get();

        return response()->json($categories);
    }

    /**
     * Enregistrer une nouvelle catégorie
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        // Gestion de l'upload de l'image
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('categories', 'public');
            $validated['image_url'] = Storage::url($imagePath);
        }

        // Génération du slug
        $validated['slug'] = Str::slug($validated['name']);

        // Valeur par défaut pour is_active
        $validated['is_active'] = $validated['is_active'] ?? true;

        $category = Category::create($validated);

        return response()->json([
            'message' => 'Catégorie créée avec succès',
            'category' => $category
        ], 201);
    }

    /**
     * Afficher une catégorie spécifique avec ses produits
     *
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Category $category)
    {
        // Charger les produits de la catégorie avec pagination
        $products = $category->products()
            ->with('category')
            ->latest()
            ->paginate(12);

        return response()->json([
            'category' => $category,
            'products' => $products
        ]);
    }

    /**
     * Mettre à jour une catégorie existante
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->ignore($category->id)
            ],
            'description' => 'nullable|string',
            'parent_id' => [
                'nullable',
                'exists:categories,id',
                function ($attribute, $value, $fail) use ($category) {
                    if ($value == $category->id) {
                        $fail('Une catégorie ne peut pas être son propre parent.');
                    }
                },
            ],
            'image' => 'nullable|image|max:2048',
            'is_active' => 'sometimes|boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        // Gestion de la mise à jour de l'image
        if ($request->hasFile('image')) {
            // Supprimer l'ancienne image si elle existe
            if ($category->image_url) {
                $oldImagePath = str_replace('/storage', 'public', $category->image_url);
                Storage::delete($oldImagePath);
            }

            $imagePath = $request->file('image')->store('categories', 'public');
            $validated['image_url'] = Storage::url($imagePath);
        }

        // Mise à jour du slug si le nom a changé
        if ($request->has('name') && $request->name !== $category->name) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return response()->json([
            'message' => 'Catégorie mise à jour avec succès',
            'category' => $category
        ]);
    }

    /**
     * Supprimer une catégorie
     *
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Category $category)
    {
        // Vérifier si la catégorie a des sous-catégories
        if ($category->children()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer une catégorie qui a des sous-catégories.'
            ], 422);
        }

        // Vérifier si la catégorie contient des produits
        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer une catégorie qui contient des produits.'
            ], 422);
        }

        // Supprimer l'image associée si elle existe
        if ($category->image_url) {
            $imagePath = str_replace('/storage', 'public', $category->image_url);
            Storage::delete($imagePath);
        }

        $category->delete();

        return response()->json([
            'message' => 'Catégorie supprimée avec succès'
        ]);
    }
}
