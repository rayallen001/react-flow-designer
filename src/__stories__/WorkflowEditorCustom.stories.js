/* eslint-disable no-console */
/* eslint-disable react/prop-types */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useRef, useState } from 'react';
import { Tooltip } from 'antd';
import CLEAN from './imgs/CLEAN.svg';
import HTTP from './imgs/HTTP.svg';
import GATHER from './imgs/GATHER.svg';
import DEFAULT from './imgs/DEFAULT.svg';
import FlowDesigner from '../components/FlowDesigner';
import 'antd/dist/antd.css';
import './WorkflowEditor.css';
import DefaultNode from '../components/DefaultNode';
import DefaultNodeType from '../components/DefaultNodeType';

function CustNode(props) {
  return (
    <>
      <Tooltip placement="topLeft" title={<h1>{props.name}</h1>}>
        <div style={{ position: 'absolute', top: -20 }}>icon</div>
      </Tooltip>
      <DefaultNode {...props} />
    </>
  );
}

function CustNodeType(props) {
  return (
    <Tooltip placement="bottomRight" title={props.name}>
      <div>
        <DefaultNodeType {...props} />
      </div>
    </Tooltip>
  );
}

const nodeTypeConfigs = [
  {
    type: 'HTTP',
    name: 'HTTP',
    icon: HTTP,
    color: '#1B90FF',
    boxShadow:
      '0px 12px 24px 0px rgba(36, 122, 204, 0.1), 0px 3px 6px 0px rgba(36, 122, 204, 0.14)',
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
  const flowDesignerRef = useRef();
  const [destroyed, setDestroyed] = useState(false);

  function handleDestroy() {
    setDestroyed(true);
  }

  function handleGetValue() {
    const value = flowDesignerRef.current.getValue();
    console.log('value: ', value);
  }

  function handleUpdateNode() {
    flowDesignerRef.current.updateNode({
      id: 'HTTP-1',
      name: 'httpUpdated',
      type: 'HTTP',
    });
  }

  return (
    <div className="workflow-editor">
      <button type="button" onClick={handleDestroy}>
        销毁画布
      </button>
      <button type="button" onClick={handleGetValue}>
        getValue
      </button>
      <button type="button" onClick={handleUpdateNode}>
        updateNode
      </button>

      {!destroyed && (
        <FlowDesigner
          defaultValue={definition}
          defaultNodeTypeConfig={defaultNodeTypeConfig}
          nodeTypeConfigs={nodeTypeConfigs}
          ref={flowDesignerRef}
          nodeComponent={CustNode}
          nodeTypeComponent={CustNodeType}
        />
      )}
    </div>
  );
}

export default {
  title: '工作流画布-自定义',
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

export const Custom = () => <WorkflowEditor />;
