from flask import current_app as app, abort
from time import sleep

def access_control_startup():
  sleep(3)
  adminid = None
  everyoneid = None
  users = app.data.driver.db["users"]
  groups = app.data.driver.db["groups"]
  accesses = app.data.driver.db["access"]

  if groups.count() < 1:
    everyone = groups.insert_one({ "name": "everyone", "description": "everyone is in everyone group", "visibility": "hidden", "members": [] })
    admin = groups.insert_one({ "name": "admins", "description": "default admins group", "visibility": "public", "members": [] })
    everyoneid = everyone.inserted_id
    adminid = admin.inserted_id

  if accesses.count() < 1:
    if adminid is None:
      admin = groups.find_one({ "name": "admins" })
      adminid = admin["_id"]
    if everyoneid is None:
      everyone = groups.find_one({ "name": "everyone" })
      everyoneid = everyone["_id"]
    accesses.insert_one({ "resource": "access", "resource_id": "", "permissions": ["create","read","update","delete"], "groups": [adminid] })
    accesses.insert_one({ "resource": "groups", "resource_id": "", "permissions": ["create","read","update","delete"], "groups": [adminid] })
    accesses.insert_one({ "resource": "users", "resource_id": "", "permissions": ["create","read","update","delete"], "groups": [adminid] })
    accesses.insert_one({ "resource": "users", "resource_id": "", "permissions": ["create","read"], "groups": [everyoneid] })

def find_access_group(username, permission, access, resource_id=""):
  res_id = access['resource_id'] if 'resource_id' in access else ''
  users = app.data.driver.db["users"]
  groups = app.data.driver.db["groups"]

  if access["groups"] and access["permissions"]:
    if res_id is "" or res_id is resource_id:
      for groupid in access["groups"]:
        group = groups.find_one({ "_id": groupid })
        if group:
          if group["name"] == "everyone":
            if permission in access["permissions"]:
              return group
          for member in group["members"]:
            user = users.find_one({ "_id": member["user"] })
            if user:
              if user["username"] == username:
                if permission in access["permissions"]:
                  return group
    return False
  else:
    raise Exception("Invalid Access: missing 'groups' or 'permissions' key!")


def access_control_can(username, permission, resource, resource_id=""):
  accesses = app.data.driver.db["access"]
  app.logger.info("CAN: " + username + " " + permission + " " + resource + " " + resource_id)

  access_list = accesses.find({ "resource": resource })
  for access in access_list:
    access_group = find_access_group(username, permission, access, resource_id=resource_id)
    if access_group:
      return access_group["name"]
  return False


def parse_username(req):
  return req.headers['CurrentUser'] if req.headers.has_key('CurrentUser') else ""


class AccessControl:

  @classmethod
  def GET(cls, resource, req, lookup):
    parsed = req.path.split('/')
    parsed.remove('')
    username = parse_username(req)
    resource = parsed[1] if len(parsed) > 1 else ""
    resource_id = parsed[2] if len(parsed) > 2 else ""
    if parsed[0] == 'api':
      if not access_control_can(username, 'read', resource, resource_id):
        msg = "Permission Denied: " + username + " cannot read " + resource + " " + resource_id
        abort(400,msg)
    

  @classmethod
  def create(cls, resource, items):
    app.logger.info("CREATING: " + resource)
    return True

  @classmethod
  def read(cls, resource, items):
    app.logger.info("READING " + resource)
    return False

  @classmethod
  def update(cls, resource, updates_or_item, original):
    pass

  @classmethod
  def delete(cls, resource, item):
    pass


