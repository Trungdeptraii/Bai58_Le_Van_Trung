const handleMessage = function(errors){
    if(errors?.length){
        return errors[0]
    }
}
const handleDataOld = function(data){
    if(data?.length){
        return data[0]
    }
}
const handleError = (req, res, next)=>{
    const errors = req.flash("errors");
    const dataOld = req.flash("dataOld");
    req.errors = handleMessage(errors);
    req.dataOld = handleDataOld(dataOld);
    next();
}
module.exports = handleError