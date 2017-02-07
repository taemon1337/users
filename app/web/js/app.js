(function($) {

  function App(opts) {
    opts = opts || {};
    riot.observable(this);
    this.base = opts.base || "/api";
    this.currentUser = JSON.parse(sessionStorage.getItem("currentUser"))
    this._cache = opts._cache || {};
  }

  App.prototype = {
    login: function(collection, user, overrides, cb) {
      var self = this;

      self.fetch(collection, user.username, null, function(resp) {
        if(resp) {
          self.loggedIn(resp, cb)
        } else {
          self.save(collection, user, overrides, function(resp) {
            if(resp) {
              self.loggedIn(resp, cb)
            } else {
              Alert({ status: "danger", title: "Could not login!", body: resp })
            }
          })
        }
      })
    },
    logout: function() {
      this.currentUser = null;
      sessionStorage.removeItem("currentUser");
      location.reload();
    },
    loggedIn: function(user, cb) {
      Alert({ color: "success", title: "Welcome "+user.name, classes: "col-xs-4" })
      sessionStorage.setItem("currentUser", JSON.stringify(user))
      this.currentUser = user
      cb(user)
    },
    save: function(collection, record, overrides, cb) {
      var self = this;
      var headers = record._id ? { "If-Match": record._etag } : {};
      var data = {};
      Object.keys(record).filter(function(k) { return !k.startsWith("_") }).map(function(k) {
        if(['groups'].indexOf(k) >= 0) {
          data[k] = record[k].map(function(rel) { return typeof rel === 'object' ? rel._id : rel })
        } else if(k === 'members') {
          data[k] = record[k].map(function(rel) { return { user: rel.user._id, role: rel.role }})
        } else {
          data[k] = record[k]
        }
      })

      var options = $.extend({}, {
        url: [self.base,collection,record._id].join('/').replace('//','/'),
        method: record._id ? "PATCH" : "POST",
        dataType: "json",
        contentType: "application/json",
        headers: headers,
        data: JSON.stringify(data)
      }, overrides);

      $.ajax(options).then(function(resp) {
        var parsed = self.parse(resp);
        for(var attr in parsed) { record[attr] = parsed[attr]; }
        self.notice.saved(record)
        cb(record)
      });
    },
    notice: {
      saved: function(record) {
        Alert({
          title: "Success!",
          body: "'"+(record.title || record.name || record._id) + "' was saved at " + record._updated,
          color: "success",
          classes: "col-xs-3"
        })
      }
    },
    delete: function(collection, record, overrides, cb) {
      var self = this;
      var headers = record._id ? { "If-Match": record._etag } : {};

      var options = $.extend({}, {
        url: [self.base,collection,record._id].join('/').replace('//','/'),
        method: "DELETE",
        dataType: "json",
        contentType: "application/json",
        headers: headers
      }, overrides);

      $.ajax(options)
      .then(function(resp) { cb(self.parse(resp)) })
      .done(cb)
      .catch(cb)
    },
    fetch: function(collection, id, action, cb) {
      if(id === 'new') { return cb({}) }
      var self = this;
      var url = [self.base,collection,id].join('/').replace('//','/');
      $.get(url).then(function(resp) {
        cb(self.parse(resp, collection));
      }).catch(function(err) {
        console.warn("Fetch Error: ", err);
        cb(null)
      })
    },
    cache: function(collection,id,action,cb) {
      var self = this;
      var url = [self.base,collection,id].join('/').replace('//','/');
      if(self._cache[url]) {
        if(self._cache[url] === "wait") {
          setTimeout(function() {
            self.cache(collection,id,action,cb)
          }, 1000)
        } else {
          cb(self._cache[url]);
        }
      } else {
        self._cache[url] = "wait"
        self.fetch(collection,id,action,function(resp) {
          self._cache[url] = resp
          cb(resp)
        })
      }
    },
    parse: function(resp, collection) {
      return resp && resp._items ? resp._items : resp;
    }
  };

  window.App = App;
})($);
