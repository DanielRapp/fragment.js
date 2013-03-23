window.fragment = { render: null };

(function(fragment) {
  if (fragment.render === null) {
    fragment.render = function(html, json) {
      var output = html;

      if (window.Mustache !== undefined && window.Mustache.render !== undefined) {
        output = Mustache.render(html, json);
      } else if (window.Handlebars !== undefined && window.Handlebars.compile !== undefined) {
        output = Handlebars.compile(html)(json);
      } else if (window._ !== undefined && window._.template !== undefined) {
        output = _.template(html, json);
      }

      return output;
    };
  }

  var load = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        callback(xhr.responseText);
     }
    }
    xhr.send();
  };

  var fragments = document.querySelectorAll('[data-fragment]');
  Array.prototype.forEach.call(fragments, function(element) {
    var url = element.getAttribute('data-fragment')
    load(url, function(html) {
      var jsonUrl = element.getAttribute('data-fragment-json')
      if (jsonUrl !== null) {
        load(jsonUrl, function(json) {
          element.innerHTML = window.fragment.render(html, JSON.parse(json));
        });
      }
      else {
        element.innerHTML = html;
      }
    });
  });
})(fragment);
