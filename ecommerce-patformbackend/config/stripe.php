<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Stripe Keys
    |--------------------------------------------------------------------------
    |
    | The Stripe publishable key and secret key give you access to Stripe's
    | API. The "publishable" key is typically used when interacting with
    | Stripe.js while the "secret" key accesses private API endpoints.
    |
    */

    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Stripe Webhooks
    |--------------------------------------------------------------------------
    |
    | Your Stripe webhook secret is used to prevent unauthorized requests to
    | your Stripe webhook handling controllers. The webhook secret may be
    | obtained from your Stripe dashboard after setting up webhooks.
    |
    */

    'webhook' => [
        'secret' => env('STRIPE_WEBHOOK_SECRET'),
        'tolerance' => env('STRIPE_WEBHOOK_TOLERANCE', 300),
    ],

    /*
    |--------------------------------------------------------------------------
    | Cashier Configuration
    |--------------------------------------------------------------------------
    |
    | This is the configuration for Laravel Cashier, which provides an
    | expressive, fluent interface to Stripe's subscription billing services.
    |
    */

    'currency' => env('CASHIER_CURRENCY', 'eur'),
    'currency_locale' => env('CASHIER_CURRENCY_LOCALE', 'fr_FR'),
    'currency_symbol' => env('CASHIER_CURRENCY_SYMBOL', '€'),
    'currency_decimal_separator' => env('CASHIER_CURRENCY_DECIMAL_SEPARATOR', ','),
    'currency_thousands_separator' => env('CASHIER_CURRENCY_THOUSANDS_SEPARATOR', ' '),
];
