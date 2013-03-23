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

  var fragments = document.querySelectorAll('[data-fragment][data-fragment-json]');
  Array.prototype.forEach.call(fragments, function(element) {
    var htmlUrl = element.getAttribute('data-fragment');
    var jsonUrl = element.getAttribute('data-fragment-json');

    load(htmlUrl, function(html) {
      load(jsonUrl, function(json) {
        element.innerHTML = window.fragment.render(html, JSON.parse(json));
      });
    });
  });

  var fragments = document.querySelectorAll('[data-fragment]:not([data-fragment-json])');
  Array.prototype.forEach.call(fragments, function(element) {
    var htmlUrl = element.getAttribute('data-fragment');

    load(htmlUrl, function(html) {
      element.innerHTML = html;
    });
  });

  var fragments = document.querySelectorAll('[data-fragment-json]:not([data-fragment])');
  Array.prototype.forEach.call(fragments, function(element) {
    var jsonUrl = element.getAttribute('data-fragment-json');

    load(jsonUrl, function(json) {
      element.innerHTML = window.fragment.render(element.innerHTML, JSON.parse(json));
    });
  });
})(fragment);
