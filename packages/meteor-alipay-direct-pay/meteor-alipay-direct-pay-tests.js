const alipay = new Alipay({
    partner:'2088202591916558',
    key:'8s75ttskjn5oam3hufwfob8bslb59997'
});

Tinytest.add('Alipay', function (test) {
    test.isTrue(alipay);
})

Tinytest.add('Alipay config partner', function (test) {
    test.equal(alipay.config.partner, '2088202591916558');
})

Tinytest.add('Alipay.createDirectPayByUserUrl', function (test) {
    const url = alipay.createDirectPayByUserUrl({
        out_trade_no: '1234567890',
        subject: 'test付款',
        total_fee: 0.01
    });
    console.log(url)
    test.equal(url, 'https://mapi.alipay.com/gateway.do?_input_charset=UTF-8&notify_url=http://localhost:3000/alipay/create_direct_pay_by_user/notify_url&out_trade_no=1234567890&partner=2088202591916558&payment_type=1&return_url=http://localhost:3000/alipay/create_direct_pay_by_user/return_url&seller_id=2088202591916558&service=create_direct_pay_by_user&subject=test付款&total_fee=0.01&sign=82979d3cc02387e2efea60ea7d2f5e2a&sign_type=MD5');
})

Tinytest.add('Alipay directPayVerify', function (test) {
    const res = {
        end: function(data) {
            console.log(data)
        }
    }
    alipay.directPayVerify({
        is_success: 'T',
        sign_type: 'MD5',
        sign: '53ceb6837e15a1f3c9cc13071ef44ccc'
    }, res);
})

Tinytest.add('Alipay.refundFastpayByPlatformPwd', function (test) {
    const url = alipay.refundFastpayByPlatformPwd({
        refund_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        batch_no: new Date().getTime(),
        batch_num: 1,
        detail_data: '2016101221001004550239986055^0.01^协商退款'
    });
    console.log(url)
    test.isTrue(url);
})