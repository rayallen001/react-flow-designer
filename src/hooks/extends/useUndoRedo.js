import { useKeyPress, useHistoryTravel } from 'ahooks';
import { useEffect, useRef } from 'react';
import {
  ON_DELETE,
  ON_EDGE_UPDATE,
  ON_NODE_DRAG_STOP,
  ON_PASTE,
  ON_NODE_UPDATE,
  ON_EDGE_DROP,
} from '../../utils/emitterType';

export default function useUndoRedo({ ref, readOnly, emitter, defaultValue }) {
  const { value, setValue, backLength, back, forward, forwardLength, reset } =
    useHistoryTravel(defaultValue);
  // 存储最近一次 handleChanage 中 setValue 的值。用于 useEffect 中判断 value 的改变是否是由 undo/redo 引起的
  const lastChangeRef = useRef(null);

  function handleChange() {
    lastChangeRef.current = ref.current.getValue();
    setValue(lastChangeRef.current);
  }

  function undo() {
    if (readOnly || backLength <= 0) {
      return;
    }

    back();
  }

  function redo() {
    if (readOnly || forwardLength <= 0) {
      return;
    }

    forward();
  }

  emitter.useSubscription(ON_NODE_DRAG_STOP, handleChange);
  emitter.useSubscription(ON_DELETE, handleChange);
  emitter.useSubscription(ON_PASTE, handleChange);
  emitter.useSubscription(ON_EDGE_UPDATE, handleChange);
  emitter.useSubscription(ON_EDGE_DROP, handleChange);
  emitter.useSubscription(ON_NODE_UPDATE, handleChange);

  useKeyPress('ctrl.z', undo);
  useKeyPress('ctrl.y', redo);
  useKeyPress('meta.z', undo);
  useKeyPress('meta.y', redo);

  useEffect(() => {
    // 下列条件成立时，说明是由 undo/redo 引起的 value 改变，需要对画布做 setValue 操作
    if (value !== lastChangeRef.current) {
      ref.current?.setValue(value);
    }
    lastChangeRef.current = null;
  }, [ref, lastChangeRef, value]);

  return {
    undo,
    redo,
    resetHistory: reset,
    pushHistory: setValue,
  };
}
