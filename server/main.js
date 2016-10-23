import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
});

WebApp.connectHandlers.use('/alipay/submit', function(req, res, next) {
    if (req.method === 'GET') {
        const query = req.query;
        if(!(query.partner && query.key && query.out_trade_no && query.subject && query.total_fee)){
            res.end('parameter error.');
        } else {
            console.log(req.query)
            const alipay = new Alipay({
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
