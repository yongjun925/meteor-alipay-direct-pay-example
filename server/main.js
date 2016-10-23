import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
});

let alipay;
function getAlipay() {
    if(!alipay) {
        alipay = new Alipay(
            {
                partner: '2088202591916558',
                key: '8s75ttskjn5oam3hufwfob8bslb59997',
                transport: 'https'
            }
        );
        alipay.route(function createDirectPayByUserReturn(req, res, next) {
            if (req.method === 'GET') {
                alipay.directPayVerify(req.query, function (result) {
                    if (result) {
                        res.end(`<div>Pay success page</div>
                        <script>window.location.href = 'http://localhost:3000/';</script>
                        `);
                    } else {
                        res.end('Pay fail page');
                    }
                });
            } else {
                res.end('Pay fail page');
            }
        });
        listen();
    }
}
getAlipay();

WebApp.connectHandlers.use('/alipay/submit', function(req, res, next) {
    if (req.method === 'GET') {
        const query = req.query;
        if(!(query.partner && query.key && query.out_trade_no && query.subject && query.total_fee)){
            res.end('parameter error.');
        } else {
            console.log(req.query)
            alipay.setConfig({
                partner: query.partner,
                key: query.key
            });
            const url = alipay.createDirectPayByUserUrl({
                out_trade_no: query.out_trade_no,
                subject: query.subject,
                total_fee: query.total_fee
            });
            console.log(url)
            //res.end(url)
            res.end(getHtml(url, 'Entry payment'));
        }
    } else {
        res.end('error.');
    }
});

function getHtml(url, title) {
    return `<div>${title}</div>
    <script>window.location.href = '${url}';</script>
    `
}

function listen() {
    function callback() {
        console.log(arguments)
    }
    alipay.on('create_direct_pay_by_user_trade_finished', callback);
    alipay.on('create_direct_pay_by_user_trade_success', callback);
    alipay.on('refund_fastpay_by_platform_pwd_success', callback);
}
