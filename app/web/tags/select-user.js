<select-user>
  <select onchange={ select } class="form-control input-sm">
    <option>--select-user--</option>
    <option each={ users } value={ uid } { uid === value ? 'selected' : '' }>{ name }</option>
  </select>

  <script>
    var self = this
    this.record = opts.record || {}
    this.field = opts.field
    this.value = this.record[this.field]
    this.users = opts.users || []

    this.select = function(e) {
      self.trigger('user:selected', { record: self.record, field: self.field, value: e.target.value })
    }

    this.on('mount', function() {
      if(opts.fetch) {
        opts.fetch(function(resp) {
          self.update({ users: resp })
        })
      }
    })
  </script>
</select-user>
