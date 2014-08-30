

Mu.email_format = (email) ->
  # coffeelint: disable=max_line_length
  e_t = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  return e_t.test(email)
  # coffeelint: enable=max_line_length

Mu.remove_first_last_slash = (str) ->
  return str.replace(/^\/|\/$/g, '')

Mu.remove_first_slash = (str) ->
  return str.replace(/^\//g, '')

Mu.remove_last_slash = (str) ->
  return str.replace(/\/$/g, '')

Mu.del_white_spa = (str) ->
  return str.replace(/^\s+/, '').replace(/\s+$/, '')

Mu.sanatize_key = {}

Mu.sanatize_key._st = (val) ->
  if val
    if typeof val is "string" and String(val) isnt ""
      return String(val)
  return

Mu.sanatize_key.email = (val) ->
  if val
    val = String(val)
    if Mu.email_format(val)
      return val
  return
