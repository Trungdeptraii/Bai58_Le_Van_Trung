const model = require('../models/index.js');
const {object, string} = require("yup");
const Customer = model.Customer;
const {Op} = require("sequelize")
const bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');

const Service = require('../services/user.service.js');
let token = 'serect_123';

const Controller  = {
    index: async (req, res)=>{
        let [name] = req.flash("name");
        let update = req.flash('update');
        let data = req.flash('dataErrorUpdate');
        let filter = {
            where: {
                email : {
                    [Op.like]: `%${name}%`
                }
            }
        }
        let user = await Customer.findOne(filter)
        res.render("users/index", {user, edit: true, update: update.length ? update : [], data: data.length ? data : []});
    },
    edit:async (req, res)=>{
        let [name] = req.flash("name");
        let update = req.flash('update');
        let data = req.flash('dataErrorUpdate');
        let filter = {
            where: {
                email : {
                    [Op.like]: `%${name}%`
                }
            }
        }
        let user = await Customer.findOne(filter)
        res.render("users/index", {user, edit: false, update: update.length ? update : [], data: data.length ? data : []});
    },
    update: async (req, res)=>{
        let result = await Service.updateUser(req, res);
        req.flash("update", result);
        console.log(' update', result);
        if(result.status == 'fail'){
            req.flash("dataErrorUpdate", req.body);
            Controller.edit(req, res)
            return
        }
        res.redirect("/")
    },
    login: (req, res)=>{
        let msg = req.flash("msg");
        res.render("users/login", {req, msg: msg? msg: []});
    },
    register: async (req, res)=>{
        let msg = req.flash("msg")
        res.render("users/register", {req, msg: msg? msg: []})
    },
    handleRegister:async (req, res)=>{
        const schema = object({
            email: string().required("Vui lòng nhập email").email("Không đúng định dạng email"),
            password: string().required("Vui lòng nhập password")
        })
        try {
            const user = await schema.validate(req.body, {abortEarly: false});
            if(!await Service.checkLogin(user, 'register')){
                req.flash('msg', 'Email đã đăng ký tài khoản');
                req.flash("dataOld", req.body)
                return res.redirect('/dang-ky');
            }
            if(!await Service.createUser(user)){
                req.flash('msg', 'Đăng ký tài khoản thất bại');
                return res.redirect('/dang-ky');

            }
            req.flash("dataOld", {email: req.body.email})
            return res.redirect('/dang-nhap');
        } catch (e) {
            const errors = Object.fromEntries(
                e.inner.map((item)=>[
                    item.path, item.message
                ])
            );
            req.flash('errors', errors);
            req.flash('msg', 'Vui lòng điền đầy đủ thông tin');
            res.redirect('/dang-ky')
        }
    },
    handleLogin: async(req, res)=>{
        const {email, password} = req.body
        const schema = object({
            email: string().required("Vui lòng nhập email").email("Không đúng định dạng email"),
            password: string().required("Vui lòng nhập password")
        })
        try {
            await schema.validate({email, password}, {abortEarly: false});
            let user = await Service.checkLogin(req.body, 'login');
            if(!user){
                req.flash('msg', 'Email hoặc mật khẩu chưa chính xác');
                req.flash("dataOld", {email: req.body.email})
                return res.redirect('/dang-nhap');
            }
            if(!user.status){
                req.flash('msg', 'Đăng nhập bị từ chối !!!');
                req.flash("dataOld", req.body)
                return res.redirect('/dang-nhap');
            }
            await Service.createDevice(req, user)
            const name = email.slice(0, email.indexOf('@'));
            let token = await jwt.sign({user},'f8', {expiresIn: '1h'});
            res.cookie('token', token)
            res.cookie('name', name);
            res.redirect('/')
        } catch (e) {
            console.log(e);
            const errors = Object.fromEntries(
                e.inner.map((item)=>[
                    item.path, item.message
                ])
            );
            req.flash('errors', errors);
            req.flash("dataOld", req.body)
            req.flash('msg', 'Vui lòng điền đầy đủ thông tin');
            res.redirect('/dang-nhap')
        }
        
    },
    handleLogout: (req, res)=>{
        res.clearCookie('token');
        res.clearCookie('name');
        res.redirect("/")
    }
}
module.exports =  Controller