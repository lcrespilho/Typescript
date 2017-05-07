function libCookie() {
    /**
     * Retorna o valor do cookie, ou null caso ele não exista.
     * @param {string} key Chave do cookie.
     */
    function getItem(key) {
        if (!key) {
            return null;
        }
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[.+*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    }
    /**
     * Cria ou atualiza um cookie.
     * @param {string} key Chave do cookie.
     * @param {string} value Valor do cookie.
     * @param {(number|string|Date)} [end] Tempo de duração do cookie. Pode ser um número em ms, uma string vinda de Date.toUTCString(), um objeto Date, ou 'undefined' (para cookie de sessão).
     * @param {string} [path] Path do cookie. 'undefined' implica subcaminho atual da URL.
     * @param {string} [domain] Domain do cookie. 'undefined' implica hostname completo, incluindo www se exisitr.
     * @param {boolean} [secure] Only transmit cookie over https.
     */
    function setItem(key, value, end, path, domain, secure) {
        if (path === void 0) { path = ''; }
        if (domain === void 0) { domain = ''; }
        if (secure === void 0) { secure = false; }
        if (!key || /^(?:expires|max-age|path|domain|secure)$|=/i.test(key) || /\=/.test(value)) {
            return false;
        }
        var expires = "";
        if (end) {
            switch (end.constructor) {
                case Number:
                    expires = end === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; expires=" + new Date(new Date().getTime() + end).toUTCString();
                    break;
                case String:
                    expires = "; expires=" + end;
                    break;
                case Date:
                    expires = "; expires=" + end.toUTCString();
                    break;
            }
        }
        document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) + expires + "; domain=" + domain + "; path=" + path + (secure ? "; secure" : "");
        return hasItem(key);
    }
    /**
     * Remove o cookie especificado por key/path/domain. Na remoção, o browser só remove se o path estiver perfeitamente igual ao do cookie.
     * @param {string} key Chave do cookie.
     * @param {string} [path] Path do cookie. Se undefined ou '', tenta remover do subcaminho atual da URL.
     * @param {string} [domain] Domain do cookie. Se não especificado, assume o hostname da página.
     */
    function removeItem(key, path, domain) {
        if (path === void 0) { path = ''; }
        if (domain === void 0) { domain = ''; }
        if (!this.hasItem(key)) {
            return false;
        }
        document.cookie = encodeURIComponent(key) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + "; domain=" + domain + "; path=" + path;
        return hasItem(key);
    }
    /**
     * Retorna true se o cookie indicado por 'key' estiver presente.
     * @param {string} key Chave do cookie.
     */
    function hasItem(key) {
        if (!key) {
            return false;
        }
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(key).replace(/[.+*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    }
    /**
     * Retorna un array contendo as chaves de todos os cookies acessíveis.
     */
    function keys() {
        var _keys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var i = 0, len = _keys.length; i < len; i++) {
            _keys[i] = decodeURIComponent(_keys[i]);
        }
        return _keys;
    }
    /**
     * Retorna 'true' se o browser permitir cookies, 'false' caso contrário.
     */
    function hasCookieEnabled() {
        this.setItem('RaccoonTestCookie', 'RaccoonTestCookie', 2000);
        return this.getItem('RaccoonTestCookie') === 'RaccoonTestCookie';
    }
    return {
        getItem: getItem,
        setItem: setItem,
        removeItem: removeItem,
        hasItem: hasItem,
        keys: keys,
        hasCookieEnabled: hasCookieEnabled
    };
}
/**
 * TODO
 * No GTM, apenas remover o nome da função libCookie.
 */
//# sourceMappingURL=libCookie.js.map