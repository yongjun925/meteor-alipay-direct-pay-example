import Alipay from 'alipay-node-sdk';

const alipay_gate_way = 'https://openapi.alipay.com/gateway.do';
const alipay_gate_way_sandbox = 'https://openapi.alipaydev.com/gateway.do';

let alipay;

function getAlipay(config) {
    if (!alipay) {
        alipay = new Alipay(config);
    }
}

WebApp.connectHandlers.use('/alipay-node-sdk/submit', function (req, res, next) {
    if (req.method === 'GET') {
        const query = req.query;
        if (!(query.appId && query.total_amount)) {
            res.end('parameter error.');
        } else {
            console.log('req.query ', req.query)
            let config = {
                appId: query.appId,
                notifyUrl: 'http://localhost:3000/callback/alipay',
                rsaPrivate: Assets.absoluteFilePath('private/pem/ali_private_sandbox.pem'),
                rsaPublic: Assets.absoluteFilePath('private/pem/ali_public_sandbox.pem'),
                sandbox: true,
                signType: 'RSA'
            }
            if (query.sandbox == '2') {
                config.sandbox = false;
                config.rsaPrivate = Assets.absoluteFilePath('private/pem/ali_private.pem');
                config.rsaPublic = Assets.absoluteFilePath('private/pem/ali_public.pem');
            }
            getAlipay(config);
            let params = alipay.pagePay({
                subject: query.subject || '商品',
                body: query.body || '商品描述',
                outTradeId: query.out_trade_no || Date.now().toString(),
                timeout: '10m',
                amount: query.total_amount,
                goodsType: '0',
                qrPayMode: 0
            });
            console.log('params ', params);
            let url = alipay_gate_way_sandbox;
            if (query.sandbox == '2') {
                url = alipay_gate_way;
            }
            url += '?' + params;
            res.end(getHtml(url, 'Entry payment'));
        }
    } else {
        res.end('error.');
    }
});

WebApp.connectHandlers.use('/callback/alipay', function (req, res, next) {
    let data = {};
    if (req.method === 'POST') {
        data = req.body;
    } else if (req.method === 'GET') {
        data = req.query;
    }
    let ok = alipay.signVerify(data);
    if (ok) {
        // 业务处理
        return res.end('success');
    }
    res.end('error.');
})

function getHtml(url, title) {
    return `<div>${title}</div>
    <script>window.location.href = '${url}';</script>
    `
}