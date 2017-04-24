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
            console.error('addEventListener error. Don\'t worry... falling back to basic version of addEventListener. Error message:', e);
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
//# sourceMappingURL=utils.js.map