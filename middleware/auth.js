isAutenticated = function(req, res, next) {
    if(req.session.usuario && req.session.rol == "Admin") {
        next();
    } else {
        res.redirect("/usuario/login");
    }
}

module.exports = isAutenticated;
