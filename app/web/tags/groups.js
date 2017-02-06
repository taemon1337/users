<groups>
  <div class="container-fluid">
    <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
      <div class="panel panel-default">
        <div class="panel-heading">
          <h3 class="panel-title">
            Add Group
          </h3>
        </div>
        <div class="panel-body">
          <groups-edit formclass="form" group={ { visibility: 'public' } } columns={{ left: '12', center: '12', right: '0 hidden' }}></groups-edit>
        </div>
      </div>
    </div>
    <div each={ group,index in groups } class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
      <div class="panel panel-default">
        <div class="panel-heading">
          <div  class="pull-right" style="margin-top:-7px;">
            <select-option default="--add user--" record={ group } onselect={ addUser } fetch={ fetch_users } option_text="name"></select-option>
          </div>
          <h3 class="panel-title">
            <a href="#/groups/{ group._id }">{ group.name }</a>
          </h3>
        </div>
        <div class="panel-body">
          <table class="table table-condensed table-striped" style="font-size:10px;">
            <tbody>
              <tr if={ group.members.length } each={ user,uindex in group.members }>
                <td><span data-gid={ index } ondblclick={ promote } title="double click to make manager" class="fa-2x fa fa-user"></span></td>
                <td>{ user.username }</td>
                <td>{ user.name }</td>
                <td>
                  <div>
                    <span onclick={ parent.removeUser } group-index={ index } class='fa fa-remove'></span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="panel-footer">
          <div class="pull-right">
            <span onclick={ remove } class="fa fa-trash text-danger"></span>
          </div>
          <i>({ group.members.length } members)</i>
        </div>
      </div>
    </div>
  </div>

  <script>
    var self = this
    self.currentUser = riot.app.currentUser
    self.groups = opts.groups || []

    self.fetch_users = function(cb) { riot.app.cache("users", null, null, cb) }

    self.addUser = function(resp) {
      if(resp.value && resp.value.length === 24) {
        var ids = resp.record.members.map(function(u) { return u._id })
        if(ids.indexOf(resp.value) === -1) {
          resp.record.members.push(resp.option)
          riot.app.save("groups", resp.record, null, function(res) {
            for(var key in res) { resp.record[key] = res[key] }
            self.update()
            resp.event.target.value = "--add user--"
          })
        }
      }
    }

    self.addNew = function(e) {
      try {
        e.preventDefault()
        var record = self.serializeForm(e.target)
        riot.app.save("groups", record, null, function(resp) {
          for(var key in resp) { record[key] = resp[key] }
          record.managers = record.managers || []
          record.members = record.members || []
          self.groups.push(record)
          self.update()
          e.target.reset()
        })
      } catch(err) {
        console.warn("Error Submit Form: ", err)
        return false
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
      var gi = $(e.target).data('gid')
      var group = self.groups[gi]
      if(group) {
        group.members.splice(e.item.uindex,1)
        group.managers.push(e.item.user)
        self.update()
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
  </script>
</groups>
