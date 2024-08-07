/**
 * 获取多个节点的原点。场景：当选中多个节点时，计算这些节点的 minX 和 minY
 * @param {array} nodes
 */
export default function getBaseOffset(nodes = []) {
  let minX = Infinity;
  let minY = Infinity;

  nodes.forEach(({ x, y }) => {
    if (x < minX) {
      minX = x;
    }

    if (y < minY) {
      minY = y;
    }
  });

  return { x: minX, y: minY };
}
