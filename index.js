/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

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
    window.dataLayer.push({
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
 * Altura do documento
 */
function docHeight() {
    var body = document.body;
    var html = document.documentElement;
    var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    return height;
}
function isElementNode(n) {
    return n instanceof Element && n.nodeType === Node.ELEMENT_NODE;
}
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
(function (document, window, percentages) {
    // dependências de navegador
    if (!document.querySelector || !document.body.getBoundingClientRect) {
        throw new Error('browser não suporta scroll capturing...');
    }
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
    /**
     * Função principal
     */
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
    }
    else {
        addEvent(window, 'scroll', throttle(main, 500)); // injeta listener
    }
})(document, window, [25, 50, 75, 100]);
/**
 * TODO
 * - procurar pela string 'TODO' no código e ver o que deve ser feito em cada caso
 * - no GTM, transformar o código todo numa iife e usar try..catch
 * - no GTM, configurar a tag para disparar no DOM Ready! Ao executar, a tag deve saber
 * o tamanho vertical do documento.
 */


/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map