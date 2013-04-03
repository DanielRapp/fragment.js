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
      var parent;
      script.src = url;
      JSONPCallback = function(d) {
        callback(JSON.stringify(d));
        JSONPCallback = null;
        parent = script.parentNode;
        if(parent) {
          parent.removeChild(script);
        }
        script = null;
      };
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  };
  
  var status = false; 
  var stack = [];
  
  function ready(fn){
    if(typeof fn != 'function' || Object.prototype.toString.call(fn) != '[object Function]') {
      return;
    }
    if(status) {
      setTimeout(fn, 0);
    } else {
      stack.push(fn);
    }
  }
  
  function updateStatus(){ 
    if(!/in/.test(document.readyState) && document.body) {
      status = true;
      stack.forEach(function(fn){ 
        setTimeout(fn, 0); 
      })
      stack = [];
    }
    if(!status) {
      setTimeout(updateStatus, 10);
    }
  }
  
  setTimeout(updateStatus, 10);
  
  var each = [].forEach
  
  function evaluate(scope){
    if(!scope || !scope.querySelectorAll) {
      scope = document;
    }
    var fragments = scope.querySelectorAll('[data-'+fragment.html+'][data-'+fragment.json+']');
    each.call(fragments, function(element) {
      var htmlUrl = element.getAttribute('data-fragment');
      var jsonUrl = element.getAttribute('data-fragment-json');
  
      load(htmlUrl, function(html) {
        load(jsonUrl, function(json) {
          element.innerHTML = window.fragment.render(html, JSON.parse(json));
        });
      });
    });
  
    fragments = scope.querySelectorAll('[data-'+fragment.html+']:not([data-'+fragment.json+'])');
    each.call(fragments, function(element) {
      var htmlUrl = element.getAttribute('data-fragment');
  
      load(htmlUrl, function(html) {
        if (element.innerHTML == '') {
          element.innerHTML = html;
        }
        else {
          element.innerHTML = window.fragment.render(html, JSON.parse(element.innerHTML));
        }
      });
    });
  
    fragments = scope.querySelectorAll('[data-'+fragment.json+']:not([data-'+fragment.html+'])');
    each.call(fragments, function(element) {
      var jsonUrl = element.getAttribute('data-fragment-json');
  
      load(jsonUrl, function(json) {
        element.innerHTML = window.fragment.render(element.innerHTML, JSON.parse(json));
      });
    });
  }
  
  ready(evaluate);
  
  fragment.evaluate = function(){
    ready(evaluate);
  }

})(fragment);
