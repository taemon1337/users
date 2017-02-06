<groups-access-control>
  <div>
    <div class="pull-right">
      <button onclick={ addAccess } type="button" class="btn btn-primary">Add Access Control</button>
    </div>
    <h1>Access Control</h1>

    <div if={ access }>
      <access-edit access={ access }></access-edit>
    </div>

    <riot-table fetch={ fetch_access } headers={ headers } record_buttons={ record_buttons }></riot-table>
  </div>

  <script>
    var self = this

    self.group = opts.group
    self.access = opts.access

    self.headers = {
      _id: {},
      resource: {},
      groups: { render: function(o) { return o.record.groups.map(function(g) { return g.name }).join(',') } },
      access: {}
    }

    self.record_buttons = [
      { fa: "remove text-danger", event: "access:delete" }
    ]

    var getNames = function(groups) { return groups.map(function(g) { return g.name }) }

    self.fetch_access = function(cb) { riot.app.fetch("access", null, null, cb) }

    self.addAccess = function() {
      self.update({ access: { groups: [self.group], access: ["read"] }})
    }

    self.on('form:cancel', function() {
      self.update({ access: null })
      self.tags['riot-table'].reload()
    })
  </script>
</groups-access-control>
