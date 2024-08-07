/**
 * 从节点的 DOM 元素中获取节点数据
 * @param {element} $node 节点的 DOM 元素
 * @returns {object} 节点数据，其中包含了最新的节点 x, y 坐标
 */
export default function getNodeData($node) {
  if (!$node) {
    return null;
  }

  const { data, style } = $node;

  return {
    ...data,
    x: parseFloat(style.left),
    y: parseFloat(style.top),
  };
}
