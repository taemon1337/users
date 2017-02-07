<access-edit>
  <div class="row">
    <div class="col-xs-12">
      <form onsubmit={ save } class="form-horizontal">
        <form-group label="Resource">
          <input onchange={ parent.fieldChange } type="text" class="form-control" placeholder="i.e users..." name="resource" value={ parent.access.resource }>
        </form-group>

        <form-group label="Resource Id">
          <input class="form-control" onchange={ parent.fieldChange } name="resource_id" type='text' name="resource id..." value={ parent.access.resource_id }>
        </form-group>

        <form-group label="Groups">
          <multiselect record={ parent.access } field="groups" value={ parent.access.groups } fetch={ parent.fetch_groups } text_field="name"></multiselect>
        </form-group>

        <form-group label="Permissions">
          <div each={ option in ['create','read','update','delete'] } class="checkbox">
            <label>
              <input onchange={ parent.parent.fieldChange } type='checkbox' name="permissions" value={ option }>{ option }
            </label>
          </div>
        </form-group>

        <form-group>
          <button type="submit" class="btn btn-primary">Save</button>
          <button onclick={ parent.cancel } type="button" class="btn btn-default">Cancel</button>
        </form-group>
      </form>
    </div>
  </div>

  <script>
    var self = this

    self.access = opts.access || {}

    self.fetch_groups = function(cb) { riot.app.fetch("groups", null, null, cb) }

    self.save = function(e) {
      try {
        e.preventDefault()
        riot.app.save("access", self.access, null, function(resp) {
          for(var key in resp) { self.access[key] = resp[key] }
          self.cancel()
        })
      } catch(err) {
        console.warn("Error Saving Form: ", err)
        return false
      }
    }

    self.fieldChange = function(e) {
      var field = e.target.name
      var val = e.target.value
      if(field === 'permissions') {
        var tmp = []
        $(e.target).parents(".form-group").find("input[type=checkbox]:checked")
        .each(function(i,item) { tmp.push( $(item).val() ) })
        self.access[field] = tmp
      } else {
        self.access[field] = val
      }
    }

    self.cancel = function() {
      if(self.parent && self.parent.trigger) {
        self.parent.trigger("form:cancel")
      }
      if(opts.cancel) { opts.cancel() }
    }
  </script>
</access-edit>
