var express = require('express');
var router = express.Router();
var axios = require('axios')

const URL_BASE = require('../config')

router.get('/new', async (req, res) => {
  try {
    const usuario = req.session.usuario
    const token = req.session.token

    const generos = await axios.get(URL_BASE + '/genero/get', { headers: { 'Authorization': token } })
    const estCiviles = await axios.get(URL_BASE + '/estCivil/get', { headers: { 'Authorization': token } })
    const roles = await axios.get(URL_BASE + '/rol/get', { headers: { 'Authorization': token } })

    res.render('./empleado/new', { title: 'Login', usuario: usuario, generos: generos.data, estCiviles: estCiviles.data, roles: roles.data });
  } catch(error) {
    console.error(error)
    res.send('ocurrio un error -> ' + error.code)
  }
});

router.get('/info/:id', async (req, res) => {
  const usuario = req.session.usuario
  const token = req.session.token
  let _result, _error

  await axios.get(URL_BASE + '/usuario/get/' + req.params.id, {
    headers: {
      'Authorization': token
    }
  }).then((result) => {
    _result = result.data
  }).catch(() => {
    _error = 'Usuario no encontrado'
  })
  
  if(_error) {
    res.render('./empleado/details', { title: 'Información', usuario: usuario, error: _error });
  } else {
    _result = fixFechas(_result)

    res.render('./empleado/details', { title: 'Información', usuario: usuario, result: _result });
  }
});

router.post('/new', async (req, res) => {
  const usuario = req.session.usuario
  const token = req.session.token
  const body = req.body
  let _success, _error, _warning

  const generos = await axios.get(URL_BASE + '/genero/get', { headers: { 'Authorization': token } })
  const estCiviles = await axios.get(URL_BASE + '/estCivil/get', { headers: { 'Authorization': token } })
  const roles = await axios.get(URL_BASE + '/rol/get', { headers: { 'Authorization': token } })

  if(allGood(body)) {
    await axios.post(URL_BASE + '/usuario/signin', body, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(() => {
      _success = 'Usuario ' + body.nombre + ' creado correctamente.'
    }).catch((error) => {
      console.log(error.code)
      _error = 'Error al cargar empleado.'
    })

    if(_error) {
      res.render('./empleado/new', { title: 'Login', usuario: usuario, body: body, error: _error, generos: generos.data, estCiviles: estCiviles.data, roles: roles.data });
    } else {
      res.render('./empleado/new', { title: 'Login', usuario: usuario, success: _success, generos: generos.data, estCiviles: estCiviles.data, roles: roles.data });
    }
  } else {
    _warning = 'Todos los campos deben estar correctamente llenos.'
    let notify = notifyError(body)

    res.render('./empleado/new', { title: 'Login', usuario: usuario, body: body, notify: notify, warning: _warning, error: _error, generos: generos.data, estCiviles: estCiviles.data, roles: roles.data });
  }
});

router.get('/list/all', async (req, res) => {
  const usuario = req.session.usuario
  const token = req.session.token
  let _error

  const lista = await axios.get(URL_BASE + '/usuario/list/all', {
    headers: {
      'Authorization': token
    }
  }).catch(() => {
    _error = 'Error en obtener datos'
  })

  if(lista) {
    res.render('./empleado/list', { title: 'Empleados', usuario: usuario, search:'Lista de empleados', empleados: lista.data });
  } else {
    res.render('./empleado/list', { title: 'Empleados', usuario: usuario, error: _error });
  }
});

router.get('/list/disponibles', async (req, res) => {
  const usuario = req.session.usuario
  const token = req.session.token
  let _error

  const lista = await axios.get(URL_BASE + '/usuario/list/disponibles', {
    headers: {
      'Authorization': token
    }
  }).catch(() => {
    _error = 'Error en obtener datos'
  })

  if(lista) {
    res.render('./empleado/list', { title: 'Empleados', usuario: usuario, search: 'Lista de empleados disponibles', empleados: lista.data });
  } else {
    res.render('./empleado/list', { title: 'Empleados', usuario: usuario, error: _error });
  }
});

router.get('/list/nodisponibles', async (req, res) => {
  const usuario = req.session.usuario
  const token = req.session.token
  let _error

  const lista = await axios.get(URL_BASE + '/usuario/list/nodisponibles', {
    headers: {
      'Authorization': token
    }
  }).catch(() => {
    _error = 'Error en obtener datos'
  })

  if(lista) {
    res.render('./empleado/list', { title: 'Empleados', usuario: usuario, search: 'Lista de empleados no disponibles', empleados: lista.data });
  } else {
    res.render('./empleado/list', { title: 'Empleados', usuario: usuario, error: _error });
  }
});

router.get('/edit/disponible/:id', async (req, res) => {
  const usuario = req.session.usuario
  const token = req.session.token
  let _result, _success, _error

  await axios.get(URL_BASE + '/usuario/get/' + req.params.id, {
    headers: {
      'Authorization': token
    }
  }).then((result) => {
    _result = result.data
  }).catch(() => {
    _error = 'Error en obtener empleado'
  })

  if(_result) {
    await axios.patch(URL_BASE + '/usuario/edit/disponible/' + _result.idUsuario, {}, {
      headers: {
        'Authorization': token
      }
    }).then(() => {
      _success = 'Usuario actualizado'
      _result.isDisponible = !_result.isDisponible
    }).catch(() => {
      _error = 'Error en actualizar empleado'
    })
  }

  if(_error) {
    res.render('./empleado/details', { title: 'Información', usuario: usuario, error: _error });
  } else {
    res.render('./empleado/details', { title: 'Información', usuario: usuario, success: _success, result: _result });
  }
});

module.exports = router;

function allGood(body) {
  if(body.nombre == '' | containsNum(body.nombre)) return false
  if(body.apellido == '' | containsNum(body.apellido)) return false
  if(body.dni == '' | containsChar(body.dni)) return false
  if(body.fechaNac == '') return false
  if(body.direccion == '') return false
  if(body.telefono == '' | containsChar(body.telefono)) return false
  if(body.mail == '' | !body.mail.includes('@')) return false
  return true
}

function notifyError(body) {
  let notify = {
    nombre: containsNum(body.nombre),
    apellido: containsNum(body.apellido),
    dni: containsChar(body.dni),
    telefono: containsChar(body.telefono),
    mail: !body.mail.includes('@')
  }
  
  return notify
}

function containsNum(str) {
  return /[0-9]/.test(str)
}

function containsChar(str) {
  return /[a-zA-z]/.test(str)
}

function fixFechas(item) {
  item.fechaNac = item.fechaNac.replace("T00:00:00", "").replace("/","-")
  item.fechaIngreso = item.fechaIngreso.replace("T00:00:00", "").replace("/","-")
  
  return item
}
