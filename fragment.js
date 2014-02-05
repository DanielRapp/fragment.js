;(function(win, doc) {

  // Gets either a string, which it will just return, or a {html, json} pair which
  // it will try to render with Mustache, Handlebars and Underscore.
  // If that fails, it just returns the html.
  var render = function(html, json) {
    if (typeof json === "undefined") {
      return html;
    }

    if (typeof win.Mustache !== "undefined" &&
        typeof win.Mustache.render !== "undefined") {
      return Mustache.render(html, json);
    } else if (typeof win.Handlebars !== "undefined" &&
               typeof win.Handlebars.compile !== "undefined") {
      return Handlebars.compile(html)(json);
    } else if (typeof win._ !== "undefined" &&
               typeof win._.template !== "undefined") {
      return output = _.template(html, json);
    }

    return html;
  };

  // Helper function to load ajax data
  var load_xhr = function(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.send();
    request.onload = function() {
      callback(this.response);
    };
  };

  // Helper function to load jsonp data
  var load_jsonp = function(url, callback, url_parser) {
    var script = doc.createElement('script');
    script.src = url + (parser.search == '' ? '?' : '&') +
      fragment.jsonp + '=JSONPCallback';

    win.JSONPCallback = function(data) {
      // The callback function expects a string
      callback(JSON.stringify(data));
      win.JSONPCallback = null;
      // Clean up DOM by removing the JSONP script element
      var parent = script.parentNode;
      if (parent) {
        parent.removeChild(script);
      }
      script = null;
    }
    doc.getElementsByTagName('head')[0].appendChild(script);
  };

  var load = function(url, callback) {
    // We'll need something that can easily parse urls
    var url_parser = doc.createElement('a');
    url_parser.href = url;

    // If the resource is located at the same hostname, assume ajax
    if (url_parser.hostname == win.location.hostname) {
      load_xhr(url, callback);
    }
    // If the resource is located at a different hostname, assume jsonp
    else {
      load_jsonp(url, callback, url_parser);
    }
  };

  var render_template = function(element, html, json) {
    var context = extend(JSON.parse(json), context);
    element.innerHTML = fragment.render(html, context);
    evaluate(element, context);
  };

  var render_html = function(element, html) {
    var context = this.context;

    // If the innerHTML is nonempty: the context is interpreted as the
    // combination of the JSONified innerHTML and the existing context.
    // The JSONified innerHTML has a higher precedence over the existing context.
    if (element.innerHTML != "") {
      context = extend(JSON.parse(element.innerHTML), context);
    }

    element.innerHTML = fragment.render(html, context);
    evaluate(element, context);
  };

  var render_json = function(element, json) {
    var context = extend(JSON.parse(json), context);
    element.innerHTML = fragment.render(element.innerHTML, context);
    evaluate(element, this.context);
  };

  // Handle an individual fragment
  var render_fragment = function(fragment_type, element) {
    var html_url = element.getAttribute('data-'+fragment.html);
    var json_url = element.getAttribute('data-'+fragment.json);
    var media = element.getAttribute('data-fragment-media');

    // Don't load anything if the media query doesn't match
    if ( media && win.matchMedia && !win.matchMedia(media).matches ) return;

    // Update the num_fragments and deligate rendering to a submethod
    var resource_loaded = function(render_handler) {
      render_handler();
      update_num_fragments(-1);
    };

    update_num_fragments(1);

    if (fragment_type.html && fragment_type.json) {
      load(html_url, function(html) {
        load(json_url, function(json) {
          resource_loaded(render_template.bind(this, element, html, json));
        });
      });
    }
    else if (fragment_type.html) {
      load(html_url, function(html) {
        resource_loaded(render_html.bind(this, element, html));
      });
    }
    else if (fragment_type.json) {
      load(json_url, function(json) {
        resource_loaded(render_json.bind(this, element, json));
      });
    }
  };

  var evaluate = function(parent, context) {
    if (typeof parent === "undefined" || !("querySelectorAll" in parent)) {
      parent = doc;
    }

    // Scope contains information for recursively rendering fragments
    var scope = { parent: parent, context: context };
    var fragments = parent.querySelectorAll('[data-'+fragment.html+'][data-'+fragment.json+']');
    Array.prototype.forEach.call(fragments, render_fragment.bind(scope, { json: true, html: true }));

    var fragments = parent.querySelectorAll('[data-'+fragment.html+']:not([data-'+fragment.json+'])');
    Array.prototype.forEach.call(fragments, render_fragment.bind(scope, { json: false, html: true }));

    var fragments = parent.querySelectorAll('[data-'+fragment.json+']:not([data-'+fragment.html+'])');
    Array.prototype.forEach.call(fragments, render_fragment.bind(scope, { json: true, html: false }));
  };

  var extend = function(obj, defaults) {
    if (typeof obj === "undefined") obj = {};
    for (var element in defaults) {
      if (!obj.hasOwnProperty(element)) {
        obj[element] = defaults[element];
      }
    }
    return obj;
  };

  var num_fragments = 0;
  var max_fragments = 0;
  var update_num_fragments = function(diff) {
    num_fragments += diff;

    if (num_fragments > max_fragments) {
      max_fragments = num_fragments;
    }
    if (num_fragments == 0) {
      fragment.ready(max_fragments);
    }
  };

  // Extend fragment with defaults
  var fragment = extend(win.fragment, {
    html: 'fragment',
    json: 'fragment-json',
    jsonp: 'callback',
    manual: false,
    render: render,
    evaluate: evaluate,
    ready: function(){}
  });

  // Autoload
  if (!fragment.manual) {
    doc.addEventListener('DOMContentLoaded', function() {
      fragment.evaluate();
    });
  }

  // Just overwrite any existing "fragment" property
  win.fragment = fragment;

})(window, window.document);
