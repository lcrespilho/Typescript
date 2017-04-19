declare let dataLayer: any[];

/**
 * Dá o push de dataLayer com a distância de scroll
 * @param percent Distância de scroll atingida no momento.
 */
function fireAnalyticsEvent(percent: string) {
  dataLayer.push({
    event: 'scrollTracking',
    attributes: {
      distance: percent
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
 * Altura do viewport menos 5 unidades
 */
function docHeight(): number {
  let body = document.body;
  let html = document.documentElement;
  let height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
  return height - 5;
}

function isElementNode(n: any): n is Element {
  return n instanceof Element && n.nodeType === Node.ELEMENT_NODE;
}

/**
 * Cross-browser compliant event listener.
 * @param target Elemento alvo. É onde o listener de evento será inserido.
 * @param evt Evento para o qual o listener será adicionado.
 * @param fn Função handler/listener que será executada na ocorrência do evento.
 */
function addEvent(target: EventTarget, evt: string, fn: EventListener): void {
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

namespace Scroll {
  export interface Mark {
    [key: string]: number;
  }
  export interface Cache {
    [key: string]: boolean;
  }
  export interface Config {
    /**
     * undefined if you just use the default dataLayer variable, otherwise enter it here
     */
    dataLayerName: string;
    /**
     * configure percentages of page you'd like to see if users scroll past
     */
    percentages: number[];
  }
  export interface EventlistenerOptions {
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
}

interface EventTarget {
  /**
   * Register the specified listener on the EventTarget it's called on. The event target
   * may be an Element in a document, the Document itself, a Window, or any other object
   * that supports events (such as XMLHttpRequest).
   */
  addEventListener(type: string, listener?: EventListenerOrEventListenerObject, options?: Scroll.EventlistenerOptions): void;
  /**
   * IE8 compatibilities
   */
  attachEvent(eventNameWithOn: string, callback: EventListener): void;
  [key: string]: any;
}

let config: Scroll.Config = {
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
  let context, args, result;
  let timeout = null;
  let previous = 0;
  let later = function () {
    previous = new Date;
    timeout = null;
    result = func.apply(context, args);
  };
  return function () {
    let now = new Date;
    if (!previous) previous = now;
    let remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(context, args);
    } else if (!timeout) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}

(function (document: Document, window: EventTarget, config: Scroll.Config): void {
  // dependências de navegador
  if (!document.querySelector || !document.body.getBoundingClientRect) {
    // google_tag_manager[{{Container ID}}].onHtmlFailure({{HTML ID}}); // TODO: ativar essa linha
    throw new Error('browser não suporta scroll capturing...');
  }
  let dataLayer = window[config.dataLayerName] || (window[config.dataLayerName] = []);
  /**
   * cache de captura para não enviar 2x uma mesma porcentagem
   */
  let cache: Scroll.Cache = {};

  /**
   * Retorna um objeto onde as chaves são as porcentagens e os valores correspondentes são píxeis.
   * @param _docHeight Altura do documento
   */
  function getMarks(_docHeight: number): Scroll.Mark {
    let marks: Scroll.Mark = {};
    for (let i = 0; i < config.percentages.length; i++) {
      let point = config.percentages[i];
      let height = _docHeight * (point / 100);
      let mark = point + '%';
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
    let height = docHeight();
    let marks = getMarks(height);
    let _curr = currentPosition();
    debugger;
    for (let percent in marks) {
      if (_curr > marks[percent] && !cache[percent]) {
        cache[percent] = true;
        fireAnalyticsEvent(percent);
      }
    }
  }
  checkDepth(); // talvez deletar essa linha depois

  addEvent(window, 'scroll', throttle(checkDepth, 500));
})(document, window, config);
