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
      _error = 'Error al cargar empleado.'
    })

    if(_error) {
      res.render('./empleado/new', { title: 'Login', usuario: usuario, success: _success, generos: generos.data, estCiviles: estCiviles.data, roles: roles.data });
    } else {
      res.render('./empleado/new', { title: 'Login', usuario: usuario, body: body, error: _error, generos: generos.data, estCiviles: estCiviles.data, roles: roles.data });
    }
  } else {

    _warning = 'Todos los campos deben estar correctamente llenos.'
    res.render('./empleado/new', { title: 'Login', usuario: usuario, body: body, warning: _warning, error: _error, generos: generos.data, estCiviles: estCiviles.data, roles: roles.data });
  }
});

router.get('/list', async (req, res) => {
  const usuario = req.session.usuario
  const token = req.session.token
  let _success, _error, _warning

  const lista = await axios.get(URL_BASE + '/usuario/list', {
    headers: {
      'Authorization': token
    }
  }).catch((error) => {
    _error = error.code
  })

  if(lista) {
    res.render('./empleado/list', { title: 'Empleados', usuario: usuario, empleados: lista.data });
  } else {
    res.render('./empleado/list', { title: 'Empleados', usuario: usuario, error: _error });
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

function containsNum(str) {
  return /[0-9]/.test(str)
}

function containsChar(str) {
  return /[a-zA-z]/.test(str)
}