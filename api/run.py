from eve import Eve
from flask import current_app, Response, send_file, jsonify 
from os import getenv
from faker import Faker
from bson.objectid import ObjectId
from access_control import AccessControl, access_control_can, access_control_startup 

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
      "type": "dict",
      "schema": {
        "user": {
          "type": "objectid",
          "data_relation": {
            "resource": "users",
            "field": "_id",
            "embeddable": True
          }
        },
        "role": {
          "type": "string",
          "allowed": ["member","manager"]
        }
      }
    }
  }
}
access_schema = {
  "resource": {
    "type": "string",
    "required": True
  },
  "resource_id": {
    "type": "string",
    "default": ""
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
  "permissions": {
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
      'embedded_fields': ["members.user"],
      'schema': group_schema
    },
    "access": {
      'embedded_fields': ["groups"],
      "schema": access_schema
    }
  }
}

def create_user_group(items):
  users = app.data.driver.db["users"]
  groups = app.data.driver.db["groups"]

  if users.count() == 1:
    groups.update_one({ "name": "admins" },{ "$set": { "members": [{ "user": items[0]["_id"], "role": "manager" }] }})

  for user in items:
    if user["username"] and user["_id"]:
      groups.insert_one({ "name": user["username"], "description": "default user group", "visibility": "hidden", "members": [{ "user": user["_id"], "role": "manager"  }] })


app = Eve(settings=settings)
app.faker = Faker()

# CRUD access control callbacks
#app.on_insert           += AccessControl.create
#app.on_fetched_resource += AccessControl.read
#app.on_replace          += AccessControl.update
#app.on_update           += AccessControl.update
#app.on_deleted_item     += AccessControl.delete

#app.on_pre_POST   += AccessControl.create
app.on_pre_GET    += AccessControl.GET
#app.on_pre_PATCH  += AccessControl.update
#app.on_pre_PUT    += AccessControl.update
#app.on_pre_DELETE += AccessControl.delete

app.on_inserted_users += create_user_group


# I.E GET /api/can/ts1222/read/users
# I.E GET /api/can/ts1222/update/users/ts1222
@app.route("/api/can/<username>/<permission>/<resource>")
@app.route("/api/can/<username>/<permission>/<resource>/<resource_id>")
def can(username, permission, resource,resource_id=""):
  group = access_control_can(username, permission, resource, resource_id)
  if group:
    return jsonify({ "can": True, "group": group })
  else:
    return jsonify({ "can": False })

@app.route("/api/ask/<username>/<resource>")
@app.route("/api/ask/<username>/<resource>/<resource_id>")
def ask(username, resource, resource_id=""):
  perms = []
  groups = {}
  for perm in ["create","read","update","delete"]:
    group = access_control_can(username, perm, resource, resource_id)
    if group:
      groups[perm] = group
      perms.append(perm)
  return jsonify({ "permissions": perms, "groups": groups })

@app.route('/api/fake/<name>')
def faker(name):
  if hasattr(app.faker, name):
    resp = {}
    resp[name] = getattr(app.faker, name)()
    return jsonify(resp)
  else:
    return None

with app.app_context():
  access_control_startup()

if __name__ == "__main__":
  host = getenv("HOST","0.0.0.0")
  port = int(getenv("PORT","8080"))
  debug = getenv("DEBUG",True)
  app.run(host=host, port=port, debug=debug)

