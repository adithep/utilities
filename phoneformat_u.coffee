phone_format.format_number = (number, country) ->
  if number
    if country
      if typeof country is 'string'
        if country.substring(0, 1) is "+"
          country = country.substring(1)
        if country.length is 2
          if phone_format.isValidNumber(phone_format.formatE164(country, number), country)
            return number
        d = DATA.fineOne(_v: country, _sid: get_sid.countries)
        if d
          cca2 = DATA.findOne(_did: d._did, _sid: get_sid.countries, _kid: get_kid.cca2)
          if cca2
            if phone_format.isValidNumber(phone_format.formatE164(cca2._v, number), cca2._v)
              return number
      if Match.test(country, Meteor.Collection.ObjectID)
        cca2 = DATA.findOne(_did: country, _sid: get_sid.countries, _kid: get_kid.cca2) or DATA.findOne(_id: country, _kid: get_kid.cca2, _sid: get_sid.countries)
        if cca2
          if phone_format.isValidNumber(phone_format.formatE164(cca2._v, number), cca2._v)
            return number
    if number.substring(0, 1) is "+"
      country_code = number.substring(1, 2)
    else
      country_code = number.substring(0, 2)
    doc_id = DATA.findOne(_v: country_code, _kid: get_kid.calling_code, _sid: get_sid.countries)
    if doc_id
      cca2 = DATA.findOne(_did: doc_id._did, _kid: get_kid.cca2, _sid: get_sid.countries)
      if phone_format.isValidNumber(phone_format.formatE164(cca2._v, number), cca2._v)
        return number
    if phone_format.isValidNumber(phone_format.formatE164("TH", number), "TH")
      return number
    if phone_format.isValidNumber(phone_format.formatE164("IN", number), "IN")
      return number
    if phone_format.isValidNumber(phone_format.formatE164("US", number), "US")
      return number
  false
    
      

 
