from flask import current_app as app
from time import sleep

def access_control_startup():
  sleep(5)
  users = app.data.driver.db["users"]
  groups = app.data.driver.db["groups"]
  accesses = app.data.driver.db["access"]

  if groups.count() < 1:
    everyone = groups.insert_one({ "name": "everyone", "description": "everyone is in everyone group", "visibility": "hidden", "members": [] })
    admin = groups.insert_one({ "name": "admins", "description": "default admins group", "visibility": "public", "members": [] })

  if accesses.count() < 1:
    accesses.insert_one({ "resource": "access", "resource_id": "", "permissions": ["create","read","update","delete"], "groups": [admin.inserted_id] })
    accesses.insert_one({ "resource": "users", "resource_id": "", "permissions": ["create","read","update","delete"], "groups": [admin.inserted_id] })
    accesses.insert_one({ "resource": "users", "resource_id": "", "permissions": ["create","read"], "groups": [everyone.inserted_id] })


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


class AccessControl:

  @classmethod
  def setMaster(cls, resource, items):
    groups = app.data.driver.db["groups"]

    if resource == "groups" and groups.count() == 1:
      app.master_group = items[0]["name"]

  @classmethod
  def GET(cls, resource, req, lookup):
    parsed = req.path.split('/')
    
    app.logger.info("READING " + resource)
    return False

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


