<groups>
  <div class="row">
    <div class="col-xs-12">
      <div class="pull-right">
        <a href="#/groups/new/edit" class="btn btn-primary">Add Group</a>
      </div>
      <h1>Groups</h1>
    </div>

    <riot-table headers={ headers } records={ groups } fetch={ fetch } record_buttons={ record_buttons }></riot-table>
  </div>

  <script>
    var self = this
    self.groups = opts.groups || []

    self.headers = opts.headers || {
      id: { template: "<a href='/#groups/{ _id }'>{ hashColorLine(_id) }</a>" },
      name: {}
    }

    self.record_buttons = opts.record_buttons || [
      { text: "Show", fa: "eye", href: function(record) { return '#/groups/'+record._id }},
      { text: "Edit", fa: "pencil", href: function(record) { return '#/groups/'+record._id+"/edit" }},
      { text: "Delete", fa: "trash", event: "group:delete" }
    ]

    self.fetch = function(cb) { riot.app.fetch("groups", null, null, cb) }

    self.on('group:delete', function(record) {
      var a = confirm('Are you sure you want to delete User ' + record.name + '?')
      if(a) {
        riot.app.delete('groups',record, null, function() {
          self.tags['riot-table'].reload()
        })
      }
    })

    self.rando = function() {
      $.get("/api/fake/group", function(resp) {
        riot.app.save("groups", resp, null, function() {
          self.tags['riot-table'].reload()
        })
      })
    }
  </script>
</groups>
