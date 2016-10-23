Package.describe({
  name: 'meteor-alipay-direct-pay',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'alipay direct pay,alipay web api',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  "request": "2.58.0"
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['ecmascript','underscore','webapp']);
  api.addFiles([
    'server/utils.js',
    'server/alipay_notify.js',
    'server/alipay.js'
  ], 'server');

  api.addAssets([
    'private/cacert.pem'
  ], 'server');

  api.export(['Alipay'],'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use(['momentjs:moment']);
  api.use('meteor-alipay-direct-pay');
  api.mainModule('meteor-alipay-direct-pay-tests.js');
});
