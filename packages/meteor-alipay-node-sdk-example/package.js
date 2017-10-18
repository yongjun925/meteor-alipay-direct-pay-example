Package.describe({
  name: 'yongjun:meteor-alipay-node-sdk-example',
  version: '1.0.0',
  // Brief, one-line summary of the package.
  summary: 'alipay node sdk example',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/yongjun925/meteor-alipay-node-sdk-example',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  "alipay-node-sdk": "1.1.7"
});

Package.onUse(function(api) {
  //api.versionsFrom('1.4.1.2');
  api.versionsFrom('1.1.0.2');
  api.use('ecmascript@0.5.8_1');
  api.use(['underscore','webapp']);
  api.addAssets([
    'private/pem/ali_private.pem',
    'private/pem/ali_public.pem',
    'private/pem/ali_private_sandbox.pem',
    'private/pem/ali_public_sandbox.pem'
  ], 'server');

  api.mainModule('meteor-alipay-node-sdk-example.js', 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('yongjun:alipay-example');
  api.use(['momentjs:moment']);
  api.mainModule('meteor-alipay-node-sdk-example-tests.js');
});
