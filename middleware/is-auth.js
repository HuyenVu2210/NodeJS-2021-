module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        req.session.returnTo = req.originalUrl; 
        return res.redirect('/login')
    }
    next();
}