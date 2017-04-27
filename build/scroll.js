(function() {
  try {
    function addEvent(target, evt, fn) {
      if (target.addEventListener) {
        try {
          target.addEventListener(evt, fn, {
            passive: true
          }); // chrome 51+
        } catch (e) {
          console.info('addEventListener info: falling back to basic version of addEventListener. Info message:', e);
          target.addEventListener(evt, fn);
        }
      } else if (target.attachEvent) {
        target.attachEvent('on' + evt, function(evt_) {
          // 'call' the event to ensure uniform 'this' handling
          fn.call(target, evt_);
        });
      } else if (!target['on' + evt]) {
        target['on' + evt] = function handler(evt_) {
          // 'call' the event to ensure uniform 'this' handling
          fn.call(target, evt_);
        };
      }
    }

    function fireAnalyticsEvent(percent) {
      dataLayer.push({
        event: 'scrollTracking',
        scrollDistance: percent
      });
    }

    function isCSS1Compat() {
      return document.compatMode === 'CSS1Compat';
    }

    function scrollPlusYOffset() {
      var currScrollTop = window.pageYOffset || (isCSS1Compat()) ?
        document.documentElement.scrollTop :
        document.body.scrollTop;
      return currScrollTop + viewportHeight();
    }

    function viewportHeight() {
      var elem = isCSS1Compat() ?
        document.documentElement :
        document.body;
      return elem.clientHeight;
    }

    function docHeight() {
      var body = document.body;
      var html = document.documentElement;
      var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
      return height;
    }

    function isElementNode(n) {
      return n instanceof Element && n.nodeType === Node.ELEMENT_NODE;
    }

    function throttle(func, wait) {
      var _this;
      var _arguments;
      var timeout;
      var previous;
      var later = function() {
        previous = new Date().getTime();
        timeout = null;
        func.apply(_this, _arguments);
      };
      return function() {
        _this = this;
        _arguments = arguments;
        var now = new Date().getTime();
        if (!previous) {
          previous = now;
        }
        var remaining = wait - (now - previous); // não tem problema ser negativo
        if (!timeout) {
          timeout = setTimeout(later, remaining);
        }
      };
    }
    (function(document, window, percentages) {
      // dependências de navegador
      if (!document.querySelector || !document.body.getBoundingClientRect) {
        // google_tag_manager[{{Container ID}}].onHtmlFailure({{HTML ID}});
        throw new Error('browser não suporta scroll capturing...');
      }

      var cache = {};

      function getMarks(_docHeight) {
        var marks = {};
        for (var i = 0; i < percentages.length; i++) {
          var point = percentages[i];
          var height = _docHeight * (point / 100);
          var mark = point + '%';
          if (height <= _docHeight) {
            marks[mark] = height;
          }
        }
        return marks;
      }

      function main() {
        var marks = getMarks(docHeight() - 5); // subtrai 5 por tolerância
        var curr = scrollPlusYOffset();
        for (var percent in marks) {
          if (curr > marks[percent] && !cache[percent]) {
            cache[percent] = true;
            fireAnalyticsEvent(percent);
          }
        }
      }
      if (docHeight() - scrollPlusYOffset() <= 5) {
        main();
      } else {
        addEvent(window, 'scroll', throttle(main, 500)); // injeta listener
      }
      // google_tag_manager[{{Container ID}}].onHtmlSuccess({{HTML ID}});
    })(document, window, [25, 50, 75, 100]);
  } catch(e) {
    console.error('Scroll:', e);
    // google_tag_manager[{{Container ID}}].onHtmlFailure({{HTML ID}});
  }
})();
