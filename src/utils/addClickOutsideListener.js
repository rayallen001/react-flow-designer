/**
 * 在指定 element 之外点击。注意：调用后要记得在 element 销毁前 removeClickoutsideListener
 * @param {object} element 指定的 DOM 元素
 * @param {function} eventHandler 在外部点击时的事件处理回调函数
 */
export default function addClickOutsideListener(element, eventHandler) {
  function listener(e) {
    if (!element.contains(e.target)) {
      eventHandler(e);
    }
  }
  window.addEventListener('click', listener);

  return function removeClickoutsideListener() {
    window.removeEventListener('click', listener);
  };
}
