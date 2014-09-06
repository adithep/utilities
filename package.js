Package.describe({
  summary: "provides utilities",
  version: "0.0.1",
  name: "bads:utilities"
});

Package.on_use(function (api, where) {
  api.versionsFrom('METEOR@0.9.2-rc1');
  api.use([
    'bads:core-lib',
    'blaze',
    'jquery',
    'deps',
    'underscore',
    'observe-sequence',
    'reactive-var',
    'coffeescript'
  ]);
  api.add_files([
    'util.coffee',
    'phoneformat.js',
    'phoneformat_u.coffee',
    'fuzzy-search.js'
  ], ['client', 'server']);

  api.add_files([
    'bla.js'
  ], 'client');

  api.add_files([
    'muserve.coffee'
  ], 'server');

});

Package.on_test(function (api) {
  api.use("bads:utilities");

  api.add_files('utilities_tests.js', ['client', 'server']);
});
