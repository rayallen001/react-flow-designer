/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useRef, useState } from 'react';
import { Menu, Modal } from 'antd';
import { useFullscreen } from 'ahooks';
import CLEAN from './imgs/CLEAN.svg';
import HTTP from './imgs/HTTP.svg';
import GATHER from './imgs/GATHER.svg';
import DEFAULT from './imgs/DEFAULT.svg';
import FlowDesigner from '../components/FlowDesigner';
import useExtends from '../hooks/useExtends';
import 'antd/dist/antd.css';
import './WorkflowEditor.css';
import {
  ON_NODE_TYPE_INSTANTIATE,
  ON_EDGE_CONTEXT_MENU,
  ON_NODE_CONTEXT_MENU,
  ON_CONTEXT_MENU,
 } from '../utils/emitterType';
import useFlowDesigner from '../hooks/useFlowDesigner';

const nodeTypeConfigs = [
  {
    type: 'HTTP',
    name: 'HTTP',
    icon: HTTP,
    color: '#1B90FF',
    boxShadow:
      '0px 12px 24px 0px rgba(36, 122, 204, 0.1), 0px 3px 6px 0px rgba(36, 122, 204, 0.14)',
    edgeClassName: 'http',
  },
  {
    type: 'GATHER',
    name: '采集',
    icon: GATHER,
    color: '#1AC44D',
    boxShadow: '0px 12px 24px 0px rgba(26, 196, 77, 0.1), 0px 3px 6px 0px rgba(26, 196, 77, 0.14)',
  },
  {
    type: 'CLEAN',
    name: '清洗',
    icon: CLEAN,
    color: '#1AC44D',
    boxShadow: '0px 12px 24px 0px rgba(26, 196, 77, 0.1), 0px 3px 6px 0px rgba(26, 196, 77, 0.14)',
  },
  {
    type: 'CLEAN2',
    name: '清洗',
    icon: CLEAN,
    color: '#1AC44D',
    boxShadow: '0px 12px 24px 0px rgba(26, 196, 77, 0.1), 0px 3px 6px 0px rgba(26, 196, 77, 0.14)',
  },
];

const defaultNodeTypeConfig = {
  type: 'DEFAULT',
  icon: DEFAULT,
  color: '#D5D5D5',
  boxShadow: '0px 12px 24px 0px rgba(0, 0, 0, 0.07), 0px 3px 6px 0px rgba(0, 0, 0, 0.09)',
};

const definition = {
  nodes: [
    {
      name: 'myHTTP',
      type: 'HTTP',
      x: 120,
      y: 120,
      params: {},
      id: 'HTTP-1',
    },
    {
      name: 'myGATHER',
      type: 'GATHER',
      x: 320,
      y: 320,
      params: {},
      id: 'GATHER-1',
    },
    {
      name: 'myCLEAN',
      type: 'CLEAN',
      x: 420,
      y: 220,
      params: {},
      id: 'CLEAN-1',
    },
    {
      name: 'myHTTP2',
      type: 'error',
      x: 720,
      y: 220,
      params: {},
      id: 'HTTP-2',
    },
  ],
  edges: [
    {
      source: 'HTTP-1',
      target: 'GATHER-1',
      name: 'myEdge',
      params: {},
    },
  ],
};

