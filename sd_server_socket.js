const express = require('express');
const bodyParser = require('body-parser');
const app = express()

const APP_PORT =5555

// app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

// hacemos referencia a la carpeta que contendra los view
app.set('views', __dirname + '/views');
// le decimos que tipo de archivo es el que contiene la vista
app.set('view engine', 'pug')

// ************************** ruteo **************************
// ***********************************************************

app.get('/', (req, res) => {
    res.render('sd_home')
  })

app.get('/simulador', function (req, res) {
    res.render('sd_home', {weather: null, error: null});
  })

 app.get('/sim-compras', function (req, res) {
    res.render('sd_sim_compras', {weather: null, error: null});
  })

app.get('/sim-web', function (req, res) {
    res.render('sd_sim_web', {weather: null, error: null});
  })

app.get('/sim-infracciones', function (req, res) {
    res.render('sd_sim_infracciones', {weather: null, error: null});
  })

app.get('/sim-pagos', function (req, res) {
    res.render('sd_sim_pagos', {weather: null, error: null});
  })

app.get('/sim-envios', function (req, res) {
    res.render('sd_sim_envios', {weather: null, error: null});
  })

app.get('/sim-publicaciones', function (req, res) {
    res.render('sd_sim_publicaciones', {weather: null, error: null});
  })

// ***********************************************************
// ***********************************************************

// #########################################################
// ############ SERVIDOR: escucha la vista #################

const server = app.listen(APP_PORT, function () {
  console.log('Servidor PUG escuchando en localhost:',APP_PORT,'..')
})


const ioSockectServer = require('socket.io').listen(server)

// escucha las peticiones de los cliente segun el evento
ioSockectServer.on('connection', (socket) => {
    console.log('[Socket.io]: Un usuario conectado al SERVER PUG')
    pedirEstadoServidores();
    socket.on('chatter', (message) => {
      console.log('message : ', message)
      client.pedirInfoDistMonitor("mje");
    })
    // ************** solicitud de ESTADO *****************
    socket.on('estado', (message) => {
      console.log('Se pide el estado : ', message)
      // se pasa la peticion al DIST_MON-IO
      sockClientDistMon.emit('mje-status', 'compras-io', 'status');
    })
    // ****************************************************

    // ************** solicitud de sigPaso *****************
    socket.on('sig-paso', (server, idCompra) => {
      console.log('Pide proximo STEP ['+server+'] ')
      // se pasa la peticion al DIST_MON-IO
      sockClientDistMon.emit('next-step', server, idCompra);
    })
    // ****************************************************

    // ************** nueva compra *****************
    socket.on('new-compra', (datosCompra) => {
      console.log('Pide nueva COMPRA >> datos:', datosCompra)
      // se pasa la peticion al DIST_MON-IO
      sockClientDistMon.emit('create-compra', datosCompra);
    })

    // ************** update tareas pendientes *****************
    socket.on('resp-tareas', (datosCompra) => {
      console.log('Pide nueva COMPRA >> datos:', datosCompra)
      // se pasa la peticion al DIST_MON-IO
      sockClientDistMon.emit('create-compra', datosCompra);
    })

})

// #########################################################
// #########################################################

// ################################################################
// ################ CLIENTE IO del DistMon ########################

const ioSockClient = require('socket.io-client');
var sockClientDistMon = ioSockClient.connect('http://localhost:5557', {reconnect: true});

// Add a connect listener
sockClientDistMon.on('connect', function (sock) {
    console.log('SERVER PUG conectado al DistMonSocJson!!!');
});

// se escucha la resp a la peticion "mje-status" al DIST_MON-IO
// sockClientDistMon.on('resp-mje-status', function(data) {
//   console.log("[resp-mje-status]: Mje recibido del SERVER distMon: ",data);
//   // enviado al cliente PUG
//   ioSockectServer.sockets.emit('resp-estado', data);
// })

// ######################################################
// ################## EVENTOS SIN SRV ###################

// escuchamos cuando se crea una nueva compra
sockClientDistMon.on('upd_compras', function(data) {
  console.log("[upd_compras]: Mje recibido del SERVER distMon: ",data);
  // enviado a todos los clientes PUG (vista de servidores)
  ioSockectServer.sockets.emit('update-compras', data);
})

// ######################################################
// ################## EVENTOS DE COMPRAS ################

