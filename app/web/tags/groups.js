<groups>
  <div class="row">
    <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
      <div class="panel panel-default">
        <div class="panel-heading">
          <h3 class="panel-title">
            Add Group
          </h3>
        </div>
        <div class="panel-body">
          <groups-edit formclass="form" columns={{ left: '12', center: '12', right: '0 hidden' }}></groups-edit>
        </div>
      </div>
    </div>
    <div each={ group,index in groups } class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
      <div class="panel panel-default">
        <div class="panel-heading">
          <div class="pull-right">
            <i>({ group.members.length } members)</i>
          </div>
          <h3 class="panel-title">
            <a href="#/groups/{ group._id }">{ group.name }</a>
          </h3>
        </div>
        <div class="panel-body">
          <table class="table table-condensed table-striped" style="font-size:10px;">
            <tbody>
              <tr data-gid={ index } if={ group.members.length } each={ user,uindex in group.members }>
                <td if={ isManager(group) }>
                  <span if={ user.role === 'member' } ondblclick={ promote } title="double click to make manager" class="fa fa-2x fa-user text-success pointer"></span>
                  <span if={ user.role === 'manager' } ondblclick={ demote } title="remove manager status" class="fa fa-2x fa-user-plus text-success pointer"></span>
                </td>
                <td if={ !isManager(group) }>
                  <span if={ user.role === 'member' } title="Member" class="fa fa-2x fa-user"></span>
                  <span if={ user.role === 'manager' } title"Manager" class="fa fa-2x fa-user-plus"></span>
                </td>
                <td>{ user.user.username }</td>
                <td>{ user.user.name }</td>
                <td>
                  <div if={ isManager(group) || currentUser._id === user.user._id }>
                    <span onclick={ parent.removeUser } group-index={ index } class='fa fa-remove text-danger' title="Remove from group"></span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="panel-footer">
          <div class="pull-right">
            <span if={ isManager(group) } onclick={ remove } class="fa fa-trash text-danger"></span>
          </div>

          <div if={ isManager(group) } style="max-width:90%;">
            <select-option default="--add user--" record={ group } onselect={ addUser } fetch={ fetch_users } option_text="name"></select-option>
          </div>
        </div>
      </div>
    </div>
  </div>

  <style>
    .pointer { cursor: pointer; }
  </style>

  <script>
    var self = this
    var not_hidden = function(g) { return g.visibility !== 'hidden' }

    self.currentUser = riot.app.currentUser
    self.groups = (opts.groups || []).filter(not_hidden)

    self.fetch_users = function(cb) { riot.app.cache("users", null, null, cb) }

    self.reload = function() {
      riot.app.fetch("groups", null, null, function(groups) {
        self.update({ groups: groups.filter(not_hidden) })
      })
    }

    self.addUser = function(res) {
      if(res.record && res.option) {
        res.record.members.push({ user: res.option, role: "member" })
        riot.app.save("groups", res.record, null, function(resp) {
          res.event.target.value = "--add user--"
          for(var key in res) { res.record[key] = resp[key] }
          self.update()
        })
      }
    }

    self.removeUser = function(e) {
      var gi = parseInt($(e.target).attr('group-index'))
      self.groups[gi].members.splice(e.item.uindex,1)
      riot.app.save("groups", self.groups[gi], null, function(resp) {
        for(var key in resp) { self.groups[gi][key] = resp[key] }
        self.update()
      })
    }

    self.remove = function(e) {
      var a = confirm("Are you sure you want to delete the '"+e.item.group.name+"' group?")
      if(a) {
        riot.app.delete("groups", e.item.group, null, function() {
          self.groups.splice(e.item.index, 1)
          self.update()
        })
      }
    }

    self.promote = function(e) {
      var gid = $(e.target).parents('tr').data('gid')
      if(self.groups[gid]) {
        var group = self.groups[gid]
        if(self.canPromote(group)) {
          e.item.user.role = "manager"
          riot.app.save("groups", group, null, function(resp) {
            for(var key in resp) { group[key] = resp[key] }
            self.update()
          })
        }
      }
    }

    self.demote = function(e) {
      var gid = $(e.target).parents('tr').data('gid')
      if(self.groups[gid]) {
        var group = self.groups[gid]
        if(self.canDemote(group)) {
          e.item.user.role = "member"
          riot.app.save("groups", group, null, function(resp) {
            for(var key in resp) { group[key] = resp[key] }
            self.update()
          })
        }
      }
    }

    self.isManager = function(group) {
      return group.members
        .filter(function(g) { return g.role === 'manager' })
        .map(function(g) { return g.user._id })
        .indexOf(self.currentUser._id) >= 0
    }

    self.canPromote = function(group) {
      return self.isManager(group)
    }

    self.canDemote = function(group) {
      var mgrs = group.members.filter(function(m) { return m.role === "manager" })
      if(mgrs.length < 2) {
        Alert({ title: "WARNING", body: "You cannot remove all managers, you should assign another user as a manager, then remove!", status: "warning" })
        return false
      } else {
        return self.isManager(group)
      }
    }

    self.serializeForm = function(form) {
      var r = {}
      $(form).serializeArray().forEach(function(item) {
        if(item.name.endsWith("[]")) {
          var name = item.name.replace('[]','')
          if(r[name]) {
            r[name].push(item.value)
          } else {
            r[name] = [item.value]
          }
        } else {
          r[item.name] = item.value
        }
      })
      return r
    }

    self.on('mount', function() {
      self.tags['groups-edit'].on('form:saved', function() {
        self.reload()
      })
    })
  </script>
</groups>
