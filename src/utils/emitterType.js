// 画布核心事件类型 //
/** 节点类型实例化为节点 */
export const ON_NODE_TYPE_INSTANTIATE = 'onNodeTypeInstantiate';
/** 节点单击 */
export const ON_NODE_CLICK = 'onNodeClick';
/** 节点双击 */
export const ON_NODE_DBL_CLICK = 'onNodeDblClick';
/** 节点上下文（右键）菜单 */
export const ON_NODE_CONTEXT_MENU = 'onNodeContextMenu';
/** 节点开始拖拽 */
export const ON_NODE_DRAG_START = 'onNodeDragStart';
/** 节点停止拖拽 */
export const ON_NODE_DRAG_STOP = 'onNodeDragStop';
/** 连线单击 */
export const ON_EDGE_CLICK = 'onEdgeClick';
/** 连线双击 */
export const ON_EDGE_DBL_CLICK = 'onEdgeDblClick';
/** 连线上下文（右键）菜单 */
export const ON_EDGE_CONTEXT_MENU = 'onEdgeContextMenu';
/** 连线从 source 节点拖出 */
export const ON_EDGE_DRAG = 'onEdgeDrag';
/** 连线拖到 target 节点 */
export const ON_EDGE_DROP = 'onEdgeDrop';
/** 画布空白处单击 */
export const ON_CLICK = 'onClick';
/** 画布空白处上下文（右键）菜单 */
export const ON_CONTEXT_MENU = 'onContextMenu';
/** 更新节点 */
export const ON_NODE_UPDATE = 'onNodeUpdate';

// 扩展事件类型 //
/** 粘贴节点或连线 */
export const ON_PASTE = 'onPaste';
/** 删除节点或连线 */
export const ON_DELETE = 'onDelete';
/** 更新连线 */
export const ON_EDGE_UPDATE = 'onEdgeUpdate';
