<users>
  <div class="row">
    <div class="col-xs-12">
      <div class="pull-right">
        <button type="button" onclick={ rando } class="btn btn-primary">Generate User</button>
      </div>
      <h1>Users</h1>
    </div>

    <riot-table headers={ headers } records={ users } fetch={ fetch } record_buttons={ record_buttons }></riot-table>
  </div>

  <script>
    var self = this
    self.users = opts.users || []

    self.headers = opts.headers || {
      id: { template: "<a href='/#users/{ _id }'>{ hashColorLine(_id) }</a>" },
      username: {},
      name: {}
    }

    self.record_buttons = opts.record_buttons || [
      { text: "Delete", fa: "trash", event: "user:delete" }
    ]

    self.fetch = function(cb) { riot.app.fetch("users", null, null, cb) }

    self.on('user:delete', function(record) {
      var a = confirm('Are you sure you want to delete User ' + record.name + '?')
      if(a) {
        riot.app.delete('users',record, null, function() {
          self.tags['riot-table'].reload()
        })
      }
    })

    self.rando = function() {
      $.get("/api/fake/profile", function(resp) {
        riot.app.save("users", resp.profile, null, function() {
          self.tags['riot-table'].reload()
        })
      })
    }
  </script>
</users>
