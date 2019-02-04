<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\DefaultList;


class main extends Controller
{
	private $data;

	public function __construct(DefaultList $service)
	{
		$this->data = $service->createData();
		$this->setData($this->data);
	}

	public function index(Request $request, DefaultList $service)
	{
		return view('index', array('data' => $this->data));
	}

	public function setData($data){
		$data->text = "soy text";
	}
}
