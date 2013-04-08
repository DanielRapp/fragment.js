window.fragment = { render: null, html: 'fragment', json: 'fragment-json', jsonp: 'callback' };

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
    var parser = document.createElement('a');
    parser.href = url;

    if (parser.hostname == window.location.hostname) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          callback(xhr.responseText);
        }
      }
      xhr.send();
    }
    // JSONP
    else {
      url += (parser.search == '' ? '?' : '&') + fragment.jsonp + '=JSONPCallback';
      var script = document.createElement('script');
      script.src = url;
      JSONPCallback = function(d) {
        callback(JSON.stringify(d));
      };
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  };

  var fragments = document.querySelectorAll('[data-'+fragment.html+'][data-'+fragment.json+']');
  Array.prototype.forEach.call(fragments, function(element) {
    var htmlUrl = element.getAttribute('data-fragment');
    var jsonUrl = element.getAttribute('data-fragment-json');
    
    var media = element.getAttribute('data-fragment-media');
    if( media && matchMedia && matchMedia(media).matches === false ) return;

    load(htmlUrl, function(html) {
      load(jsonUrl, function(json) {
        element.innerHTML = window.fragment.render(html, JSON.parse(json));
      });
    });
  });

  var fragments = document.querySelectorAll('[data-'+fragment.html+']:not([data-'+fragment.json+'])');
  Array.prototype.forEach.call(fragments, function(element) {
    var htmlUrl = element.getAttribute('data-fragment');
    
    var media = element.getAttribute('data-fragment-media');
    if( media && matchMedia && matchMedia(media).matches === false ) return;
    
    load(htmlUrl, function(html) {
      if (element.innerHTML == '') {
        element.innerHTML = html;
      }
      else {
        element.innerHTML = window.fragment.render(html, JSON.parse(element.innerHTML));
      }
    });
  });

  var fragments = document.querySelectorAll('[data-'+fragment.json+']:not([data-'+fragment.html+'])');
  Array.prototype.forEach.call(fragments, function(element) {
    var jsonUrl = element.getAttribute('data-fragment-json');
    
    var media = element.getAttribute('data-fragment-media');
    if( media && matchMedia && matchMedia(media).matches === false ) return;

    load(jsonUrl, function(json) {
      element.innerHTML = window.fragment.render(element.innerHTML, JSON.parse(json));
    });
  });
})(fragment);
