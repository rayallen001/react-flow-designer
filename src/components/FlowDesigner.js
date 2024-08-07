/* eslint-disable no-console */
import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { object, array, func, string, bool } from 'prop-types';
import { DndProvider, createDndContext } from 'react-dnd';
import classnames from 'classnames';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { jsPlumb } from 'jsplumb';
import map from 'lodash/map';
import find from 'lodash/find';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import { useMount, useUnmount } from 'ahooks';
import DraggableNodeType from './DraggableNodeType';
import DropContainer from './DropContainer';
import DefaultNode from './DefaultNode';
import getConnectionByChild from '../utils/getConnectionByChild';
import generateId from '../utils/generateId';
import stringCopy from '../utils/stringCopy';
import getNodeData from '../utils/getNodeData';
import toPixel from '../utils/toPixel';
import isReachable from '../utils/isReachable';
import {
  ON_NODE_CLICK,
  ON_NODE_DBL_CLICK,
  ON_NODE_CONTEXT_MENU,
  ON_NODE_DRAG_START,
  ON_NODE_TYPE_INSTANTIATE,
  ON_CONTEXT_MENU,
  ON_CLICK,
  ON_EDGE_CLICK,
  ON_EDGE_DBL_CLICK,
  ON_EDGE_CONTEXT_MENU,
  ON_EDGE_DRAG,
  ON_EDGE_DROP,
  ON_NODE_DRAG_STOP,
  ON_NODE_UPDATE,
} from '../utils/emitterType';
import {
  ANCHOR,
  CONNECTION_OVERLAYS,
  EDGE_CLASS,
  EDGE_LABEL_CLASS,
  EDGE_SELECTED_CLASS,
  JSPLUMB_CANVAS_ID,
  NODE_CONTAINER_CLASS,
  NODE_SELECTED_CLASS,
} from '../utils/constants';
import setConnectionOverlayLabel from '../utils/setConnectionOverlayLabel';
import './FlowDesigner.css';

const { dragDropManager } = createDndContext(HTML5Backend);

function renderNodeComponent({
  node,
  nodeTypeConfig,
  $node,
  nodeComponent: NodeComponent,
  readOnly,
}) {
  ReactDOM.render(
    <NodeComponent nodeTypeConfig={nodeTypeConfig} {...node} readOnly={readOnly} />,
    $node,
  );
}

function unmountNodeComponent($node) {
  ReactDOM.unmountComponentAtNode($node);
}

