/**
 * 根据连线的 dom 元素获取 jsplumb 的 connection 对象
 * 由于 jsplumb connection 的 click、dblclick、contextmenu 事件的回调函数中，第一个参数拿到的对象可能不是 connection 本身
 * （可能是 JsPlumb 的一个 bug），而是其下的 Overlay、Label 等，故需要封装一个方法拿到 connection 本身
 * @param {Object} connChild connection 的 click、dblclick、contextmenu 等事件的回调函数的第一个参数
 */
export default function getConnectionByChild(connChild) {
  // 经过调试发现：如果 connChild 不是 connection 本身，则 connChild.component 就是 connection 本身
  return connChild.component ? connChild.component : connChild;
}
