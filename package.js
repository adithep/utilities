Package.describe({
  summary: "provides utilities",
  version: "0.0.1",
  name: "bads:utilities"
});

Package.on_use(function (api, where) {
  api.versionsFrom("METEOR-CORE@0.9.0-atm");
  api.use([
    'bads:core-lib',
    'blaze',
    'jquery',
    'deps',
    'underscore',
    'observe-sequence',
    'coffeescript'
  ]);
  api.add_files([
    'util.coffee',
    'bla.js',
    'phoneformat.js',
    'phoneformat_u.coffee',
    'fuzzy-search.js'], ['client', 'server']);
});

Package.on_test(function (api) {
  api.use("bads:utilities");

  api.add_files('utilities_tests.js', ['client', 'server']);
});
