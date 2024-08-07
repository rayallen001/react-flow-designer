import { useRef } from 'react';
import { useKeyPress } from 'ahooks';
import cloneDeep from 'lodash/cloneDeep';
import { DEFAULT_DELTA } from '../../utils/constants';
import generateId from '../../utils/generateId';
import getBaseOffset from '../../utils/getBaseOffset';
import stringCopy from '../../utils/stringCopy';
import { ON_PASTE } from '../../utils/emitterType';

/**
 * 复制/粘贴 Hook，支持 Ctrl + C, Ctrl + V 快捷键，对外提供 copy 和 paste 方法
 */
export default function useCopyPaste({ ref, readOnly, emitter }) {
  const clipboardRef = useRef({ clipboardNodesData: [], clipboardEdgesData: {} });

  function isClipboardEmpty() {
    const { clipboardNodesData, clipboardEdgesData } = clipboardRef.current;
    return clipboardNodesData.length + clipboardEdgesData.length === 0;
  }

  // 将选中的节点和连线数据写入剪贴板
  function copy() {
    const { current } = ref;
    clipboardRef.current.clipboardNodesData = current.getSelectedNodesData();
    clipboardRef.current.clipboardEdgesData = current.getSelectedEdgesData();
  }

  /**
   * 用剪贴板中的数据创建连线和节点，同时选中创建的连线和节点
   * PS. 如果选中的连线没有同时选中两端的 source 或 target 节点，则连线不会被创建
   * @param {object} offset 粘贴时，目标节点放置在相对于画布的相对位置
   */
  function paste({ offsetX, offsetY } = {}) {
    const { current } = ref;
    const { clipboardNodesData, clipboardEdgesData } = clipboardRef.current;
    // 存储原节点 id 与复制后节点 id 的关系，以便复制连线时生成 sourceId 和 targetId
    const copiedNodeIdMap = {};
    // 用于生成节点名称的副本规则
    const existedNodesNameSet = current.getAllNodesNameSet();

    const baseOffset = getBaseOffset(clipboardNodesData);
    // 当没有传入 offsetX 或 offsetY 时（通常是按 ctrl + v 快捷键粘贴），使用默认的坐标偏移
    const deltaX = offsetX ? offsetX - baseOffset.x : DEFAULT_DELTA;
    const deltaY = offsetY ? offsetY - baseOffset.y : DEFAULT_DELTA;

    const pasteNodesData = clipboardNodesData.map(nodeData => {
      const copiedNodeId = generateId();
      copiedNodeIdMap[nodeData.id] = copiedNodeId;
      const copiedNodeName = stringCopy(nodeData.name, existedNodesNameSet);
      // 将刚复制的节点名称也加到集合中，主要是考虑到同时复制多个节点时，某个节点的名称恰好与另一个节点的副本名称相同
      existedNodesNameSet[copiedNodeName] = true;

      return {
        ...cloneDeep(nodeData),
        id: copiedNodeId,
        name: copiedNodeName,
        x: nodeData.x + deltaX,
        y: nodeData.y + deltaY,
      };
    });

    const pasteEdgesData = clipboardEdgesData.map(edgeData => {
      return {
        ...cloneDeep(edgeData),
        source: copiedNodeIdMap[edgeData.source],
        target: copiedNodeIdMap[edgeData.target],
      };
    });

    const [$nodes, $edges] = current.batchAppendToCanvas(pasteNodesData, pasteEdgesData);

    // 先清除已选中状态
    current.removeEdgesFromSelected(current.getSelectedEdges());
    current.removeNodesFromSelected(current.getSelectedNodes());
    // 将当前复制的置为选中状态
    $nodes.forEach(current.addNodeToSelected);
    $edges.forEach(current.addEdgeToSelected);

    // 粘贴完之后，再执行一次 copy，以便将刚复制的内容写到剪贴板
    copy();

    emitter.emit(ON_PASTE, { $nodes, $edges });
  }

  function handleCopy() {
    if (readOnly) {
      return;
    }
    copy();
  }

  function handlePaste() {
    if (readOnly) {
      return;
    }
    paste();
  }

  useKeyPress('ctrl.c', handleCopy);
  useKeyPress('ctrl.v', handlePaste);
  useKeyPress('meta.c', handleCopy);
  useKeyPress('meta.v', handlePaste);

  return {
    copy,
    paste,
    isClipboardEmpty,
  };
}
