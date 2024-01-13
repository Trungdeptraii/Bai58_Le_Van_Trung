const UAParser = require('ua-parser-js');
function getBrowserInfo(req) {
    const userAgent = req.get('user-agent');
    const parser = new UAParser();
    const result = parser.setUA(userAgent).getBrowser();
    const device = req.device.type;
    return {...result, device};
}
module.exports = {
    getBrowserInfo
}
