
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
      console.info('addEventListener info: falling back to basic version of addEventListener. Info message:', e);
      target.addEventListener(evt, fn);
    }
  } else if (target.attachEvent) {
    target.attachEvent('on' + evt, function (evt_) {
      // 'call' the event to ensure uniform 'this' handling
      fn.call(target, evt_);
    });
  } else if (!target['on' + evt]) {
    target['on' + evt] = function handler(evt_: Event) {
      // 'call' the event to ensure uniform 'this' handling
      fn.call(target, evt_);
    };
  }
}
