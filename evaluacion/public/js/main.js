// virtual dom
var preloaderFull = app.newComponent('c-preloaderCircleFull').setSectionColor(app.generateColor()).setColorHexa(app.generateColorHexa());
var header = app.newComponent('c-header').setColor(app.color.blue[5]).setColorText(app.colorText.bwt[1]).setTextAling(app.textAling.c);
var main = app.newComponent('c-main').setColor(app.color.bwt[1]).setColorText(app.colorText.blue[8]).setTextAling(app.textAling.c);
var footer = app.newComponent('c-footer').setColor(app.generateColor()).setColorText(app.generateColorText()).setTextAling(app.textAling.c);
var container = app.newComponent("c-container");
var containerListService = app.newComponent("c-container");
var h = app.newComponent("c-h").setText("Evaluación Opratel").setSize(1);
var hTableListService = app.newComponent("c-h").setText("Lista de servicios").setSize(2);
var tableListService = app.newComponent("c-table").setHead(new Array("id", "nombre", "metodo", "url", "parametros","descripcion", "command linux")).setStriped(1).setCardpanel(1).setCentered(1);
tableListService.addRow(new Array(
	"1", 
	"addUser", 
	"POST", 
	"http://localhost:8000/api/adduser", 
	"phone(string), password(string), site(string)", 
	"Agrega un usuario en una base de datos de mongodb llamada  'evaluacion', dentro de la coleccion 'User' con los siguientes campos (phone, password, site)",
	"curl -X POST http://localhost:8000/api/adduser -H \"Accept: application/json\" -H \"Content-Type : application/json\" --data '{\"phone\" : \"12659847\", \"password\" : \"asd654\", \"site\" : \"flores\"}'"
	));
tableListService.addRow(new Array(
	"1", 
	"addPayment", 
	"POST", 
	"http://localhost:8000/api/addpayment", 
	"phone(string), amount(string)", 
	"Agrega un el pago de un usuario en una base de datos de mongodb llamada  'evaluacion', dentro de la coleccion 'Payment' con los siguientes campos (phone, amount)",
	"curl -X POST http://localhost:8000/api/addpayment -H \"Accept: application/json\" -H \"Content-Type : application/json\" --data '{\"phone\" : \"12659847\", \"amount\" : \"50\"}'"
	));
var containerCommand = app.newComponent("c-container");
var hTableCommand = app.newComponent("c-h").setText("Lista de comandos via artisan").setSize(2);
var tableCommand = app.newComponent("c-table").setHead(new Array("id", "nombre", "descripcion", "command linux")).setStriped(1).setCardpanel(1).setCentered(1);
tableCommand.addRow(new Array(
	"1", 
	"app:usuariosSinCobros", 
	"Obtiene los usuarios sin cobros el dia en curso y notificar la cantidad de usuarios por mail, solo la cantidad.",
	"php artisan app:usuariosSinCobros"
	));
var sectionConsumeWs = app.newComponent("c-section").setColor(app.color.blue[5]).setColorText(app.colorText.bwt[1]);
var containerConsumeWs = app.newComponent("c-container");
var hConsumeWs = app.newComponent("c-h").setText("Consumiendo servicios web").setSize(2);
var containerWs1 = app.newComponent("c-container").setCardpanel(1).setColorText(app.colorText.bwt[0]);
var hWs1 = app.newComponent("c-h").setText("addUser").setSize(4);
var inputFieldsPhoneWs1 = app.newComponent("c-inputFields").setText("Phone").setName("ws1-p1");
var inputFieldsPasswordWs1 = app.newComponent("c-inputFields").setText("Password").setName("ws1-p2");
var inputFieldsSiteWs1 = app.newComponent("c-inputFields").setText("Site").setName("ws1-p3");
var buttonWs1 = app.newComponent("c-button").setText("enviar").setColor(app.color.blue[5]);
var containerWs2 = app.newComponent("c-container").setCardpanel(1).setColorText(app.colorText.bwt[0]);
var hWs2 = app.newComponent("c-h").setText("addPayment").setSize(4);
var inputFieldsPhoneWs2 = app.newComponent("c-inputFields").setText("Phone").setName("ws2-p1");
var inputFieldsAmountWs2 = app.newComponent("c-inputFields").setText("Amount").setName("ws2-p2");
var buttonWs2 = app.newComponent("c-button").setText("enviar").setColor(app.color.blue[5]);
var containerListaDeUsuarios = app.newComponent("c-container").setCardpanel(1).setColorText(app.colorText.bwt[0]);
var hListaDeUsuarios = app.newComponent("c-h").setText("Lista de usuarios").setSize(4);
var tableListaDeUsuarios = app.newComponent("c-table").setHead(new Array("id", "Phone")).setStriped(1).setCardpanel(1).setCentered(1);
var modal = app.newComponent("c-modal");
//se crean 2 funciones para resolver el consumo de ws 1 y 2

