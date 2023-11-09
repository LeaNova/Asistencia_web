var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
  const usuario = req.session.usuario

  res.render('index', { title: 'Inicio', usuario: usuario });
});

module.exports = router;
