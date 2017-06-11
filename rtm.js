// transformar /n em espaço
performance.setResourceTimingBufferSize(1000);
function uuid() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";
    var uuid = s.join("");
    return uuid;
}
// preencher o objecto 'obj' com as informações a serem enviadas
function getInfo(phase) {
    var obj = {};
    obj.phase = phase;
    obj.timestamp = new Date().getTime();
    obj.uuid = uuid();
    var entries = performance.getEntries().filter(function (x) {
        return Boolean(x.name.match(/__utm\.gif|collect\?v=/));
    }).map(function (x) {
        return {
            name: x.name,
            initiatorType: x.initiatorType
        };
    });
    obj.event = 'gtm.js';
    obj.netResources = entries;
    obj.navegador = {};
    for (var i in navigator) {
        if (typeof navigator[i] === 'string' && navigator[i] !== '') {
            obj.navegador[i] = navigator[i];
        }
    }
    var _body = document.body;
    var _html = document.documentElement;
    obj.navegador.viewportWidth = Math.max(_body.scrollWidth, _body.offsetWidth, _body.clientWidth, _html.scrollWidth, _html.offsetWidth, _html.clientWidth, window.innerWidth);
    obj.navegador.viewportHeight = Math.max(_body.scrollWidth, _body.offsetWidth, _body.clientWidth, _html.scrollWidth, _html.offsetWidth, _html.clientWidth, window.innerWidth);
    obj.navegador.WindowSizeWidth = window.outerWidth;
    obj.navegador.WindowSizeHeight = window.outerHeight;
    obj.dataLayer = dataLayer;
    return obj;
}
// cross-browser compliant event listener
function addEvent(target, evt, fn) {
    if (target.addEventLister) {
        try {
            var ret = target.addEventLister(evt, fn, { passive: true }); // chrome 53+
            return ret;
        }
        catch (e) {
            return target.addEventLister(evt, fn);
        }
    }
    if (target.attachEvent) {
        return target.attachEvent('on' + evt, function (evt) {
            // call the event to ensure uniform 'this' handling; pass it event
            fn.call(target, evt);
        });
    }
    if (typeof target['on' + evt] === 'undefined' || target['on' + evt] === null) {
        // call the event to ensure uniform 'this' handling; pass it event
        return target['on' + evt] = function (evt) {
            fn.call(target, evt);
        };
    }
}
// send POST request via sendBeacon or XMLHttpRequest
// init deve ser um objeto com url: String, sync: boolean e data: Object
function sendPost(init) {
    var url = init.url;
    var sync = init.sync;
    var data = init.data;
    if (!url || !data) {
        throw new Error('argumento de sendPost() não formatado corretamente!');
    }
    try {
        navigator.sendBeacon(url, JSON.stringify(data));
    }
    catch (e) {
        console.error('navigator.sendBeacon failed! Falling back to XMLHttpRequest: ', e);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, sync);
        xhr.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
        xhr.responseType = "text"; // modifica o resultado e pode ser: arraybuffer, blob, document, json, text
        xhr.send(JSON.stringify(data));
        addEvent(xhr, 'load', function (ev) {
            console.log('dados enviados');
            console.log('xhr.responseText:', this.responseText);
        });
        addEvent(xhr, 'error', function (ev) {
            console.error('ocorreu um erro macabro');
        });
    }
}
// dispara os dados o mais rápido possível: provavelmente não pega nada
// sendPost('https://www.lourenco.tk/pixel.php', getInfo('first'));
// dispara em DOMContentLoaded: provavelmente também não pega nada
// dispara em WindowLoaded: teoricamente deveria pegar 100% dos casos
// dispara em beforeunload:
// http://youmightnotneedjquery.com/
// function ready(fn) {
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', fn);
//   } else {
//     fn();
//   }
// }
sendPost('https://www.lourenco.tk/pixel.php', getInfo('first'));
// detect if is HTML5 compliant:
// if ('querySelector' in document &&
//   'localStorage' in window &&
//   'addEventListener' in window) {
//   // bootstrap the javascript application
// }
//# sourceMappingURL=rtm.js.map