//consumiendo ws y cargando tabla
var consumeWS1loadtable = function (){
	var option = {};
	option.url = 'http://localhost:8000/api/getuser';
	option.type = 'get';
	option.data = null;
	tableListaDeUsuarios.clearRow();
	var listaDeUsuarios = app.getApi(option);
	$.each(listaDeUsuarios, function(i, v) {
		tableListaDeUsuarios.addRow(new Array(i, v.phone));
	});
	return null;
}

var consumeWS1 = function(){
	var option = {};
	option.url = 'http://localhost:8000/api/adduser';
	option.type = 'post';
	option.data = {};
	option.data.phone = $('input[name="ws1-p1"]').val();
	option.data.password = $('input[name="ws1-p2"]').val();
	option.data.site = $('input[name="ws1-p3"]').val();
	if(!option.data.phone || !option.data.password || !option.data.site){
		modal.setText("Debes llenar todo los campos del formulario addUser");
		modal.open();		
	}else{
		app.getApi(option);
		tableListaDeUsuarios.clearRow();
		consumeWS1loadtable();
	}
	return null;
}

var consumeWS2 = function(){
	var option = {};
	option.url = 'http://localhost:8000/api/addpayment';
	option.type = 'post';
	option.data = {};
	option.data.phone = $('input[name="ws2-p1"]').val();
	option.data.amount = $('input[name="ws2-p2"]').val();
	modal.setText("Debe llenar todo los campos del formulario");
	modal.open();		
	if(!option.data.phone || !option.data.amount){
		modal.setText("Debes llenar todo los campos del formulario addPayment");
		modal.open();		
	}else{
		app.getApi(option);
	}
	return null;
}

consumeWS1loadtable();

setTimeout(() => {
	preloaderFull.setShow(false);
}, 1000);
// real dom
app.setColor(app.generateColor());
app.create(modal);
app.create(preloaderFull);
app.create(header);
app.create(main);
app.create(footer);
header.create(container);
container.create(h);
container.create(app.newComponent("c-br"));
main.create(containerListService);
containerListService.create(hTableListService);
containerListService.create(app.newComponent("c-br"));
containerListService.create(tableListService);
containerListService.create(app.newComponent("c-br"));
main.create(containerCommand);
containerCommand.create(hTableCommand);
containerCommand.create(app.newComponent("c-br"));
containerCommand.create(tableCommand);
containerCommand.create(app.newComponent("c-br"));
containerCommand.create(app.newComponent("c-br"));
containerCommand.create(app.newComponent("c-br"));
main.create(sectionConsumeWs);
sectionConsumeWs.create(containerConsumeWs);
containerConsumeWs.create(hConsumeWs);
containerConsumeWs.create(app.newComponent("c-br"));
containerConsumeWs.create(containerWs1);
containerWs1.create(hWs1);
containerWs1.create(inputFieldsPhoneWs1);
containerWs1.create(inputFieldsPasswordWs1);
containerWs1.create(inputFieldsSiteWs1);
containerWs1.create(buttonWs1);
containerConsumeWs.create(app.newComponent("c-br"));
containerConsumeWs.create(app.newComponent("c-br"));
containerConsumeWs.create(app.newComponent("c-br"));
containerConsumeWs.create(containerWs2);
containerWs2.create(hWs2);
containerWs2.create(inputFieldsPhoneWs2);
containerWs2.create(inputFieldsAmountWs2);
containerWs2.create(buttonWs2);
containerConsumeWs.create(app.newComponent("c-br"));
containerConsumeWs.create(app.newComponent("c-br"));
containerConsumeWs.create(app.newComponent("c-br"));
containerConsumeWs.create(containerListaDeUsuarios);
containerListaDeUsuarios.create(hListaDeUsuarios);
containerListaDeUsuarios.create(app.newComponent("c-br"));
containerListaDeUsuarios.create(tableListaDeUsuarios);

//asignar consumo ws2 a boton
$(buttonWs1.$el).click(function() {
	consumeWS1();
});

$(buttonWs2.$el).click(function() {
	consumeWS2();
});