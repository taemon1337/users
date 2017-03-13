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
  </div>

  <script>
    var self = this
    self.group = opts.group
  </script>
</groups-show>
