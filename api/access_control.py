from flask import current_app as app


def find_access_group(username, permission, access):
  users = app.data.driver.db["users"]
  groups = app.data.driver.db["groups"]

  if access["groups"] and access["permissions"]:
    for groupid in access["groups"]:
      group = groups.find_one({ "_id": groupid })
      if group:
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
    
    app.logger.info("READING " + str(resource))
    return False

  @classmethod
  def create(cls, resource, items):
    app.logger.info("CREATING: ", resource)
    pass

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


