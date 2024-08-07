import { useRef } from 'react';
import useEmitter from './useEmitter';

/**
 * FlowDesigner 的基础 hook，提供 emitter，导出 FlowDesigner 的 API
 */
export default function useFlowDesigner() {
  const ref = useRef();
  const emitter = useEmitter();

  return { emitter, ref };
}