function WorkflowEditor() {
  const [modalVisible, setModalVisible] = useState(false);
  const readOnly = modalVisible;
  const { ref, emitter } = useFlowDesigner();
  const flowDesignerProps = {
    ref,
    emitter,
    defaultNodeTypeConfig,
    nodeTypeConfigs,
    readOnly,
    maxBackLength: 3,
    defaultValue:definition,
  };
  const extendProps = useExtends(flowDesignerProps);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);

  const [contextMenuOffset, setContextMenuOffset] = useState({ left: undefined, top: undefined });
  const [pasteOffset, setPasteOffset] = useState({ offsetX: undefined, offsetY: undefined });
  const contextMenuRef = useRef({});

  function showContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    const { left, top } = ref.current.getCanvasBoundingClientRect();
    const { clientX, clientY } = e;
    setPasteOffset({ offsetX: clientX - left, offsetY: clientY - top });
    setContextMenuOffset({ left: clientX, top: clientY });
    setContextMenuVisible(true);
  }

  function handleContextMenuClose() {
    setContextMenuVisible(false);
  }

  function handleDelete() {
    extendProps.deleteSelected();
    handleContextMenuClose();
  }

  function handleEdit() {
    const { currentEdge } = contextMenuRef.current;
    if (currentEdge) {
      // 连线输入框会监听外部的 click 事件，有外部 click 时会立即隐藏连线输入框。为了避免右键菜单的点击误认为是外部 click，需要 setTimeout 延迟一下
      setTimeout(() => {
        setEdgeEditable(currentEdge);
      }, 0);
    } else {
      setModalVisible(true);
    }
    handleContextMenuClose();
  }

  function handleCopy() {
    extendProps.copy();
    setContextMenuVisible(false);
  }

  function handlePaste() {
    extendProps.paste(pasteOffset);
    setContextMenuVisible(false);
  }


  function handleNodeChange() {
    const nodeData = ref.current.getNodeDataByName('myCLEAN');
    nodeData.name = 'myCLEANUpdate';
    ref.current.updateNode(nodeData);
  }

  const { useSubscription } = emitter;
  useSubscription(ON_EDGE_CONTEXT_MENU, ({ e, data }) => {
    console.log('handleEdgeContextMenu -> e', e);
    showContextMenu(e);
    contextMenuRef.current.currentEdge = data;
  });
  useSubscription(ON_NODE_CONTEXT_MENU, ({ data, e }) => {
    console.log('handleNodeContextMenu -> e', e);
    showContextMenu(e);
    contextMenuRef.current.currentNode = data;
  });
  useSubscription(ON_CONTEXT_MENU, ({ e }) => {
    console.log('handleContextMenu -> e', e);

    showContextMenu(e);
  });
  useSubscription(ON_NODE_TYPE_INSTANTIATE, ({ data }) => {
    console.log('onNodeTypeInstantiate -> node', data);
  });


  emitter.useSubscription(ON_NODE_TYPE_INSTANTIATE, ({ data }) => {
    ref.current.updateNode(data);
  });

  const rootRef = useRef();
  const [, { enterFullscreen, exitFullscreen }] = useFullscreen(rootRef);

  useEffect(() => {
    extendProps.resetHistory(definition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [definition]);

  function handleGetNodeByName() {
    const data = ref.current.getNodeDataByName('myHTTP');
    console.log('handleGetNodeByName -> data', data);
  }

  function handleSelectNodeByName() {
    const nodeData = ref.current.getNodeDataByName('myCLEAN');
    extendProps.setNodeSelectedById(nodeData.id);
  }

  function handleGetValue() {
    const value = ref.current.getValue();
    console.log('handleGetValue -> value', value);
  }

  function handleUpdateNode() {
    ref.current.updateNode({
      id: 'HTTP-1',
      name: 'updateHttp1',
      type: 'HTTP'
    });
  }

  function handleInputChange(e) {
    const value = e.target.value;
    const { currentNode } = contextMenuRef.current;
    ref.current.updateNode({
      ...currentNode,
      name: value,
    });
  }

  function handleClose() {
    setModalVisible(false);
  }

  return (
    <div className="workflow-editor" ref={rootRef}>
      <button type="button" onClick={handleGetNodeByName}>
        名称获取节点
      </button>
      <button type="button" onClick={handleSelectNodeByName}>
        根据name选中节点
      </button>
      <button type="button" onClick={handleGetValue}>
        getValue
      </button>
      <button type="button" onClick={extendProps.undo}>
        Undo
      </button>
      <button type="button" onClick={extendProps.redo}>
        Redo
      </button>
      <button type="button" onClick={handleUpdateNode}>
        调用方法更新节点
      </button>
      <button type="button" onClick={enterFullscreen}>
        setFullScreen
      </button>
      <button type="button" onClick={exitFullscreen} style={{ margin: '0 8px' }}>
        exitFullScreen
      </button>
      <FlowDesigner {...flowDesignerProps} />
      <div
        ref={contextMenuRef}
        className="workflow-editor__context-menu"
        style={{ ...contextMenuOffset }}
      >
        {contextMenuVisible && (
          <Menu>
            <Menu.Item onClick={handleEdit}>编辑</Menu.Item>
            <Menu.Item onClick={handleDelete}>删除</Menu.Item>
            <Menu.Item onClick={handleCopy}>复制</Menu.Item>
            <Menu.Item onClick={handlePaste}>粘贴</Menu.Item>
          </Menu>
        )}
      </div>
      {modalVisible && (
        <Modal visible onCancel={handleClose} onOk={handleClose}>
          <input onChange={handleInputChange} />
        </Modal>
      )}
    </div>
  );
}

export default {
  title: '工作流画布',
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

export const Basic = () => <WorkflowEditor />;
