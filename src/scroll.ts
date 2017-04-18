declare let dataLayer: any[];

/**
 * Retorna o array [ n, 2n, 3n, ..., ⌈total/n⌉n ], i.e., discretiza o
 * intervalo [n .. total] em ⌈total/n⌉ números igualmente espaçados.
 * Exemplo: (25, 93) => [25, 50, 75, 100]
 * @param n passo
 * @param total limite
 */
function every_(n: number, total: number): number[] {
  let arr: number[] = [];
  for (let i = 1; i <= Math.ceil(total / n); i++) {
    arr.push(i * n);
  }
  return arr;
}

/**
 * Dá o push de dataLayer com a distância de scroll
 * @param distance Distância de scroll atingida no momento.
 */
function fireAnalyticsEvent(distance: number) {
  dataLayer.push({
    event: 'scrollTracking',
    attributes: {
      distance: distance
    }
  });
}

function isCSS1Compat(): boolean {
  return document.compatMode === 'CSS1Compat';
}

/**
 * Posição do 'bottom' da página em relação ao 'top',
 * contando scroll + altura do viewport
 */
function currentPosition(): number {
  let currScrollTop = window.pageYOffset || (isCSS1Compat()) ?
    document.documentElement.scrollTop :
    document.body.scrollTop;
  return currScrollTop + viewportHeight();
}

/**
 * Altura do viewport
 */
function viewportHeight(): number {
  let elem: HTMLElement = isCSS1Compat() ?
    document.documentElement :
    document.body;
  return elem.clientHeight;
}

/**
 * Altura do documento (body ou html) - 5.
 * @param _bottom 
 * @param _top 
 */
function docHeight(_bottom: number, _top: number): number {
  var body = document.body;
  var html = document.documentElement;
  var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

  if (_top) { height -= _top; }

  // TODO: problema aqui! Se _top==undefined, o
  // retorno é undefined também.
  if (_bottom) { height = _bottom - _top; }
  return height - 5;
}

function isNumber(n: any): n is number {
  return typeof n === 'number';
}


function isString(s: any): s is string {
  return typeof s === 'string';
}

function isElementNode(n: any): n is Element {
  return n instanceof Element && n.nodeType === Node.ELEMENT_NODE;
}

function isHTMLElement(elem: any): elem is HTMLElement {
  return elem instanceof HTMLElement;
}

/**
 * Topo do elemento passado como parâmetro, em relação
 * ao topo do body (independente do scroll da página)
 * @param border Pode ser um número, uma string numérica ou um Node.
 */
function parseBorder_(border: number | Element | string) {
  if (typeof border === 'number' || Number(border)) {
    return Number(border);
  }
  try {
    // se o parâmetro passado for ELEMENT_NODE ou uma query css
    var el = isElementNode(border) ? border : document.querySelector(border);
    var docTop = document.body.getBoundingClientRect().top;
    var _elTop = el && Math.floor(el.getBoundingClientRect().top - docTop);
    return _elTop;
  } catch (e) {
    return undefined;
  }
}

interface EventlistenerOptions {
  /**
   * Indicates that events of this type will be dispatched to the registered
   * listener before being dispatched to any EventTarget beneath it in the DOM tree
   */
  capture?: boolean;
  /**
   * Indicates that the listener should be invoked at most once after being added.
   * If it is true, the listener would be removed automatically when it is invoked
   */
  once?: boolean;
  /**
   * Indicating that the listener will never call preventDefault(). If it does, the
   * user agent should ignore it and generate a console warning
   */
  passive?: boolean;
}

interface HTMLElement {
  /**
   * Register the specified listener on the EventTarget it's called on. The event target
   * may be an Element in a document, the Document itself, a Window, or any other object
   * that supports events (such as XMLHttpRequest).
   */
  addEventListener(type: string, listener?: EventListenerOrEventListenerObject, options?: EventlistenerOptions): void;
  /**
   * IE8 compatibilities
   */
  attachEvent(eventNameWithOn: string, callback: EventListener): void;
  [key: string]: any;
}

interface Window extends HTMLElement {
  addEventListener(type: string, listener?: EventListenerOrEventListenerObject, options?: EventlistenerOptions): void;
  attachEvent(eventNameWithOn: string, callback: EventListener): void;
  [key: string]: any;
}

/**
 * Cross-browser compliant event listener.
 * @param target Elemento alvo. É onde o listener de evento será inserido.
 * @param evt Evento para o qual o listener será adicionado.
 * @param fn Função handler/listener que será executada na ocorrência do evento.
 */
function addEvent(target: HTMLElement | Window, evt: string, fn: EventListener): void {
  if (target.addEventListener) { // new browsers
    try {
      target.addEventListener(evt, fn, {
        passive: true
      }); // chrome 51+
    } catch (e) {
      console.error('addEventListener error. Don\'t worry... falling back to basic version of addEventListener. Error message:', e);
      target.addEventListener(evt, fn);
    }
  } else if (target.attachEvent) {
    target.attachEvent('on' + evt, function (evt_) {
      // call the event to ensure uniform 'this' handling; pass it event
      fn.call(target, evt_);
    });
  } else if (!target['on' + evt]) {
    target['on' + evt] = function handler(evt_: Event) {
      // call the event to ensure uniform 'this' handling
      fn.call(target, evt_);
    };
  }
}

// function getMarks(_docHeight: number, _offset: number) {
// }

// function addMarks_(marks, points, symbol, _docHeight, _offset) {
// }

// throttle function borrowed from http://underscorejs.org  v1.5.2
// function throttle(func, wait) {
// }



interface Window {
  [propName: string]: any;
}

function checkDepth() {

}

/**
 * Função principal. Executá-la para escutar eventos de scroll
 * @param document document object
 * @param window Window object
 * @param config Objeto contendo diversas configurações de funcionamento do scritp
 */
function run(document: Document, window: Window, config: any): void {
  if (!document.querySelector || !document.body.getBoundingClientRect) {
    // google_tag_manager[{{Container ID}}].onHtmlFailure({{HTML ID}}); // TODO: ativar essa linha
    return;
  }
  // get dataLayer ready
  var dataLayerName: string = config.dataLayerName || 'dataLayer';
  var dataLayer = window[dataLayerName] || (window[dataLayerName] = []);
  var cache = {};

  config.distances = config.distances || {}; // initialize distances, for later

  checkDepth();
  // addEvent(window, 'scroll', throttle(checkDepth, 500));
}

run(document, window, {
  datalayerName: undefined, // false if you just use the default dataLayer variable, otherwise enter it here
  distances: {
    percentages: { // configure percentages of page you'd like to see if users scroll past
      each: [10, 90],
      every: 25
    },
    pixels: { // configure for pixel measurements of page you'd like to see if users scroll past
      each: [],
      every: null
    }
  },
  top: undefined, // accepts a number, DOM element, or query selector to determine the top of the scrolling area
  bottom: undefined // accepts a number, DOM element, or query selector to determine the bottom of the scrolling area
});


interface Config {
  datalayerName: string | boolean;

}

