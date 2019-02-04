<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\DefaultList;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind('App\Services\DefaultList', function ($app) {
            return new DefaultList();
        });
    }
}
