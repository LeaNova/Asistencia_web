var express = require('express');
var router = express.Router();
var axios = require('axios')

var auth = require('../middleware/auth')

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

router.get('/logout', async (req, res) => {
  req.session.destroy();
  res.redirect('/')
});

router.get('/configuracion', auth, (req, res) => {
  const usuario = req.session.usuario

  res.render('./usuario/configuracion', { title: 'Configuración', usuario: usuario });
});


router.post('/configuracion', auth, async (req, res) => {
  const usuario = req.session.usuario
  const token = req.session.token
  const body = req.body
  let _success, _error

  await axios.patch(URL_BASE + '/usuario/edit/pass', body, {
    headers: {
      'Authorization': token,
      'Content-Type': 'multipart/form-data'
    }
  }).then(() => {
    _success = 'Contraseña actualizada'
  }).catch(() => {
    _error = 'Error en actualizar la contraseña'
  })

  res.render('./usuario/configuracion', { title: 'Configuración', usuario: usuario, success: _success, error: _error });
});

module.exports = router;
