(function($) {

  function App(opts) {
    opts = opts || {};
    riot.observable(this);
    this.base = opts.base || "/api";
    this._cache = opts._cache || {};
  }

  App.prototype = {
    save: function(collection, record, overrides, cb) {
      var self = this;
      var headers = record._id ? { "If-Match": record._etag } : {};
      var data = {};
      Object.keys(record).filter(function(k) { return !k.startsWith("_") });

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

      $.ajax(options).then(function(resp) { cb(self.parse(resp)) })
      .catch(cb);
    },
    fetch: function(collection, id, action, cb) {
      if(id === 'new') { return cb({}) }
      var self = this;
      var url = [self.base,collection,id].join('/').replace('//','/');
      $.get(url).then(function(resp) {
        cb(self.parse(resp, collection));
      }).catch(function(err) {
        console.warn("Fetch Error: ", err);
      })
    },
    cache: function(path, cb) {
      var self = this;
      if(self._cache[path]) {
        cb(self._cache[path]);
      } else {
        $.get(self.base+path).then(function(resp) {
          self._cache[path] = self.parse(resp);
          cb(self._cache[path]);
        });
      }
    },
    parse: function(resp, collection) {
      return resp._items ? resp._items : resp;
    }
  };

  window.App = App;
})($);
