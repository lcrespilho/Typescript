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

namespace Scroll {
  interface Mark {
    [key: string]: number;
  }
  interface Cache {
    [key: string]: boolean;
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

  declare let dataLayer: any[];

  /**
   * Dá o push de dataLayer com a distância de scroll
   * @param percent Distância de scroll atingida no momento.
   */
  function fireAnalyticsEvent(percent: string) {
    dataLayer.push({
      event: 'scrollTracking',
      scrollDistance: percent
    });
  }

  function isCSS1Compat(): boolean {
    return document.compatMode === 'CSS1Compat';
  }

  function scrollPlusYOffset(): number {
    let currScrollTop = window.pageYOffset ||
      (isCSS1Compat()
        ? document.documentElement.scrollTop
        : document.body.scrollTop);
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
   * Altura do documento
   */
  function docHeight(): number {
    let body = document.body;
    let html = document.documentElement;
    let height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    return height;
  }

  /**
   * Limita a frequência de execução de "func", executando-a
   * em intervalos de "wait" segundos.
   * @param func Função a ser executada
   * @param wait período de execução de func
   */
  function throttle(func: () => void, wait: number) {
    let _this: Document;
    let _arguments: IArguments;
    let timeout: number | null;
    let previous: number;
    let later = function () {
      previous = new Date().getTime();
      timeout = null;
      func.apply(_this, _arguments);
    };
    return function (this: Document) {
      _this = this;
      _arguments = arguments;
      let now: number = new Date().getTime();
      if (!previous) { previous = now; }
      let remaining = wait - (now - previous); // não tem problema ser negativo
      if (!timeout) { timeout = setTimeout(later, remaining); }
    };
  }

  (function (document: Document, window: EventTarget, percentages: number[]): void {
    // dependências de navegador
    if (!document.querySelector || !document.body.getBoundingClientRect) {
      // google_tag_manager[{{Container ID}}].onHtmlFailure({{HTML ID}}); // TODO: ativar essa linha em produção
      throw new Error('browser não suporta scroll capturing...');
    }

    /**
     * cache de captura para não enviar 2x uma mesma porcentagem
     */
    let cache: Cache = {};

    /**
     * Retorna um objeto onde as chaves são as porcentagens e os valores correspondentes são píxeis.
     * @param _docHeight Altura do documento
     */
    function getMarks(_docHeight: number): Mark {
      let marks: Mark = {};
      for (let i = 0; i < percentages.length; i++) {
        let point = percentages[i];
        let height = _docHeight * (point / 100);
        let mark = point + '%';
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
      let marks = getMarks(docHeight() - 5); // subtrai 5 por tolerância
      let curr = scrollPlusYOffset();
      for (let percent in marks) {
        if (curr > marks[percent] && !cache[percent]) {
          cache[percent] = true;
          fireAnalyticsEvent(percent);
        }
      }
    }

    if (docHeight() - scrollPlusYOffset() <= 5) { // usando monitor 4K, por exemplo
      main();
    } else {
      addEvent(window, 'scroll', throttle(main, 500)); // injeta listener
    }
    // google_tag_manager[{{Container ID}}].onHtmlSuccess({{HTML ID}}); // TODO: ativar essa linha em produção
  })(document, window, [25, 50, 75, 100]);
}

/**
 * TODO
 * - procurar pela string 'TODO' no código e ver o que deve ser feito em cada caso
 * - no GTM, transformar o código todo numa iife e usar try..catch
 * - no GTM, configurar a tag para disparar no DOM Ready! Ao executar a tag deve saber
 * o tamanho vertical do documento.
 */
