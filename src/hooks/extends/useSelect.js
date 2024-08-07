import without from 'lodash/without';
import {
  ON_CLICK,
  ON_CONTEXT_MENU,
  ON_EDGE_CLICK,
  ON_EDGE_CONTEXT_MENU,
  ON_EDGE_DRAG,
  ON_NODE_CLICK,
  ON_NODE_CONTEXT_MENU,
  ON_NODE_DRAG_START,
  ON_NODE_TYPE_INSTANTIATE,
} from '../../utils/emitterType';

export default function useSelect({ ref, emitter }) {
  /**
   * 设置节点为选中状态
   * @param {element} el 节点 DOM 对象
   * @param {boolean} isAppend true 表示追加选中; 否则表示要将已选中的置为未选中状态
   */
  function setNodeSelected(el, isAppend) {
    const { current } = ref;
    current.addNodeToSelected(el);

    if (!isAppend) {
      // 清除除当前节点以外其他节点的选中状态
      current.removeNodesFromSelected(without(current.getSelectedNodes(), el));
      // 清除所有连线的选中状态
      current.removeEdgesFromSelected(current.getSelectedEdges());
    }
  }

  function setNodeSelectedById(nodeId, isAppend) {
    setNodeSelected(ref.current.getNodeById(nodeId), isAppend);
  }

  function handleNodeSelect(el, e) {
    setNodeSelected(el, e.ctrlKey);
  }

  function handleClick(e) {
    // 当下面两者相等时，说明点击的是画布空白区域，要清除所有连线和节点的选中状态
    if (e.target === e.currentTarget) {
      ref.current.removeItemsFromSelected();
    }
  }

  emitter.useSubscription(ON_NODE_CLICK, ({ el, e }) => {
    handleNodeSelect(el, e);
  });

  emitter.useSubscription(ON_NODE_DRAG_START, ({ el, e }) => {
    if (!ref.current.isNodeSelected(el)) {
      // 如果当前节点不是选中状态，先执行一次 click 操作，以便选中节点
      handleNodeSelect(el, e);
    }
  });

  emitter.useSubscription(ON_NODE_CONTEXT_MENU, ({ el, e }) => {
    // 如果当前节点不是选中状态，则右键单击节点时先将节点置为选中状态
    if (!ref.current.isNodeSelected(el)) {
      handleNodeSelect(el, e);
    }
  });

  emitter.useSubscription(ON_EDGE_CLICK, ({ el, e }) => {
    const { current } = ref;
    const $selectedEdges = current.getSelectedEdges();
    const isContainsCurrentEdge = Array.prototype.filter.call(
      $selectedEdges,
      item => item === el,
    )[0];
    if (isContainsCurrentEdge) {
      // 选中的连线中如果已经包含了当前连线，则反选
      current.removeEdgesFromSelected(el);
    } else {
      // 否则选中当前连线
      current.addEdgeToSelected(el);
    }
    // 点击连线的同时，没有按下 Ctrl 键，则清除其他节点和连线的选中状态
    if (!e.ctrlKey) {
      // 清除除当前连线以外其他连线的选中状态
      current.removeEdgesFromSelected(without($selectedEdges, el));
      // 清除所有节点的选中状态
      current.removeNodesFromSelected(current.getSelectedNodes());
    }
  });

  emitter.useSubscription(ON_EDGE_CONTEXT_MENU, ({ el }) => {
    const { current } = ref;
    // 如果当前连线不是选中状态，则右键单击连线时先将连线置为选中状态
    if (!current.isEdgeSelected(el)) {
      current.addEdgeToSelected(el);
    }
  });

  // 从侧边栏拖出节点（即节点类型实例化）时，要设置该节点为选中状态
  emitter.useSubscription(ON_NODE_TYPE_INSTANTIATE, ({ el }) => {
    setNodeSelected(el);
  });

  emitter.useSubscription(ON_CLICK, ({ e }) => {
    handleClick(e);
  });

  emitter.useSubscription(ON_CONTEXT_MENU, ({ e }) => {
    handleClick(e);
  });

  emitter.useSubscription(ON_EDGE_DRAG, ({ connection }) => {
    ref.current.addNodeToSelected(connection.source);
  });

  return { setNodeSelectedById };
}
