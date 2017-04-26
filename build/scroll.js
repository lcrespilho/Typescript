/**
 * Cross-browser compliant event listener.
 * @param target Elemento alvo. É onde o listener de evento será inserido.
 * @param evt Evento para o qual o listener será adicionado.
 * @param fn Função handler/listener que será executada na ocorrência do evento.
 */
function addEvent(target, evt, fn) {
    if (target.addEventListener) {
        try {
            target.addEventListener(evt, fn, {
                passive: true
            }); // chrome 51+
        }
        catch (e) {
            console.info('addEventListener info: falling back to basic version of addEventListener. Info message:', e);
            target.addEventListener(evt, fn);
        }
    }
    else if (target.attachEvent) {
        target.attachEvent('on' + evt, function (evt_) {
            // 'call' the event to ensure uniform 'this' handling
            fn.call(target, evt_);
        });
    }
    else if (!target['on' + evt]) {
        target['on' + evt] = function handler(evt_) {
            // 'call' the event to ensure uniform 'this' handling
            fn.call(target, evt_);
        };
    }
}
/**
 * Dá o push de dataLayer com a distância de scroll
 * @param percent Distância de scroll atingida no momento.
 */
function fireAnalyticsEvent(percent) {
    console.log('Atingiu ' + percent);
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
 * Posição do 'bottom' (variável) da página em relação ao 'top' (fixo).
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
    percentages: [25, 50, 75, 100]
};
/**
 * Limita a frequência de execução de "func", executando-a
 * em intervalos de "wait" segundos.
 * @param func Função a ser executada
 * @param wait período de execução de func
 */
function throttle(func, wait) {
    var _this;
    var _arguments;
    var timeout;
    var previous;
    var later = function () {
        previous = new Date().getTime();
        timeout = null;
        func.apply(_this, _arguments);
    };
    return function () {
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
        for (var percent in marks) {
            if (_curr > marks[percent] && !cache[percent]) {
                cache[percent] = true;
                fireAnalyticsEvent(percent);
            }
        }
    }
    // checkDepth(); // talvez deletar essa linha depois
    addEvent(window, 'scroll', throttle(checkDepth, 500));
})(document, window, config);
//# sourceMappingURL=scroll.js.map