/// <reference path="utils.ts" />

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
 * Posição do 'bottom' (variável) da página em relação ao 'top' (fixo).
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

let config: Scroll.Config = {
  dataLayerName: 'dataLayer',
  percentages: [25, 75, 100]
};

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
