from eve import Eve
from flask import current_app, Response, send_file, jsonify 
from os import getenv
from faker import Faker
from bson import ObjectId

MONGO_HOST = getenv("MONGO_HOST","mongo")
MONGO_PORT = int(getenv("MONGO_PORT", "27017"))
MONGO_DBNAME = getenv("MONGO_DBNAME","user-db")

user_schema = {
  "username": {
    "type": "string",
    "required": True,
    "unique": True
  },
  "name": {
    "type": "string",
    "required": True,
    "unique": True
  }
}
group_schema = {
  "name": {
    "type": "string",
    "required": True,
    "unique": True
  },
  "description": {
    "type": "string"
  },
  "visibility": {
    "type": "string",
    "allowed": ["public","private","hidden"],
    "default": "public"
  },
  "members": {
    "type": "list",
    "default": [],
    "schema": {
      "type": "objectid",
      "data_relation": {
        "resource": "users",
        "field": "_id",
        "embeddable": True
      }
    }
  }
}
access_schema = {
  "resource": {
    "type": "string",
    "required": True,
    "unique": True
  },
  "groups": {
    "type": "list",
    "default": [],
    "schema": {
      "type": "objectid",
      "data_relation": {
        "resource": "groups",
        "field": "_id",
        "embeddable": True
      }
    }
  },
  "access": {
    "type": "list",
    "allowed": ["create","read","update","delete"],
    "default": ["read"]
  }
}

settings = {
  'URL_PREFIX': 'api',
  'MONGO_HOST': MONGO_HOST,
  'MONGO_PORT': MONGO_PORT,
  'MONGO_DBNAME': MONGO_DBNAME,
  'RESOURCE_METHODS': ['GET','POST'],
  'ITEM_METHODS': ['GET','PUT','PATCH','DELETE'],
#  'MULTIPART_FORM_FIELDS_AS_JSON': True,
  'RETURN_MEDIA_AS_URL': True,
  'RETURN_MEDIA_AS_BASE64_STRING': False,
  'EXTENDED_MEDIA_INFO': ['name','length','content_type'],
  'MEDIA_ENDPOINT': 'raw',
  'DATE_FORMAT': '%Y-%m-%d %H:%M:%S',
  'XML': False,
  'DOMAIN': {
    'users': {
      'additional_lookup': {
        'url': 'regex("[\w]+")',
        'field': 'username'
      },
      'allow_unknown': True,
      'schema': user_schema
    },
    'groups': {
      'embedded_fields': ["members"],
      'schema': group_schema
    },
    "access": {
      'embedded_fields': ["groups"],
      "schema": access_schema
    }
  }
}

app = Eve(settings=settings)
app.faker = Faker()

@app.route('/api/fake/<name>')
def faker(name):
  if hasattr(app.faker, name):
    resp = {}
    resp[name] = getattr(app.faker, name)()
    return jsonify(resp)
  else:
    return None


if __name__ == "__main__":
  host = getenv("HOST","0.0.0.0")
  port = int(getenv("PORT","8080"))
  debug = getenv("DEBUG",True)
  app.run(host=host, port=port, debug=debug)

