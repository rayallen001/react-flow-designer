/**
 * 根据 jsPlumb 的 connection 对象构造连线输入框浮层的 id
 * 使用场景：创建连线上的 input 输入框，输入完成后，要根据此 ID 清除连线上的输入框
 * @param {object} conn jsPlumb 的 connection 对象
 */
export default function getConnectionInputOverlayId(conn) {
  // JsPlumb 会为每个连线自动生成 id，格式为：con_9
  return `${conn.id}:inputOverlay`;
}
