import { useEffect, useRef } from 'react';
import { EventEmitter } from 'fbemitter';

function createEmitter() {
  const emitter = new EventEmitter();

  function emit(eventType, ...args) {
    return emitter.emit(eventType, ...args);
  }

  function useSubscription(eventType, callback) {
    const callbackRef = useRef({});
    callbackRef.current.callback = callback;

    useEffect(() => {
      function subscription(...args) {
        if (callbackRef.current.callback) {
          callbackRef.current.callback(...args);
        }
      }

      // 暂存 token 用于清除 listener
      const token = emitter.addListener(eventType, subscription);

      return () => {
        token.remove();
      };
    }, [eventType]);
  }

  return { emit, useSubscription };
}

/**
 * 在多个组件或者 hook 之间进行事件通知。emitter 会随着父组件的销毁而销毁，即不会将事件传导到全局。
 */
export default function useEmitter() {
  const ref = useRef();
  if (!ref.current) {
    ref.current = createEmitter();
  }
  return ref.current;
}
