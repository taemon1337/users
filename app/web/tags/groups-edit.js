<groups-edit>
  <div class="row">
    <div class="col-xs-12">
      <form onsubmit={ save } class="form-horizontal">
        <form-group label="Id">
          <input type="text" readonly class="form-control" value={ parent.group._id }>
        </form-group>

        <form-group label="Name">
          <input onchange={ parent.fieldChange } type="text" class="form-control" placeholder="group name..." name="name" value={ parent.group.name }>
        </form-group>

        <form-group label="Description">
          <textarea onchange={ parent.fieldChange } class="form-control" rows=4 name="description" placeholder="enter description...">{ parent.group.description }</textarea>
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
    this.group = opts.group || {}

    this.save = function(e) {
      e.preventDefault()
      riot.app.save("groups", self.group, null, function(record) {
        console.log("SAVED: ", record)
        self.update({ group: record })
      })
    }

    this.fieldChange = function(e) {
      self.group[e.target.name] = $(e.target).val()
      self.update({ group: self.group })
    }

    this.addField = function(e) {
      var input = $(e.target).parents('.input-group').find('input')
      self.tags['key-value-inputs'].trigger('add', { key: input.val() })
      setTimeout(function() { input.val('') }, 900)
    }

    this.on('fields:changed', function(data) {
      if(data.fields) {
        self.group.fields = data.fields
      }
    })

    this.cancel = function() {
      window.history.back()
    }
  </script>
</groups-edit>
