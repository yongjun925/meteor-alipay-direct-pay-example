const request = Npm.require('request');
AlipayNotify = AlipayNotify || {};

const httpsVerifyUrl = 'https://mapi.alipay.com/gateway.do?service=notify_verify&';
const httpVerifyUrl = 'http://notify.alipay.com/trade/notify_query.do?';

AlipayNotify.verify = function (data, config, callback) {
    if (_.isEmpty(data)) {
        callback(false);
    } else {
        const isSign = Utils.verify(data, config['key']); // 如果签名验证通过
        if (isSign && data['notify_id']) {
            getResponse(data['notify_id'], config, function (responseTxt) {
                callback(responseTxt == 'true');
            })
        } else {
            callback(false);
        }
    }
}

function getResponse(notifyId, config, callback) {
    const transport = config['transport'].trim().toLowerCase();
    const partner = config['partner'].trim();
    let veryfyUrl = transport === 'https' ? httpsVerifyUrl : httpVerifyUrl;
    veryfyUrl += `partner=${partner}&notify_id=${notifyId}`;
    const options = {
        url: veryfyUrl
    }
    if (transport === 'https' && config['cacert']) {
        options.cert = config['cacert'];
    }
    request(options, function (error, response, body) {
        callback(body);
    });
}