import React from 'react';
import { useDrag } from 'react-dnd';
import classnames from 'classnames';
import { bool, func } from 'prop-types';
import { NODE_DRAG_TYPE } from '../utils/dragType';
import DefaultNodeType from './DefaultNodeType';
import './DraggableNodeType.css';

export default function DraggableNodeType({
  nodeTypeComponent: Component,
  readOnly,
  ...restProps
}) {
  const [{ isDragging }, drag] = useDrag({
    // item 中的 type 是 react-dnd 要识别的类型，nodeType 是业务需要的类型
    item: { ...restProps, nodeType: restProps.type, type: NODE_DRAG_TYPE },
    canDrag: !readOnly,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;

  return (
    <div
      ref={drag}
      style={{ opacity }}
      className={classnames('flow-designer__node-type--container', { disabled: readOnly })}
    >
      <Component {...restProps} />
    </div>
  );
}

DraggableNodeType.propTypes = {
  nodeTypeComponent: func,
  readOnly: bool,
};

DraggableNodeType.defaultProps = {
  nodeTypeComponent: DefaultNodeType,
  readOnly: false,
};
