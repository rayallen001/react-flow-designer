import React from 'react';
import { string } from 'prop-types';
import './DefaultNodeType.css';

const ENDPOINT_CLASS = 'flow-designer__node-endpoint';

/**
 * 默认的画布节点
 */
export default function DefaultNodeType({ icon, color, boxShadow }) {
  function handleMouseEnter(e) {
    e.currentTarget.style.boxShadow = boxShadow;
  }

  function handleMouseLeave(e) {
    e.currentTarget.style.boxShadow = '';
  }

  return (
    <div
      className="flow-designer__node-type"
      style={{ borderColor: color }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img src={icon} />
    </div>
  );
}

DefaultNodeType.propTypes = {
  boxShadow: string,
  icon: string,
  color: string,
};

DefaultNodeType.endpointSelector = `.${ENDPOINT_CLASS}`;
