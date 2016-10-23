const url = Npm.require('url');

Alipay = class {
    constructor(config) {
        if (!(config['partner'] && config['key'])) {
            return false;
        }
        this.config = _.extend({}, {
            partner: '' //合作身份者id，以2088开头的16位纯数字
            , key: ''//安全检验码，以数字和字母组成的32位字符
            , seller_id: '' //卖家支付宝用户号
            , host: 'http://localhost:3000/' //域名
            , cacert: 'cacert.pem'//ca证书路径地址，用于curl中ssl校验 请保证cacert.pem文件在当前文件夹目录中
            , transport: 'http' //访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
            , input_charset: 'UTF-8'//字符编码格式 目前支持 gbk 或 utf-8
            , sign_type: 'MD5'//签名方式 不需修改
            , create_direct_pay_by_user_return_url: '/alipay/create_direct_pay_by_user/return_url'
            , create_direct_pay_by_user_notify_url: '/alipay/create_direct_pay_by_user/notify_url'
            , refund_fastpay_by_platform_pwd_notify_url: '/alipay/refund_fastpay_by_platform_pwd/notify_url'
        }, config);

        this.route();
    }

    createDirectPayByUserUrl(data) {
        if (!(data['out_trade_no'] && data['subject'] && data['total_fee'])) {
            return false;
        }
        const params = _.extend({
            service: 'create_direct_pay_by_user',
            partner: this.config['partner'],
            seller_id: this.config['seller_id'] || this.config['partner'],
            _input_charset: this.config['input_charset'],
            sign_type: this.config['sign_type'],
            payment_type: 1,
            notify_url: url.resolve(this.config.host, this.config.create_direct_pay_by_user_notify_url),//服务器异步通知页面路径,必填，不能修改, 需http://格式的完整路径，不能加?id=123这类自定义参数
            return_url: url.resolve(this.config.host, this.config.create_direct_pay_by_user_return_url)//页面跳转同步通知页面路径 需http://格式的完整路径，不能加?id=123这类自定义参数，不能写成http://localhost/
        }, data);
        return Utils.build(params, this.config['key']);
    }

    refundFastpayByPlatformPwd(data) {
        if (!(data['refund_date'] && data['batch_no'] && data['batch_num'] && data['detail_data'])) {
            return false;
        }
        const params = _.extend({
            service: 'refund_fastpay_by_platform_pwd',
            partner: this.config['partner'],
            seller_id: this.config['seller_id'] || this.config['partner'],
            _input_charset: this.config['input_charset'],
            sign_type: this.config['sign_type'],
            notify_url: url.resolve(this.config.host, this.config.refund_fastpay_by_platform_pwd_notify_url)
        }, data);
        return Utils.build(params, this.config['key']);
    }

    route() {
        WebApp.connectHandlers.use(this.config.create_direct_pay_by_user_return_url, this.createDirectPayByUserReturn.bind(this));
        WebApp.connectHandlers.use(this.config.create_direct_pay_by_user_notify_url, this.createDirectPayByUserNotify.bind(this));
        WebApp.connectHandlers.use(this.config.refund_fastpay_by_platform_pwd_notify_url, this.refundFastpayByPlatformPwdNotify.bind(this));
    }

    createDirectPayByUserReturn(req, res, next) {
        if (req.method === 'GET') {
            this.directPayVerify(req.query, res);
        } else {
            res.end('fail');
        }
    }

    createDirectPayByUserNotify(req, res, next) {
        if (req.method === 'POST') {
            this.directPayVerify(req.body, res);
        } else {
            res.end('fail');
        }
    }

    directPayVerify(data, res) {
        const self = this;
        AlipayNotify.verify(data, this.config, function (verifyResult) {
            if (verifyResult) {//验证成功
                // 商户订单号 out_trade_no , 支付宝交易号  trade_no
                const trade_status = data['trade_status']; //交易状态
                if (trade_status === 'TRADE_FINISHED') {
                    self.emit('create_direct_pay_by_user_trade_finished', data['out_trade_no'], data['trade_no'], data);
                } else if (trade_status === 'TRADE_SUCCESS') {
                    self.emit('create_direct_pay_by_user_trade_success', data['out_trade_no'], data['trade_no'], data);
                }
                res.end('success');
            } else {
                //验证失败
                self.emit('verify_fail');
                res.end('fail');
            }
        })
    }

    refundFastpayByPlatformPwdNotify(req, res, next) {
        if (req.method === 'POST') {
            const self = this;
            const data = req.body;
            AlipayNotify.verify(data, this.config, function (verifyResult) {
                if (verifyResult) {//验证成功
                    // 批次号 batch_no , 批量退款数据中转账成功的笔数  success_num, 批量退款数据中的详细信息 result_details
                    self.emit('refund_fastpay_by_platform_pwd_success'
                        , data['batch_no'], data['success_num'], data['result_details']);
                    res.end('success');
                } else {
                    //验证失败
                    self.emit('verify_fail');
                    res.end('fail');
                }
            })
        } else {
            res.end('fail');
        }
    }

}