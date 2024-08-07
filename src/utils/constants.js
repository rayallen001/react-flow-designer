// 粘贴时，默认的坐标偏移量
export const DEFAULT_DELTA = 20;

export const ANCHOR = ['Left', 'Right'];

export const CONNECTION_OVERLAYS = [
  [
    'Arrow',
    {
      location: 1,
      visible: true,
      width: 6,
      length: 6,
    },
  ],
];

export const NODE_CONTAINER_CLASS = 'flow-designer__node-container';
export const NODE_SELECTED_CLASS = `${NODE_CONTAINER_CLASS}--selected`;
export const EDGE_CLASS = 'flow-designer__edge';
export const EDGE_LABEL_CLASS = `${EDGE_CLASS}--label`;
export const EDGE_SELECTED_CLASS = `${EDGE_CLASS}--selected`;

export const JSPLUMB_CANVAS_ID = 'jsPlumbCanvas';
