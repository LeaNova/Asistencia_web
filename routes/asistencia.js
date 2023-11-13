var express = require('express');
var router = express.Router();
var axios = require('axios')
var QRCode = require('qrcode')

const URL_BASE = require('../config')

router.get('/qr/create', async (req, res) => {
  const usuario = req.session.usuario
  const token = req.session.token
  let _success, _error, code

  let date = new Date()
  const fecha =  `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`

  await axios.get(URL_BASE + '/ingreso/get/today/' + fecha, {
    headers: {
      'Authorization': token
    }
  }).then((result) => {
    code = result.data
  }).catch((error) => {
    _error = 'Error en obtener peticion. ' + error.code
  })

  res.render('./asistencia/code', { title: 'Codigo', usuario: usuario, error: _error, success: _success, code: code });
});

router.post('/qr/create', async (req, res) => {
  const usuario = req.session.usuario
  const token = req.session.token
  let _success, _error, code
  let date = new Date()
  
  await axios.post(URL_BASE + '/ingreso/create', {
      fecha: date
  }, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': token
    }
  }).then((result) => {
    code = result.data
    _success = 'Código generado correctamente.'
  }).catch((error) => {
    if(error.code == 'ECONNREFUSED') _error = 'Sin conexion al servidor'
    if(error.code == 'ERR_BAD_REQUEST') _error = 'Error en obtener código'
  })

  res.render('./asistencia/code', { title: 'Codigo', usuario: usuario, error: _error, success: _success, code: code });
});

router.get('/qr/list', async (req, res) => {
  const usuario = req.session.usuario
  const token = req.session.token

  let _error, lista

  await axios.get(URL_BASE + '/ingreso/get/list', {
    headers: {
      'Authorization': token
    }
  }).then((result) => {
    lista = result.data
  }).catch((error) => {
    _error = error.code
  })

  if(lista) {
    lista = fixDate(lista)
  }

  res.render('./asistencia/codelist', { title: 'Lista codigos', usuario: usuario, error: _error, lista: lista });
});

router.get('/qr', async (req, res) => {
  try {
    const usuario = req.session.usuario
    const token = req.session.token
    let _error, codigo

    await axios.get(URL_BASE + '/ingreso/get/last', {
      headers: {
        'Authorization': token
      }
    }).then((result) => {
      codigo = result.data
    })

    if(codigo) {
      let time = new Date()

      let fecha = castToDate(codigo.fecha)
      let hora = getActualTime(time)

      let seconds = time.getSeconds()
      if (seconds < 10) seconds = "0" + seconds

      let qr = await QRCode.toDataURL('QRasistencia&' + codigo.codIngreso + "&" + hora + "&" + seconds)
      
      res.render('./asistencia/qr', { title: 'Asistencia', usuario: usuario, fecha: fecha, qr: qr });
    }
    
  } catch(error) {
    res.send('Ocurrio un error -> ' + error);
  }
});

router.get('/list/:codIngreso', async (req, res) => {
  const usuario = req.session.usuario
  const token = req.session.token

  let _error, asistencia

  await axios.get(URL_BASE + '/asistencia/get/' + req.params.codIngreso, {
    headers: {
      'Authorization': token
    }
  }).then((result) => {
    asistencia = result.data
  }).catch((error) => {
    _error = 'Error en obtener resultado'
  })

  res.render('./asistencia/list', { title: 'Listado', usuario: usuario, error: _error, asistencia: asistencia});
});

router.get('/list', async (req, res) => {
  const usuario = req.session.usuario
  const token = req.session.token
  let _error, asistencia

  axios.get(URL_BASE + '/asistencia/get', {
    headers: {
      'Authorization': token
    }
  }).then((result) => {
    asistencia = result.data
  }).catch((error) => {
    _error = 'No se pudieron obtener las listas. ' + error.data
  })

  res.render('/asistencia/list', { title: 'Asistencia', usuario: usuario, asistencia: asistencia, error: _error });
});

router.get('/list/:codIngreso', async (req, ser) => {
  const usuario = req.session.usuario
  const token = req.session.token
  const codIngreso = req.params.codIngreso
  let _error, asistencia

  axios.get(URL_BASE + '/asistencia/get/' + codIngreso, {
    headers: {
      'Authorization': token
    }
  }).then((result) => {
    asistencia = result.data
  }).catch((error) => {
    _error = 'No se pudieron obtener las listas. ' + error.data
  })

  res.render('/asistencia/list', { title: 'Asistencia', usuario: usuario, asistencia: asistencia, error: _error });
});

module.exports = router;

function fixDate(lista) {
  let mes = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre")

  lista.forEach(element => {
    let fecha = new Date(Date.parse(element.fecha))
    element.fecha = `${fecha.getDate()} de ${mes[fecha.getMonth()]} de ${fecha.getFullYear()}`
  })

  return lista
}

function castToDate(fecha) {
  let aux = new Date(Date.parse(fecha))

  let mes = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre")
  let dia = new Array("Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado");

  return `${dia[aux.getDay()]} ${aux.getDate()} de ${mes[aux.getMonth()]} de ${aux.getFullYear()}`
}

function getActualTime(time) {
  let hours = time.getHours()
  let minutes = time.getMinutes()
  let momento = "AM"
  
  if (hours > 12) momento = "PM"
  if (hours > 11) hours -= 12
  if (minutes < 10) minutes = "0" + minutes

  return hours + ":" + minutes + " " + momento
}
