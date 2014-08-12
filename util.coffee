

Mu.email_format = (email) ->
  # coffeelint: disable=max_line_length
  return email.test(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)
  # coffeelint: enable=max_line_length

Mu.remove_first_last_slash = (str) ->
  return str.replace(/^\/|\/$/g, '')

Mu.remove_first_slash = (str) ->
  return str.replace(/^\//g, '')

Mu.remove_last_slash = (str) ->
  return str.replace(/\/$/g, '')
