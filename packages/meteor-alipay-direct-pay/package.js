Package.describe({
  name: 'yongjun:meteor-alipay-direct-pay',
  version: '1.0.2',
  // Brief, one-line summary of the package.
  summary: 'alipay direct pay,alipay web api',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/yongjun925/meteor-alipay-direct-pay-example',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  "request": "2.58.0"
});

Package.onUse(function(api) {
  //api.versionsFrom('1.4.1.2');
  api.versionsFrom('1.1.0.2');
  api.use('ecmascript@0.5.8_1');
  api.use(['underscore','webapp']);
  api.addFiles([
    'server/utils.js',
    'server/alipay_notify.js',
    'server/alipay.js'
  ], 'server');

  api.addAssets([
    'private/cacert.pem'
  ], 'server');
  api.export(['Alipay'],'server');

  //api.mainModule('meteor-alipay-direct-pay.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('yongjun:meteor-alipay-direct-pay');
  api.use(['momentjs:moment']);
  api.mainModule('meteor-alipay-direct-pay-tests.js');
});
