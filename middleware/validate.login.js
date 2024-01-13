
let jwt = require('jsonwebtoken');
let Service = require('../services/user.service.js');

module.exports = async function (req, res, next){
    const cookie = req.headers.cookie
    let arrCookie = cookie?.split('; ');
    let name =  arrCookie?.find(el=>el.startsWith('name='));
    let tokenCookie =  arrCookie?.find(el=>el.startsWith('token='));
    if(tokenCookie){
        console.log('456');
        let token = tokenCookie?.slice(tokenCookie?.indexOf("=")+1);
        let {user, exp} = await jwt.verify(token, 'f8');
        let timeCurrent = Math.ceil(Date.now()/1000);
        if(exp - timeCurrent < 0){
            res.redirect("dang-nhap");
            return;
        }
        if(req.path == '/dang-nhap'){
            console.log('789');
            res.redirect('/');
            return next()
        }
        req.user = user;
        req.flash("name", name.slice(name.indexOf("=")+1));
        await Service.reqLastUser(user);
        
    }else{
        if(req.path == '/dang-nhap'){
            return next()
        }
        res.redirect("dang-nhap");
        return;
    }
    next()
}