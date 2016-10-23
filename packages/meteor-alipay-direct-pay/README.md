meteor alipay
=========================

即时到账交易接口(create_direct_pay_by_user)
即时到账批量退款有密接口(refund_fastpay_by_platform_pwd)

## Installation

In your Meteor app directory, enter:

```
$ meteor add meteor-alipay-direct-pay
```

## How to use?

```
const alipay = new Alipay({
    partner:'2088...',
    key:''
});
const url = alipay.createDirectPayByUserUrl({
    out_trade_no: '1234567890',
    subject: 'test付款',
    total_fee: 0.01
});
```

Options:
    https://doc.open.alipay.com/docs/doc.htm?spm=a219a.7629140.0.0.IX0A62&treeId=62&articleId=104743&docType=1