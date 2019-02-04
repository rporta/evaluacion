<?php
namespace App\Services;
use MongoDB\Client as Mongo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\EmailOpratel;

class DefaultList
{
	/**
	 * [UserInsert description] inserta en mongodb evaluacion, en collection User
	 * @param Request $data [description] array() key (phone, password, site)
	 */
	public function UserInsert($data)
	{
		(new Mongo)->evaluacion->User->insertOne($data);	
		return $data;
	}
	/**
	 * [listaDeUsuarios description] Obtiene la lista de usuarios registrados en mongodb evaluacion
	 * @return [type] [description]
	 */
	public function listaDeUsuarios(){
		$db = (new Mongo)->evaluacion;
		$usuarios = $db->User->find()->toArray();
		return $usuarios;
	}
	/**
	 * [PaymentInsert description] inserta en mongodb evaluacion, en collection Payment
	 * @param Request $data [description] array() key (phone, amount)
	 */
	public function PaymentInsert($data)
	{
		(new Mongo)->evaluacion->Payment->insertOne($data);
		return $data;
	}
	/**
	 * [usuariosSinCobros description] comando artisan para mostrar los usuarios sin cobros al dia, notificar la cantidad de usuarios por mail
	 * @return [type] [description] por comando muestra la lista de usuarios por key: 'phone'
	 */
	public function usuariosSinCobros(){

		$date = date('d-m-Y');
		$db = (new Mongo)->evaluacion;
		$usuarios = $db->User->find()->toArray();
		$pagos = $db->Payment->find()->toArray();
		$cantidadUsuariosSinCobro = count($usuarios);
		$mensaje = array();
		$mensaje[] = "Lista de usuarios sin cobro :\n";
		foreach ($usuarios as $rU) {
			foreach ($pagos as $rP) {
				if(!empty($rU['phone']) && !empty($rP['phone'])){					
					$cobro = $rU['phone'] == $rP['phone'];		
					if($cobro){
						$cantidadUsuariosSinCobro -= $cobro ? 1 : 0;
					}else{
						$mensaje[] = "\t{$rU['phone']}\n";
					}
				}
			}
		}
		$mensajeCorreo = "La cantidad de usuarios sin cobros en el dia {$date} es : {$cantidadUsuariosSinCobro} \n";
		$mensaje[] = $mensajeCorreo;
		$objMail = new \stdClass();
		$objMail->msj = $mensajeCorreo;
		$to = array();
		$to['ramiro'] = "ramiro.portas@gmail.com";
		$to['benjamin'] = "benjamin.echeverria@opratel.com";
		Mail::to($to)->send(new EmailOpratel($objMail));
		
		return implode("", $mensaje);
	}

	/**
	 * [getApi description] metodo para consumir servicios api rest (multi threaded)
	 * @param  [obj] $arg [description] un objeto con atributos 'data' (array), 'url' (string) 
	 * @return [string]      [description] respuesta 'curl_exec'
	 */
	public function getApi($arg){
		$fields = array();
		foreach ($arg->data as $k => $v) {
			$fields[] = "{$k}={$v}";
		}
		$data = implode("&", $fields) . ";";
		$cliente = curl_init();
		curl_setopt($cliente, CURLOPT_URL, $arg->url);
		// curl_setopt($cliente, CURLOPT_PORT, $_SERVER['SERVER_PORT']);
		curl_setopt($cliente, CURLOPT_POST, 1);
		curl_setopt($cliente, CURLOPT_POSTFIELDS, $data);
		curl_setopt($cliente, CURLOPT_RETURNTRANSFER, 1);
		$rta = curl_exec($cliente);
		curl_close($cliente);
		return $rta;
	}

	/**
	 * [createData description] crea un objeto para brindar datos
	 * @return [type] [description] instancia stdClass
	 */
	public function createData(){
		return new \stdClass();
	}
}