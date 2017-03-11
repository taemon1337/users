<test-access>
  <div class="row">
    <div class="col-xs-6">
      <form onsubmit={ testCan } class="form-inline">
        <div class="form-group">
          <label for="username">Can</label>
          <select-option field="username" fetch={ fetch_users } option_text="name" option_value="username"></select-option>
        </div>

        <div class="form-group">
          <label for="permission"></label>
          <select-option field="permission" records={ crud } option_text="name" option_value="name"></select-option>
        </div>

        <div class="form-group">
          <label for="resource"></label>
          <select-option field="resource" fetch={ fetch_accesses } option_text="resource" option_value="resource"></select-option>
        </div>

        <div class="form-group">
          <label for="resource_id"></label>
          <input class='form-control input-sm' type="text" placeholder="id..." name="resource_id">
        </div>

        <div class="form-group">
          <button type="submit" class="btn btn-primary">Check Access</button>
        </div>
      </form>

      <div class="list-group">
        <div each={ canresults } class="list-group-item text-{ can ? 'success' : 'danger' }">
          <span if={ can } class="fa fa-check text-success"></span>
          <span if={ !can } class="fa fa-remove text-danger"></span>
          { username } can{ can ? '' : 'not' } { permission } { resource } { resource_id }
          <span if={ group }> because they are in the { group } group</span>
        </div>
      </div>
    </div>

    <div class="col-xs-6">
      <form onsubmit={ testAsk } class="form-inline">
        <div class="form-group">
          <label for="username">Ask</label>
          <select-option field="username" fetch={ fetch_users } option_text="name" option_value="username"></select-option>
        </div>

        <div class="form-group">
          <label for="resource"></label>
          <select-option field="resource" fetch={ fetch_accesses } option_text="resource" option_value="resource"></select-option>
        </div>

        <div class="form-group">
          <label for="resource_id"></label>
          <input class='form-control input-sm' type="text" placeholder="id..." name="resource_id">
        </div>

        <div class="form-group">
          <button type="submit" class="btn btn-primary">Get Permissions</button>
        </div>
      </form>

      <div class="list-group">
        <div each={ askresults } class="list-group-item text-{ can ? 'success' : 'danger' }">
          <span if={ can } title="{ JSON.stringify(groups) }">
            <span class="fa fa-check text-success"></span>
            { username } can { permissions.join(', ') } { resource } { resource_id }
          </span>
          <span if={ !can }>
            <span class="fa fa-remove text-danger"></span>
            { username } has NO permissions on { resource } { resource_id }
          </span>
        </div>
      </div>
    </div>
  </div>

  <script>
    var self = this
    var serializeForm = function(form) {
      var d = {}
      $(form).serializeArray().forEach(function(item) { d[item.name] = item.value });
      return d;
    }

    self.currentUser = riot.app.currentUser
    self.canresults = opts.canresults || []
    self.askresults = opts.askresults || []

    self.testCan = function(e) {
      try {
        e.preventDefault()
        var data = serializeForm(e.target)
        var url = "./api/can/"+data.username+"/"+data.permission+"/"+data.resource
        if(data.resource_id) { url += "/"+data.resource_id }
        $.get(url, function(resp) {
          data.can = resp.can
          data.group = resp.group
          self.canresults.push(data)
          self.update()
        })
      } catch(err) {
        console.log("Error testing access ", err)
        return false
      }
    }

    self.testAsk = function(e) {
      try {
        e.preventDefault()
        var data = serializeForm(e.target)
        var url = "./api/ask/"+data.username+"/"+data.resource
        if(data.resource_id) { url += "/"+data.resource_id }
        $.get(url, function(resp) {
          data.can = resp.permissions.length > 0
          data.permissions = resp.permissions
          data.groups = resp.groups
          self.askresults.push(data)
          self.update()
        })
      } catch(err) {
        console.log("Error testing access ", err)
        return false
      }
    }

    self.fetch_users = function(cb) { riot.app.fetch("users", null, null, cb) }
    self.fetch_accesses = function(cb) { riot.app.fetch("access", null, null, cb) }

    self.crud = [
      { name: "read" },
      { name: "create" },
      { name: "update" },
      { name: "delete" }
    ]

  </script>
</test-access>
