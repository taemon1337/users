<access>
  <div>
    <div class="pull-right">
      <button onclick={ addAccess } type="button" class="btn btn-primary">Add Access Control</button>
    </div>
    <h1>Access Control</h1>

    <div if={ editing }>
      <access-edit access={ editing }></access-edit>
    </div>

    <riot-table records={ records } fetch={ fetch_access } headers={ headers } record_buttons={ record_buttons }></riot-table>
  </div>

  <script>
    var self = this

    self.currentUser = riot.app.currentUser
    self.records = opts.access || []
    self.editing = opts.editing

    self.headers = {
      _id: {},
      resource: {},
      resource_id: { template: "{ resource_id || '' }" },
      groups: { text: "AUTHORIZED GROUPS", render: function(o) { return o.record.groups.map(function(g) { return g.name }).join(',') } },
      permissions: {}
    }

    self.record_buttons = [
      { fa: "pencil", event: "access:edit" },
      { fa: "remove text-danger", event: "access:delete" }
    ]

    self.on("access:edit", function(record) {
      self.update({ editing: record })
    })

    self.on("access:delete", function(record) {
      var a = confirm("Are you sure you want to remove the permission for " + record.resource+"?")
      if(a) {
        riot.app.delete("access", record, null, function() {
          self.tags['riot-table'].reload()
        })
      }
    })

    self.fetch_access = function(cb) { riot.app.fetch("access", null, null, cb) }

    self.addAccess = function() {
      self.update({ editing: { groups: [], permissions: ["read"] }})
    }

    self.on('form:cancel', function() {
      self.update({ editing: null })
      self.tags['riot-table'].reload()
    })
  </script>
</access>
