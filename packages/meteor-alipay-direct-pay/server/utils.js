const crypto = Npm.require('crypto');

Utils = Utils || {};
const alipayGateway = 'https://mapi.alipay.com/gateway.do?';

Utils.build = function (params, key) {
    const signType = params['sign_type'].trim().toUpperCase();
    if (signType === 'MD5') {
        return md5Build(params, key);
    } else if (signType === 'RSA') {
        //return rsa(params, key);
        return false;
    }
}

Utils.verify = function (params, key) {
    const signType = params['sign_type'].trim().toUpperCase();
    if (signType === 'MD5') {
        return md5Verify(params, key);
    } else if (signType === 'RSA') {
        //return rsaVerify(params, key);
        return false;
    }
}

function createLinkstring(para) {
    //return qs.stringify(para);
    let ls = '';
    for (let k in para) {
        ls = ls + k + '=' + para[k] + '&';
    }
    ls = ls.substring(0, ls.length - 1);
    return ls;
}

function buildPrestr(params) {
    let keys = _.keys(params);
    keys = keys.sort();
    const newParams = {};
    keys.forEach((val) => {
        if (!(val === 'sign' || val === 'sign_type' || params[val] === '')) {
            newParams[val] = params[val];
        }
    })
    const prestr = createLinkstring(newParams);
    return prestr;

}

function md5Build(params, key) {
    const prestr = buildPrestr(params);
    const sign = crypto.createHash('md5').update(prestr + key, 'utf8').digest("hex");
    const url = alipayGateway + prestr + '&' + createLinkstring({sign: sign, sign_type: 'MD5'});
    return url;
}

function md5Verify(params, key) {
    const prestr = buildPrestr(params);
    const sign = crypto.createHash('md5').update(prestr + key, 'utf8').digest("hex");
    return sign === params['sign'];
}