<groups-show>
  <div class="form-horizontal col-xs-12">
    <div class="pull-right">
      <a href="./#/groups/{ group._id }/edit" class="btn btn-primary">Edit</a>
    </div>

    <h1>
      { group.name }
      <small>{ group.description }</small>
    </h1>
    <hr/>
    <h3>Profile Fields</h3>
    <form-tree field="group-fields" object={ group.fields }></form-tree>

  </div>

  <script>
    var self = this
    self.group = opts.group

    self.on('tree:change', function(data) {
      self.group.fields = data.object
      riot.app.save("groups", self.group, { method: "PUT" }, function(resp) {
        for(var key in resp) { self.group[key] = resp[key] }
        self.update({ group: self.group })
      })
    })
  </script>
</groups-show>
