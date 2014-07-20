Package.describe({
  summary: "provides utilities"
});

Package.on_use(function (api, where) {
  api.use(['core-lib', 'coffeescript']);
  api.add_files(['phoneformat.js', 'emailformat.coffee', 'fuzzy-search.js'], ['client', 'server']);
});

Package.on_test(function (api) {
  api.use('utilities');

  api.add_files('utilities_tests.js', ['client', 'server']);
});
