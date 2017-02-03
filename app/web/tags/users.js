<users>
  <div class="row">
    <div class="col-xs-12">
      <h1>Users</h1>
    </div>

    <riot-table headers={ headers } records={ users } fetch={ fetch } record_buttons={ record_buttons }></riot-table>
  </div>

  <script>
    var self = this
    this.users = opts.users || []

    this.headers = opts.headers || {
      uid: { template: "<a href='/#users/{ uid }'>{ hashColorLabel(uid) }</a>" },
      name: {}
    }

    this.record_buttons = opts.record_buttons || [
      { text: "Delete", fa: "trash", event: "user:delete" }
    ]

    this.fetch = function(cb) { riot.api.get("/users", cb) }

    this.on('user:delete', function(record) {
      var a = confirm('Are you sure you want to delete User ' + record.name + '?')
      if(a) {
        riot.api.delete('/users/'+record._id, record, function() {
          self.tags['riot-table'].reload()
        })
      }
    })

  </script>
</users>
