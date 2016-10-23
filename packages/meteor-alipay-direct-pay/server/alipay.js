const url = Npm.require('url');
const EventEmitter = Npm.require('events').EventEmitter;

Alipay = class extends EventEmitter {
    constructor(config) {
        super();
        this.config = _.extend({}, {
            partner: '' //合作身份者id，以2088开头的16位纯数字
            , key: ''//安全检验码，以数字和字母组成的32位字符
            , seller_id: '' //卖家支付宝用户号
            , host: 'http://localhost:3000/' //域名
            , cacert: Assets.getText('private/cacert.pem')//ca证书路径地址，用于curl中ssl校验 请保证cacert.pem文件在当前文件夹目录中
            , transport: 'http' //访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
            , input_charset: 'UTF-8'//字符编码格式 目前支持 gbk 或 utf-8
            , sign_type: 'MD5'//签名方式 不需修改
            , create_direct_pay_by_user_return_url: '/alipay/create_direct_pay_by_user/return_url'
            , create_direct_pay_by_user_notify_url: '/alipay/create_direct_pay_by_user/notify_url'
            , refund_fastpay_by_platform_pwd_notify_url: '/alipay/refund_fastpay_by_platform_pwd/notify_url'
        }, config);
    }

    setConfig(config) {
        this.config = _.extend({}, this.config, config);
    }

    createDirectPayByUserUrl(data) {
        if (!(this.config['partner'] && this.config['key'])) {
            return false;
        }
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
        if (!(this.config['partner'] && this.config['key'])) {
            return false;
        }
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

    route(createDirectPayByUserReturn, createDirectPayByUserNotify, refundFastpayByPlatformPwdNotify) {
        if (this.config.create_direct_pay_by_user_return_url) {
            WebApp.connectHandlers.use(this.config.create_direct_pay_by_user_return_url,
                createDirectPayByUserReturn || this._createDirectPayByUserReturn.bind(this));
        }
        if (this.config.create_direct_pay_by_user_notify_url) {
            WebApp.connectHandlers.use(this.config.create_direct_pay_by_user_notify_url,
                createDirectPayByUserNotify || this._createDirectPayByUserNotify.bind(this));
        }
        if (this.config.refund_fastpay_by_platform_pwd_notify_url) {
            WebApp.connectHandlers.use(this.config.refund_fastpay_by_platform_pwd_notify_url,
                refundFastpayByPlatformPwdNotify || this._refundFastpayByPlatformPwdNotify.bind(this));
        }
    }

    _createDirectPayByUserReturn(req, res, next) {
        if (req.method === 'GET') {
            this.directPayVerify(req.query, function (result) {
                if (result) {
                    res.end('success');
                } else {
                    res.end('fail');
                }
            });
        } else {
            res.end('fail');
        }
    }

    _createDirectPayByUserNotify(req, res, next) {
        if (req.method === 'POST') {
            this.directPayVerify(req.body, function (result) {
                if (result) {
                    res.end('success');
                } else {
                    res.end('fail');
                }
            });
        } else {
            res.end('fail');
        }
    }

    directPayVerify(data, callback) {
        if (!(data['is_success'] && data['sign_type'] && data['sign'])) {
            callback(false);
            return false;
        }
        const self = this;
        AlipayNotify.verify(data, this.config, function (verifyResult) {
            if (verifyResult && data['is_success'] === 'T') {
                // 商户订单号 out_trade_no , 支付宝交易号  trade_no
                const trade_status = data['trade_status']; //交易状态
                if (trade_status === 'TRADE_FINISHED' || trade_status === 'TRADE_SUCCESS') {
                    callback(true);
                } else {
                    callback(false);
                }
                if (trade_status === 'TRADE_FINISHED') {
                    self.emit('create_direct_pay_by_user_trade_finished', data['out_trade_no'], data['trade_no'], data);
                } else if (trade_status === 'TRADE_SUCCESS') {
                    self.emit('create_direct_pay_by_user_trade_success', data['out_trade_no'], data['trade_no'], data);
                }
            } else {
                //验证失败
                callback(false);
            }
        })
    }

    _refundFastpayByPlatformPwdNotify(req, res, next) {
        if (req.method === 'POST') {
            this.refundFastpayVerify(req.body, function (result) {
                if (result) {
                    res.end('success');
                } else {
                    res.end('fail');
                }
            });
        } else {
            res.end('fail');
        }
    }

    refundFastpayVerify(data, callback) {
        if (!(data['batch_no'] && data['success_num'])) {
            callback(false);
            return false;
        }
        const self = this;
        AlipayNotify.verify(data, this.config, function (verifyResult) {
            if (verifyResult) {//验证成功
                // 批次号 batch_no , 批量退款数据中转账成功的笔数  success_num, 批量退款数据中的详细信息 result_details
                self.emit('refund_fastpay_by_platform_pwd_success'
                    , data['batch_no'], data['success_num'], data['result_details'], data);
                callback(true);
            } else {
                //验证失败
                callback(false);
            }
        })
    }

}