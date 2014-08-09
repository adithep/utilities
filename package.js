Package.describe({
  summary: "provides utilities",
  version: "0.0.1"
});

Package.on_use(function (api, where) {
  api.versionsFrom("METEOR-CORE@0.9.0-atm");
  api.use([
    'bads:core-lib',
    'coffeescript'
  ]);
  api.add_files(['phoneformat.js', 'emailformat.coffee', 'fuzzy-search.js'], ['client', 'server']);
});

Package.on_test(function (api) {
  api.use("../packages/bads:utilities");

  api.add_files('utilities_tests.js', ['client', 'server']);
});
