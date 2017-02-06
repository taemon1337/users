<login>
  <div class="col-xs-2"></div>
  <div class="col-xs-8">
    <form onsubmit={ login } class="form-horizontal">
      <form-group>
        <h1>You must login</h1>
      </form-group>
      <form-group label="Username">
        <input type="text" class="form-control" name="username" placeholder="certificate dn...">
      </form-group>
      <form-group label="Display Name">
        <input type="text" class="form-control" name="name" placeholder='enter name...'>
      </form-group>
      <form-group>
        <button type="submit" class="btn btn-primary">Sign in</button>
      </form-group>
    </form>
  </div>
  <div class="col-xs-2"></div>

  <script>
    var self = this

    self.url = opts.url || "/"

    self.login = function(e) {
      e.preventDefault()
      try {
        var data = self.get_form_data(e.target);
        riot.app.login('users', data, null, function(user) {
          riot.route.exec(self.url)
        })
      } catch(err) {
        console.log("ERROR: ", err)
        return false
      }
    }

    self.get_form_data = function(form) {
      var r = {}
      $(form).serializeArray().forEach(function(arg) {
        r[arg.name] = arg.value
      })
      return r;
    }
  </script>
</login>

