<groups-edit>
  <div class="row">
    <div class="col-xs-12">
      <form onsubmit={ save } class={ formclass }>
        <form-group label="Name" columns={ opts.columns }>
          <input onchange={ parent.fieldChange } type="text" class="form-control" placeholder="group name..." name="name" value={ parent.group.name }>
        </form-group>

        <form-group label="Description" columns={ opts.columns }>
          <textarea onchange={ parent.fieldChange } class="form-control" rows=4 name="description" placeholder="enter description...">{ parent.group.description }</textarea>
        </form-group>

        <form-group label="Manager" columns={ opts.columns }>
          <select-option fetch={ parent.parent.fetch_users } option_text="name" onselect={ parent.managerSelect }></select-option>
        </form-group>

        <form-group label="Visibility" columns={ opts.columns }>
          <div class="radio">
            <label title="everyone can see and join the group">
              <input type='radio' name="visibility" value="public"  { parent.group.visibility === 'public' ? 'checked' : '' }>
              public
            </lable>
          </div>
          <div class="radio">
            <label title="everyone can see, but only those invited can join">
              <input type='radio' name="visibility" value="private" { parent.group.visibility === 'private' ? 'checked' : '' }>
              private
            </lable>
          </div>
          <div class="radio">
            <label title="only members/invited can see the existance of the group">
              <input type='radio' name="visibility" value="hidden" { parent.group.visibility === 'hidden' ? 'checked' : '' }>
              hidden
            </lable>
          </div>
        </form-group>

        <form-group columns={ opts.columns }>
          <button type="submit" class="btn btn-primary">Save</button>
          <button onclick={ parent.cancel } type="button" class="btn btn-default">Cancel</button>
        </form-group>
      </form>
    </div>
  </div>

  <script>
    var self = this

    self.currentUser = riot.app.currentUser
    self.formclass = opts.formclass || "form-horizontal"
    self.group = opts.group || { visibility: 'public', members: [{ user: self.currentUser, role: "manager" }] }

    self.save = function(e) {
      e.preventDefault()
      riot.app.save("groups", self.group, null, function(record) {
        self.update({ group: record })
        self.trigger("form:saved")
      })
    }

    self.managerSelect = function(res) {
      self.group.members = [{ user: res.option, role: "manager" }]
    }

    self.fieldChange = function(e) {
      self.group[e.target.name] = $(e.target).val()
      self.update({ group: self.group })
    }

    self.addField = function(e) {
      var input = $(e.target).parents('.input-group').find('input')
      self.tags['key-value-inputs'].trigger('add', { key: input.val() })
      setTimeout(function() { input.val('') }, 900)
    }

    self.on('fields:changed', function(data) {
      if(data.fields) {
        self.group.fields = data.fields
      }
    })

    self.cancel = function() {
      window.history.back()
    }
  </script>
</groups-edit>
