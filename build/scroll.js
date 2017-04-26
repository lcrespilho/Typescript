document.addEventListener('scroll', throttle(checkDepth, 100), {
  capture: false,
  once: false,
  passive: false
});


function checkDepth() {
  let now = new Date().getTime();
  console.log(now - window.teste);
  window.teste = now;
  // console.log(this);
}

function throttle(func, wait) {
  window.teste = new Date().getTime();
  let _this, _arguments, timeout, previous;
  let later = function() {
    previous = new Date().getTime();
    timeout = null;
    func.apply(_this, _arguments);
  };
  return function() {
    _this = this;
    _arguments = arguments;
    let now = new Date().getTime();
    if (!previous) previous = now;
    let remaining = wait - (now - previous); // não tem problema ser negativo
    if (!timeout) timeout = setTimeout(later, remaining);
  };
}
