import React from 'react';
import { bool, object, string } from 'prop-types';
import classnames from 'classnames';
import './DefaultNode.css';

const ENDPOINT_CLASS = 'flow-designer__node-endpoint';

/**
 * 默认的画布节点
 */
export default function DefaultNode({ name, nodeTypeConfig, readOnly }) {
  const { icon, color, boxShadow } = nodeTypeConfig;

  return (
    <div className="flow-designer__node" style={{ borderColor: color, boxShadow }}>
      {!readOnly && (
        <>
          <span className={classnames(ENDPOINT_CLASS, 'left')} style={{ borderColor: color }} />
          <span className={classnames(ENDPOINT_CLASS, 'right')} style={{ borderColor: color }} />
        </>
      )}
      <div className="flow-designer__node-icon">
        <img src={icon} />
      </div>
      <div className="flow-designer__node-name">{name}</div>
    </div>
  );
}

DefaultNode.propTypes = {
  nodeTypeConfig: object,
  name: string,
  readOnly: bool,
};

DefaultNode.endpointSelector = `.${ENDPOINT_CLASS}`;
