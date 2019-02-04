<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\DefaultList;

class PaymentController extends Controller
{
	public function insert(Request $request, DefaultList $service)
	{
		$data['registre:payment'] = "ok";
		$json = $request->json()->all();
		$service->PaymentInsert(array(
			'phone' => is_null($request['phone']) ? $json['phone'] : $request['phone'], 
			'amount' => is_null($request['amount']) ? $json['amount'] : $request['amount']
		));			
		return response()->json($data, 200);
	}
}
