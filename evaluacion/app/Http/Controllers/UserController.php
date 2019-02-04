<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\DefaultList;

class UserController extends Controller
{
	public function insert(Request $request, DefaultList $service)
	{
		$data['registre_user'] = "ok";
		$json = $request->json()->all();
		$service->UserInsert(array(
			'phone' => is_null($request['phone']) ? $json['phone'] : $request['phone'], 
			'password' => is_null($request['password']) ? $json['password'] : $request['password'], 
			'site' => is_null($request['site']) ? $json['site'] : $request['site']
		));	
		return response()->json($data, 200);
	}
	public function get(DefaultList $service)
	{
		$data = $service->listaDeUsuarios();
		return response()->json($data, 200);
	}
	
}