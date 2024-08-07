import React from 'react';
import { useDrop } from 'react-dnd';
import { func } from 'prop-types';
import { NODE_DRAG_TYPE } from '../utils/dragType';

export default function DropContainer({ onDrop, ...restProps }) {
  const [, drop] = useDrop({
    accept: NODE_DRAG_TYPE,
    drop: (item, monitor) => {
      onDrop(item, monitor.getClientOffset());

      return {};
    },
  });

  return <div ref={drop} {...restProps} />;
}

DropContainer.propTypes = {
  onDrop: func,
};
