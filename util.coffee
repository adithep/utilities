# coffeelint: disable=max_line_length
Mu.email_regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
# coffeelint: enable=max_line_length
Mu.email_format = (email) ->

  return Mu.email_regex.test(email)


Mu.remove_first_last_slash = (str) ->
  return str.replace(/^\/|\/$/g, '')

Mu.remove_first_slash = (str) ->
  return str.replace(/^\//g, '')

Mu.remove_last_slash = (str) ->
  return str.replace(/\/$/g, '')

Mu.del_white_spa = (str) ->
  return str.replace(/(^\s+|\s+$)/g, '')

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

Mu.parse_json_logic_or = (json, obj) ->
  legit = false
  if json and obj
    n = 0
    while n < json.length
      if typeof json[n] is "string"
        if obj[json[n]]?
          legit = true
      else if Array.isArray(json[n])
        legit = Mu.parse_json_logic_and(json[n], obj)
      else
        if json[n].or
          legit = Mu.parse_json_logic_or(json[n].or, obj)
        else if json[n].and
          legit = Mu.parse_json_logic_and(json[n].and, obj)
      if legit is true
        break
      n++
  return legit

Mu.parse_json_logic_and = (json, obj) ->
  legit = false
  if json and obj
    legit = true
    n = 0
    while n < json.length
      if typeof json[n] is "string"
        unless obj[json[n]]?
          legit = false
      else if Array.isArray(json[n])
        legit = Mu.parse_json_logic_and(json[n], obj)
      else
        if json[n].or
          legit = Mu.parse_json_logic_or(json[n].or, obj)
        else if json[n].and
          legit = Mu.parse_json_logic_and(json[n].and, obj)
      if legit is false
        break
      n++

  return legit

Mu.parse_json_logic = (json, obj) ->
  legit = false
  if json and obj
    legit = true
    if Array.isArray(json)
      legit = Mu.parse_json_logic_and(json, obj)
    else
      if json.or
        legit = Mu.parse_json_logic_or(json.or, obj)
      else if json.and
        legit = Mu.parse_json_logic_and(json.and, obj)
  return legit
