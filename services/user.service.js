const model = require('../models/index.js');
const Customer = model.Customer;
const Device = model.Device;
const { Op } = require("sequelize");
const bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let moment = require("moment");

const {checkEmailUpdate} = require('../utils/user.util.js');
const {getBrowserInfo} = require('../utils/brower.util.js');
const device = require('../models/device.js');

const Service = {
    checkLogin: async ({email, password}, type='login')=>{
        let filter = {
            where: {
                email: {
                    [Op.eq]: email
                }
            }
        };
        try {
            let user =  await Customer.findAll(filter);
            if(type == 'login'){
                if(!user.length){
                    return false;
                }
                const checkpass = await bcrypt.compare(password, user[0].password);
                return checkpass ? user[0] : false;
            }else if(type == 'register'){
                if(!user.length){
                    return true
                }else{
                    return false;
                }
            }
        } catch (error) {
            return false
        }
    },
    createUser: async ({email, password, name})=>{
        password = await bcrypt.hashSync(password, 10);
        if(!await Customer.create({email, password, name})){
            return false
        }
        return true
        
    },
    updateUser: async(req, res)=>{
        let {name, email, password, passwordNew, passwordNew2} = req.body;
        let msg
        if(!await checkEmailUpdate(req.user.email, email)){
            msg = {
                status: 'fail',
                message: {
                    email: 'Email đã tồn tại'
                }
            }
            return msg;
        }
        if(!password){
            await Customer.update({email, name},{
                where: {
                    id: req.user.id
                }
            })
            msg = {
                status: 'success',
                message: "Cập nhật thành công"
            }
            return msg
        }
        if(password){
            if(!await bcrypt.compare(password, req.user.password)){
                msg =  {
                    status: 'fail',
                    message: {
                        password: "Password chưa chính xác"
                    }
                }
                return msg
            }
            if(!passwordNew && passwordNew2){
                msg = {
                    status: 'fail',
                    message: {
                        passwordNew: 'Mật khẩu không được để trống'
                    }
                }
                return msg
            }
            if(!passwordNew && !passwordNew2){
                msg = {
                    status: 'fail',
                    message: {
                        passwordNew: 'Mật khẩu không được để trống',
                        passwordNew2: 'Mật khẩu không được để trống'
                    }
                }
                return msg
            }
            if(!passwordNew2 && passwordNew){
                msg = {
                    status: 'fail',
                    message: {
                        passwordNew2: 'Mật khẩu không được để trống'
                    }
                }
                return msg
            }
            if(passwordNew != passwordNew2){
                msg =  {
                    status: 'fail',
                    message: {
                        other: 'Mật khẩu chưa khớp nhau'
                    }
                }
                return msg
            }
            password = await bcrypt.hashSync(passwordNew, 10);
            await Customer.update({email, name, password},{
                where: {
                    id: req.user.id
                }
            })
            Service.clearDevice(req)
            let token = await jwt.sign({user: req.user},'f8',{expiresIn: '1h'});
            res.cookie('token', token)
            return{
                status: 'success',
                message: {
                    other: 'Cập nhật dữ liệu thành công'
                }
            }
        }
    },
    createDevice: async (req, user)=>{
        const brower = getBrowserInfo(req);
        const device = {
            name: brower.name, 
            version: brower.version,
            type: brower.device,
            user_id: +user.id
        }
        try {
            await Device.create(device)
        } catch (error) {
            console.log('log Device ', error);
        }
    },
    clearDevice:async (req)=>{
        await Device.destroy({
            where: {
                user_id: {
                    [Op.eq]: req.user.id  
                }
            }
        })
        // await Service.createDevice(req, req.user)
    },
    reqLastUser: async (user)=>{
        await Device.update({req_last: Date.now()}, {
            where: {
                user_id: {
                    [Op.eq]: user.id
                }
            }
        })
    }
}

module.exports = Service