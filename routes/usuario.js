var express = require('express');
var router = express.Router();
var axios = require('axios')

const URL_BASE = require('../config')

router.get('/login', async (req, res) => {
  const usuario = req.session.usuario

  res.render('./usuario/login', { title: 'Login', usuario: usuario });
});

router.post('/login', async (req, res) => {
  const usuario = req.session.usuario
  const body = req.body
  let _result, _error, _usuario

  // Hace la peticion a la API para obtener el token con los datos que se
  // envian por el Body
  let token = await axios.post(URL_BASE + '/usuario/login', body, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).catch((error) => {
    // Si la api no esta funcionando
    if(error.code == 'ECONNREFUSED') _error = 'Sin conexion al servidor'

    // Si el usuario o contraseña son incorrectas
    if(error.code == 'ERR_BAD_REQUEST') _result = 'Usuario o contraseña incorrecta'
  })

  // Si la API devolvio el token correctamente se buscara el perfil del
  // admin para usar la pagina, si no devolvio el token se por un error
  // en el mail o pass
  if(token) {
    req.session.token = 'Bearer ' + token.data

    await axios.get(URL_BASE + '/usuario/get', {
      headers: {
        'Authorization': req.session.token
      }
    }).then((result) => {
      _usuario = result.data
      req.session.usuario = _usuario
      req.session.rol = _usuario.rol
    }).catch((error) => {
      _error = 'ocurrio un error -> ' + error
    })

    res.redirect('/');
  } else {
    res.render('./usuario/login', { title: 'Login', usuario: usuario, body: body, result: _result, error: _error });
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
