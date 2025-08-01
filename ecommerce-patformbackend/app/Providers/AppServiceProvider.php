<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Barryvdh\DomPDF\Facade as PDF;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->alias(PDF::class, 'PDF');
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Définir la longueur de chaîne par défaut pour éviter les erreurs de clé trop longue
        Schema::defaultStringLength(191);
    }
}