sockClientDistMon.on('srv-compras-status', function(data) {
  console.log("[srv-compras-status]: Mje recibido del SERVER distMon: "+data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('status-compras', data);
})

sockClientDistMon.on('tareas_pend_comp', function(data) {
  console.log("[tareas_pend_comp]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('tareas-compras', data);
})

sockClientDistMon.on('resp-mje-status-detalle', function(data) {
  console.log("[resp-mje-status-detalle]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('resp-estado-detalle', data);
})

// se escucha la resp a la peticion "next-step" al DIST_MON-IO
sockClientDistMon.on('resp-next-step', function(data) {
  console.log("[resp-next-step]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('resp-sig-paso', data);
})

// escuchamos los mjes enviados desde el disMon
sockClientDistMon.on('resp-env-step', function(data) {
  console.log("[resp-env-step]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('resp-env', data);
})

// ######################################################
// ################## EVENTOS SRV_WEB ###################

sockClientDistMon.on('srv-web-status', function(data) {
  console.log("[srv-web-status]: Mje recibido del SERVER distMon: "+data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('status-web', data);
})

sockClientDistMon.on('tareas-pend-web', function(data) {
  console.log("[tareas-pend-web]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('tareas-web', data);
})

// se ecucha cuando ingresa una tarea la servidor
sockClientDistMon.on('tarea-ing-web', function(data) {
  console.log("[tarea-ing-web]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('ing-tareas-web', data);
})

// se escucha la resp a la peticion "next-step" al DIST_MON-IO
sockClientDistMon.on('resp-next-step-web', function(data) {
  console.log("[resp-next-step-web]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('resp-step-web', data);
})

// escuchamos los mjes enviados desde el disMon
sockClientDistMon.on('resp-mjes-env-web', function(data) {
  console.log("[resp-mjes-env-web]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('mjes-env-web', data);
})

// ######################################################
// ############## EVENTOS SRV_PUBLICACIONES #############

sockClientDistMon.on('srv-pub-status', function(data) {
  console.log("[srv-pub-status]: Mje recibido del SERVER distMon: "+data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('status-publicacion', data);
})

sockClientDistMon.on('tareas-pend-pub', function(data) {
  console.log("[tareas-pend-pub]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('tareas-pub', data);
})

sockClientDistMon.on('tarea-ing-pub', function(data) {
  console.log("[tarea-ing-pub]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('ing-tareas-pub', data);
})

// se escucha la resp a la peticion "next-step" al DIST_MON-IO
sockClientDistMon.on('resp-next-step-pub', function(data) {
  console.log("[resp-next-step-pub]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('resp-step-pub', data);
})

// escuchamos los mjes enviados desde el disMon
sockClientDistMon.on('resp-mjes-env-pub', function(data) {
  console.log("[resp-mjes-env-pub]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('mjes-env-pub', data);
})

// ######################################################
// ############## EVENTOS SRV_INFRACCIONES ##############

sockClientDistMon.on('srv-infrac-status', function(data) {
  console.log("[srv-infrac-status]: Mje recibido del SERVER distMon: "+data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('status-infraccion', data);
})

sockClientDistMon.on('tareas-pend-infrac', function(data) {
  console.log("[tareas-pend-infrac]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('tareas-infrac', data);
})

sockClientDistMon.on('tarea-ing-infrac', function(data) {
  console.log("[tarea-ing-infrac]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('ing-tareas-infrac', data);
})

// se escucha la resp a la peticion "next-step" al DIST_MON-IO
sockClientDistMon.on('resp-next-step-infrac', function(data) {
  console.log("[resp-next-step-infrac]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('resp-step-infrac', data);
})

// escuchamos los mjes enviados desde el disMon
sockClientDistMon.on('resp-mjes-env-infrac', function(data) {
  console.log("[resp-mjes-env-infrac]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('mjes-env-infrac', data);
})

// ######################################################
// ################# EVENTOS SRV_ENVIOS #################

sockClientDistMon.on('srv-envios-status', function(data) {
  console.log("[srv-envios-status]: Mje recibido del SERVER distMon: "+data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('status-envios', data);
})

sockClientDistMon.on('tareas-pend-envios', function(data) {
  console.log("[tareas-pend-envios]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('tareas-envios', data);
})

sockClientDistMon.on('tarea-ing-envios', function(data) {
  console.log("[tarea-ing-envios]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('ing-tareas-envios', data);
})

// se escucha la resp a la peticion "next-step" al DIST_MON-IO
sockClientDistMon.on('resp-next-step-envios', function(data) {
  console.log("[resp-next-step-envios]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('resp-step-envios', data);
})

// escuchamos los mjes enviados desde el disMon
sockClientDistMon.on('resp-mjes-env-envios', function(data) {
  console.log("[resp-mjes-env-envios]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('mjes-env-envios', data);
})

// ######################################################
// ################# EVENTOS SRV_PAGOS ##################

sockClientDistMon.on('srv-pagos-status', function(data) {
  console.log("[srv-pagos-status]: Mje recibido del SERVER distMon: "+data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('status-pagos', data);
})

sockClientDistMon.on('tareas-pend-pagos', function(data) {
  console.log("[tareas-pend-pagos]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('tareas-pagos', data);
})

sockClientDistMon.on('tarea-ing-pagos', function(data) {
  console.log("[tarea-ing-pagos]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('ing-tareas-pagos', data);
})

// se escucha la resp a la peticion "next-step" al DIST_MON-IO
sockClientDistMon.on('resp-next-step-pagos', function(data) {
  console.log("[resp-next-step-pagos]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('resp-step-pagos', data);
})

// escuchamos los mjes enviados desde el disMon
sockClientDistMon.on('resp-mjes-env-pagos', function(data) {
  console.log("[resp-mjes-env-pagos]: Mje recibido del SERVER distMon: ",data);
  // enviado al cliente PUG
  ioSockectServer.sockets.emit('mjes-env-pagos', data);
})

// ########################################################
// ################## FUNCIONES SOPORTE ###################

// se pide al distMon el estado de todos los servidores
function pedirEstadoServidores(){
  console.log('<all-status> al DIST_MON');
  sockClientDistMon.emit('all-status');
}