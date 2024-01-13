const model = require('../models/index');
const Customer = model.Customer;
const {Op} = require("sequelize")

module.exports = {
    checkEmailUpdate: async(emailUser, emailUpdate)=>{
        let filter = {
            where: {
                [Op.and]: [
                    {
                        email: emailUpdate
                    },
                    {
                        email: {
                            [Op.not]: emailUser
                        }
                    }
                ]
            }
        }
        if(!await Customer.findOne(filter)){
            return true;
        }
        return false
    },
}