const FlowDesigner = forwardRef(function FlowDesigner(props, forwardedRef) {
  const {
    className,
    defaultValue,
    nodeTypeConfigs,
    defaultNodeTypeConfig,
    readOnly,
    sidebarHidden,
    endpointSelector,
    nodeComponent,
    nodeTypeComponent,
    emitter,
  } = props;
  const ref = useRef({});

  function getNodeById(nodeId) {
    return document.getElementById(nodeId);
  }

  function getConnection({ source, target } = {}) {
    const { jsPlumbInstance } = ref.current;
    // jsPlumb 提供的 API 不能根据连线 id 获取，只能通过 source, target 获取
    // getConnections 虽然返回只有一个元素，但由于返回的是数组类型，故需要用 [0]
    return jsPlumbInstance.getConnections({ source, target })[0];
  }

  function deleteEdge({ source, target }) {
    const { jsPlumbInstance } = ref.current;
    const connection = getConnection({ source, target });
    jsPlumbInstance.deleteConnection(connection);
  }

  function deleteEdges(edgesData) {
    const { jsPlumbInstance } = ref.current;
    jsPlumbInstance.batch(() => {
      edgesData.forEach(deleteEdge);
    });
  }

  function deleteNode({ id } = {}) {
    const { jsPlumbInstance } = ref.current;
    const $node = getNodeById(id);
    unmountNodeComponent($node);
    jsPlumbInstance.remove($node);
  }

  function deleteNodes(nodesData) {
    const { jsPlumbInstance } = ref.current;

    jsPlumbInstance.batch(() => {
      nodesData.forEach(deleteNode);
    });
  }

  function getNodeTypeConfig(type) {
    return find(nodeTypeConfigs, { type }) || defaultNodeTypeConfig;
  }

  function getNodeTypeConfigByNodeId(nodeId) {
    const $node = getNodeById(nodeId);

    return getNodeTypeConfig(get($node, 'data.type'));
  }

  function updateNode(node = {}, { isPreventEmit = false } = {}) {
    const $node = getNodeById(node.id);

    if ($node) {
      // 通常业务中只是修改了 data.params
      $node.data = node;
      // 若除了修改 data.params，还修改了 x,y,name 等属性，则需要进一步更新节点坐标及重绘节点

      if (!isNil(node.x)) {
        $node.style.left = toPixel(node.x);
      }
      if (!isNil(node.y)) {
        $node.style.top = toPixel(node.y);
      }

      const nodeTypeConfig = getNodeTypeConfig(node.type);
      // 触发 NodeComponent 的 rerender
      renderNodeComponent({ node, nodeTypeConfig, $node, readOnly, nodeComponent });

      if (!isPreventEmit) {
        emitter.emit(ON_NODE_UPDATE, { el: $node, data: getNodeData($node) });
      }
    }
  }

  function isNodeSelected($node) {
    return $node.classList.contains(NODE_SELECTED_CLASS);
  }

  // 添加节点到选中状态
  function addNodeToSelected($node) {
    if ($node) {
      const { jsPlumbInstance } = ref.current;
      $node.classList.add(NODE_SELECTED_CLASS);
      // 添加到可批量拖动
      jsPlumbInstance.addToDragSelection($node);
    }
  }

  // 清除节点的选中状态
  function removeNodesFromSelected($selectedNodes) {
    const { jsPlumbInstance } = ref.current;
    jsPlumbInstance.removeClass($selectedNodes, NODE_SELECTED_CLASS);
    // 移除到可批量拖动
    jsPlumbInstance.removeFromDragSelection($selectedNodes);
  }

  function getAllNodes() {
    return ref.current.jsPlumbInstance.getSelector(`.${NODE_CONTAINER_CLASS}`);
  }

  function getAllNodesData() {
    return Array.prototype.map.call(getAllNodes(), getNodeData);
  }

  function getAllEdgesData() {
    const { jsPlumbInstance } = ref.current;
    return jsPlumbInstance.getConnections().map(conn => ({
      ...conn.getData(),
      name: conn.getLabel(),
    }));
  }

  // 获取选中的节点
  function getSelectedNodes() {
    return ref.current.jsPlumbInstance.getSelector(`.${NODE_SELECTED_CLASS}`);
  }

  function setConnectionLabel(conn, label) {
    const { color } = getNodeTypeConfigByNodeId(conn.getData().source);
    setConnectionOverlayLabel(conn, label, {
      labelStyle: { color },
      cssClass: `${EDGE_LABEL_CLASS}`,
    });
  }

  // 获取所有节点的 name 集合（注意：这里并没有用 ES6 的 Set，而是用 Object 对象模拟的 Set）
  function getAllNodesNameSet() {
    return Array.prototype.reduce.call(
      getAllNodes(),
      (result, { data }) => {
        // eslint-disable-next-line no-param-reassign
        result[data.name] = true;
        return result;
      },
      {},
    );
  }

  // 获取选中的节点数据
  function getSelectedNodesData() {
    // 注意：不能直接调 map，因为 NodeList 是一个类数组的对象，但可以用 Array.prototype.map.call
    return Array.prototype.map.call(getSelectedNodes(), getNodeData);
  }

  function getEdgeByConnection(conn) {
    return conn.canvas;
  }

  function isEdgeSelected($edge) {
    return $edge ? $edge.classList.contains(EDGE_SELECTED_CLASS) : false;
  }

  // 添加连线到选中状态
  function addEdgeToSelected($edge) {
    if ($edge) {
      $edge.classList.add(EDGE_SELECTED_CLASS);
    }
  }

  // 清除连线的选中状态
  function removeEdgesFromSelected($selectedEdges) {
    const { jsPlumbInstance } = ref.current;

    jsPlumbInstance.removeClass($selectedEdges, EDGE_SELECTED_CLASS);
  }

  // 获取选中的连线
  function getSelectedEdges() {
    const { jsPlumbInstance } = ref.current;

    return jsPlumbInstance.getSelector(`.${EDGE_SELECTED_CLASS}`);
  }

  // 获取选中的连线数据
  function getSelectedEdgesData() {
    return Array.prototype.map.call(getSelectedEdges(), ({ data }) => data);
  }

  function handleNodeClick(e) {
    // 由于拖拽节点并放下时，仍然会触发一次 click 事件，故判断若正在拖拽中，则不再执行 click 中的后续语句
    if (ref.current.isDraggingNode) {
      ref.current.isDraggingNode = false;
      return;
    }

    const el = e.currentTarget;
    emitter.emit(ON_NODE_CLICK, { el, data: getNodeData(el), e });
  }

  function handleNodeDblClick(e) {
    const el = e.currentTarget;
    emitter.emit(ON_NODE_DBL_CLICK, { el, data: getNodeData(el), e });
  }

  function handleNodeContextMenu(e) {
    const el = e.currentTarget;
    emitter.emit(ON_NODE_CONTEXT_MENU, { el, data: getNodeData(el), e });
  }

  function handleConnectionClick(connChild, e) {
    const connection = getConnectionByChild(connChild);
    // 注意：connection.bind('click') 事件回调拿到的不是 DOM 元素，而是 jsPlumb 中的 connection 对象。
    // 此处需要拿到连线的 DOM 元素，以便进行后面的 addClass 等样式操作
    const el = getEdgeByConnection(connection);
    emitter.emit(ON_EDGE_CLICK, { el, e, connection, data: connection.getData() });
  }

  function handleConectionDblClick(connChild, e) {
    const connection = getConnectionByChild(connChild);
    // 注意：connection.bind('dblclick') 事件回调拿到的不是 DOM 元素，而是 jsPlumb 中的 connection 对象。
    // 此处需要拿到连线的 DOM 元素，以便进行后面的 addClass 等样式操作
    const el = getEdgeByConnection(connection);
    emitter.emit(ON_EDGE_DBL_CLICK, { el, e, connection, data: connection.getData() });
  }

  function handleConnectionContextMenu(connChild, e) {
    const conn = getConnectionByChild(connChild);
    // 注意：connection.bind('contextmenu') 事件回调拿到的不是 DOM 元素，而是 jsPlumb 中的 connection 对象。
    // 此处拿到连线的 DOM 元素，以便进行后面的选中状态等样式判断
    const el = getEdgeByConnection(conn);
    emitter.emit(ON_EDGE_CONTEXT_MENU, { e, el, data: conn.getData() });
  }

  // 添加节点到画布
  function appendNodeToCanvas(node) {
    const { jsPlumbInstance } = ref.current;
    const { x, y, type, id } = node;

    if (getNodeById(id)) {
      console.error(`存在重复的节点 id: ${id}, 重复时只会创建一个节点`);
      return null;
    }

    const $node = document.createElement('div');
    $node.classList.add(NODE_CONTAINER_CLASS);
    $node.id = id;
    $node.style.left = toPixel(x);
    $node.style.top = toPixel(y);

    const nodeTypeConfig = getNodeTypeConfig(type);

    renderNodeComponent({ node, nodeComponent, nodeTypeConfig, $node, readOnly });

    jsPlumbInstance.getContainer().appendChild($node);

    $node.data = node;
    $node.addEventListener('click', handleNodeClick);
    $node.addEventListener('dblclick', handleNodeDblClick);
    $node.addEventListener('contextmenu', handleNodeContextMenu);
    // 设置节点可在画布中拖动
    jsPlumbInstance.draggable($node, {
      // 控制节点不能拖出画布区域
      containment: true,
      start({ drag, e }) {
        ref.current.isDraggingNode = true;
        emitter.emit(ON_NODE_DRAG_START, { el: drag.el, e, data: getNodeData(drag.el) });
      },
      stop({ drag, e }) {
        emitter.emit(ON_NODE_DRAG_STOP, { el: drag.el, e, data: getNodeData(drag.el) });
      },
    });
    jsPlumbInstance.makeSource($node, {
      // 过滤掉端点，避免拖拽端点与拖拽节点的事件冲突
      filter: endpointSelector,
      allowLoopback: false,
      anchor: ANCHOR,
      // 拖出连线时，端点样式置空，避免出现两个大圆点
      paintStyle: {},
      connectorStyle: {
        stroke: nodeTypeConfig.color,
        strokeWidth: 1,
        outlineStroke: 'transparent',
        outlineWidth: 6, // 扩大连线的点击区域
      },
    });
    // 设置节点可被其他节点连线
    jsPlumbInstance.makeTarget($node, {
      allowLoopback: false,
      // 拖出连线时，端点样式置空，避免出现两个大圆点
      paintStyle: {},
      anchor: ANCHOR,
    });

    return $node;
  }

  // 添加节点到画布
  function appendEdgeToCanvas(edge) {
    const { jsPlumbInstance } = ref.current;
    const { source, target, name } = edge;
    const { edgeClassName } = getNodeTypeConfigByNodeId(source) || {};
    const connection = jsPlumbInstance.connect({
      source,
      target,
      // 创建好的连线，只能选中连线后点击 'Delete' 以及右键菜单删除，不可通过点击端点删除
      detachable: false,
      // 同一个连线，不可被重新连接到其他节点
      reattach: false,
      cssClass: classnames(EDGE_CLASS, edgeClassName),
    });

    // 当前 source 或 target 之一不存在时，则会创建连线失败（通常是复制时，选中了连线但没有同时选中两端的节点）
    if (!connection) {
      return null;
    }

    // 设置连线的数据
    const $edge = getEdgeByConnection(connection);
    connection.setData(edge);
    $edge.data = edge;

    setConnectionLabel(connection, name);

    connection.bind('click', handleConnectionClick);
    connection.bind('dblclick', handleConectionDblClick);
    connection.bind('contextmenu', handleConnectionContextMenu);

    return $edge;
  }

  // 拖动连线时，选中连线的 source 节点
  function handleEdgeDrag(connection) {
    emitter.emit(ON_EDGE_DRAG, { connection, data: connection.getData() });
  }

  // 连线从 source 拖动到 target 时，判断：若形成环则取消连线，否则就新增连线
  function handleEdgeBeforeDrop({ sourceId: source, targetId: target }) {
    // 如果 source 和 target 已经直接相连，则不允许再连线
    if (getConnection({ source, target })) {
      return false;
    }

    // 注意：这里是有意把 target 放到 isReachable 的第一个参数，因为当 target 到 source 可达时，
    // 连接 source 到 target 必然形成环
    if (isReachable(target, source, getAllEdgesData())) {
      return false;
    }

    appendEdgeToCanvas({ source, target });

    const connection = getConnection({ source, target });
    emitter.emit(ON_EDGE_DROP, { connection, data: connection.getData() });
    // 由于已经通过直接调 appendEdgeToCanvas 新增了连线，故此处始终返回 false，避免 JsPlumb 再次新增连线
    return false;
  }

  function getCanvasBoundingClientRect() {
    return ref.current.jsPlumbInstance.getContainer().getBoundingClientRect();
  }

  // clientOffset 是 drop 时相对于浏览器窗口的 x,y 坐标
  function handleNodeTypeConfigDrop(nodeTypeConfig, clientOffset) {
    // 获取画布元素相对于浏览器窗口的 left,top
    const { left, top } = getCanvasBoundingClientRect();
    // 当拖出多个相同类型的节点时，为了让节点名不重复，需要调用一次 stringCopy，以便对同名节点加后缀区分
    const name = stringCopy(nodeTypeConfig.name, getAllNodesNameSet());

    const node = {
      id: generateId(), // 随机生成 id 后缀
      name,
      type: nodeTypeConfig.nodeType, // 为了避免与 react-dnd 的 type 属性名冲突，重命名为了 nodeType
      x: clientOffset.x - left,
      y: clientOffset.y - top,
    };

    const el = appendNodeToCanvas(node);

    emitter.emit(ON_NODE_TYPE_INSTANTIATE, { el, data: el.data, nodeTypeConfig });
  }

  function getValue() {
    return {
      nodes: getAllNodesData(),
      edges: getAllEdgesData(),
    };
  }

  function removeItemsFromSelected() {
    removeNodesFromSelected(getSelectedNodes());
    removeEdgesFromSelected(getSelectedEdges());
  }

  function handleCanvasClick(e) {
    emitter.emit(ON_CLICK, { e });
  }

  function handleCanvasContextMenu(e) {
    emitter.emit(ON_CONTEXT_MENU, { e });
  }

  function batchAppendToCanvas(nodesData, edgesData) {
    const { jsPlumbInstance } = ref.current;
    const result = [];

    jsPlumbInstance.batch(() => {
      // 根据 locations 属性渲染节点
      result[0] = map(nodesData, appendNodeToCanvas);
      // 根据 connections 对节点进行连线，并绑定左键单击和右键单击事件
      result[1] = map(edgesData, appendEdgeToCanvas);
    });

    return result;
  }

  function getNodeDataByName(name) {
    // 获取所有节点的 name 集合（注意：这里并没有用 ES6 的 Set，而是用 Object 对象模拟的 Set）
    return find(getAllNodesData(), data => get(data, 'name') === name);
  }

  function destory() {
    deleteEdges(getAllEdgesData());
    deleteNodes(getAllNodesData());
  }

  function setValue(value = {}) {
    // 先销毁旧的画布元素，再重建
    destory();
    const { nodes, edges } = value;
    batchAppendToCanvas(nodes, edges);

    // 节点是通过 ReactDOM.render 渲染的，而 ReactDOM.render 是异步的，故生成节点的初始高度为 0，
    // 导致连线时位置始终从节点顶部出现。通过延迟 repaintEverything 解决该问题
    setTimeout(() => {
      const { jsPlumbInstance } = ref.current;
      jsPlumbInstance.repaintEverything();
    }, 0);
  }

  useEffect(() => {
    // 重新渲染所有节点，主要是为了更新 readOnly 的变化
    // 遇到过的 bug：双击节点唤起节点表单，保存了表单后，节点变为不可连线
    // 首次渲染时，画布还未创建， jsPlumbInstance 为空，故需要判空
    if (ref.current.jsPlumbInstance) {
      getAllNodesData().forEach(data => updateNode(data, { isPreventEmit: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly]);

  useMount(() => {
    const jsPlumbInstance = jsPlumb.getInstance({
      ConnectionOverlays: CONNECTION_OVERLAYS,
      Container: JSPLUMB_CANVAS_ID,
    });
    ref.current.jsPlumbInstance = jsPlumbInstance;

    jsPlumb.ready(() => {
      jsPlumbInstance.bind('connectionDrag', handleEdgeDrag);
      jsPlumbInstance.bind('beforeDrop', handleEdgeBeforeDrop);
      setValue(defaultValue);
    });
  });

  useUnmount(() => {
    destory();
  });

  // 对父级暴露的 API
  useImperativeHandle(forwardedRef, () => ({
    // 公开方法 //
    deleteEdges,
    deleteNodes,
    updateNode,
    getSelectedNodesData,
    getSelectedEdgesData,
    getNodeDataByName,
    getCanvasBoundingClientRect,
    getValue,
    setValue,

    // 供自定义 hook 使用的非公开方法，不建议业务直接使用，因为需要了解 jsplumb 的 API 细节 //
    removeEdgesFromSelected,
    removeNodesFromSelected,
    getSelectedEdges,
    getSelectedNodes,
    addNodeToSelected,
    addEdgeToSelected,
    getAllNodesNameSet,
    batchAppendToCanvas,
    removeItemsFromSelected,
    isEdgeSelected,
    isNodeSelected,
    setConnectionLabel,
    getConnection,
    getNodeTypeConfigByNodeId,
    getNodeById,
  }));

  return (
    <div className={classnames('flow-designer', className)}>
      <DndProvider manager={dragDropManager}>
        {!sidebarHidden && (
          <div className="flow-designer__side-bar">
            {nodeTypeConfigs.map(nodeTypeConfig => (
              <DraggableNodeType
                {...nodeTypeConfig}
                key={nodeTypeConfig.type}
                readOnly={readOnly}
                nodeTypeComponent={nodeTypeComponent}
              />
            ))}
          </div>
        )}
        <DropContainer
          onDrop={handleNodeTypeConfigDrop}
          className="flow-designer__canvas"
          id={JSPLUMB_CANVAS_ID}
          onClick={handleCanvasClick}
          onContextMenu={handleCanvasContextMenu}
        />
      </DndProvider>
    </div>
  );
});

FlowDesigner.propTypes = {
  emitter: object.isRequired,
  className: string,
  defaultValue: object,
  nodeTypeConfigs: array,
  defaultNodeTypeConfig: object,
  // 是否只读状态
  readOnly: bool,
  sidebarHidden: bool,
  // 可被连线的端点，通常有左右两个端点
  endpointSelector: string,
  nodeComponent: func,
  nodeTypeComponent: func,
};

FlowDesigner.defaultProps = {
  className: '',
  defaultValue: {},
  nodeTypeConfigs: [],
  defaultNodeTypeConfig: {},
  readOnly: false,
  sidebarHidden: false,
  endpointSelector: DefaultNode.endpointSelector,
  nodeComponent: DefaultNode,
};

export default FlowDesigner;
