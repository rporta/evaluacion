<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DefaultList;

class usuariosSinCobros extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:usuariosSinCobros';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Obtiene los usuarios sin cobros el dia en curso y notificar la cantidad de usuarios por mail, solo la cantidad.';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle(DefaultList $service)
    {
        echo $service->usuariosSinCobros();
    }
}
