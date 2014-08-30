Mu.sanatize_obj = (obj) ->
  nobj = {}
  for key of obj
    if key_obj[key] and Mu.sanatize_key[key_obj[key].key_ty]
      val = Mu.sanatize_key[key_obj[key].key_ty](obj[key])
      if val?
        nobj[key] = val
  return nobj
