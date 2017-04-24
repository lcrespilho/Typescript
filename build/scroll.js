/**
 * Dá o push de dataLayer com a distância de scroll
 * @param percent Distância de scroll atingida no momento.
 */
function fireAnalyticsEvent(percent) {
    dataLayer.push({
        event: 'scrollTracking',
        attributes: {
            distance: percent
        }
    });
}
function isCSS1Compat() {
    return document.compatMode === 'CSS1Compat';
}
/**
 * Posição do 'bottom' da página em relação ao 'top',
 * contando scroll + altura do viewport
 */
function currentPosition() {
    var currScrollTop = window.pageYOffset || (isCSS1Compat()) ?
        document.documentElement.scrollTop :
        document.body.scrollTop;
    return currScrollTop + viewportHeight();
}
/**
 * Altura do viewport
 */
function viewportHeight() {
    var elem = isCSS1Compat() ?
        document.documentElement :
        document.body;
    return elem.clientHeight;
}
/**
 * Altura do viewport menos 5 unidades
 */
function docHeight() {
    var body = document.body;
    var html = document.documentElement;
    var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    return height - 5;
}
function isElementNode(n) {
    return n instanceof Element && n.nodeType === Node.ELEMENT_NODE;
}
var config = {
    dataLayerName: 'dataLayer',
    percentages: [25, 75, 100]
};
/**
 * TODO: corrigir/checar
 * throttle function borrowed from http://underscorejs.org  v1.5.2
 * @param func
 * @param wait
 */
function throttle(func, wait) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    var later = function () {
        previous = new Date;
        timeout = null;
        result = func.apply(context, args);
    };
    return function () {
        var now = new Date;
        if (!previous)
            previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
            clearTimeout(timeout);
            timeout = null;
            previous = now;
            result = func.apply(context, args);
        }
        else if (!timeout) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
}
(function (document, window, config) {
    // dependências de navegador
    if (!document.querySelector || !document.body.getBoundingClientRect) {
        // google_tag_manager[{{Container ID}}].onHtmlFailure({{HTML ID}}); // TODO: ativar essa linha
        throw new Error('browser não suporta scroll capturing...');
    }
    var dataLayer = window[config.dataLayerName] || (window[config.dataLayerName] = []);
    /**
     * cache de captura para não enviar 2x uma mesma porcentagem
     */
    var cache = {};
    /**
     * Retorna um objeto onde as chaves são as porcentagens e os valores correspondentes são píxeis.
     * @param _docHeight Altura do documento
     */
    function getMarks(_docHeight) {
        var marks = {};
        for (var i = 0; i < config.percentages.length; i++) {
            var point = config.percentages[i];
            var height = _docHeight * (point / 100);
            var mark = point + '%';
            if (height <= _docHeight) {
                marks[mark] = height;
            }
        }
        return marks;
    }
    /**
     * TODO: entender/corrigir/checar
     */
    function checkDepth() {
        var height = docHeight();
        var marks = getMarks(height);
        var _curr = currentPosition();
        debugger;
        for (var percent in marks) {
            if (_curr > marks[percent] && !cache[percent]) {
                cache[percent] = true;
                fireAnalyticsEvent(percent);
            }
        }
    }
    checkDepth(); // talvez deletar essa linha depois
    addEvent(window, 'scroll', throttle(checkDepth, 500));
})(document, window, config);
//# sourceMappingURL=scroll.js.map