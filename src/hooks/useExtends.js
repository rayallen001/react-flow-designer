import useCopyPaste from './extends/useCopyPaste';
import useEdgeEdit from './extends/useEdgeEdit';
import useSelect from './extends/useSelect';
import useDelete from './extends/useDelete';
import useUndoRedo from './extends/useUndoRedo';

/**
 * 使用画布内置的扩展 Hook。返回内置 Hook 提供的扩展方法
 * @param {object} props
 * @return 内置 Hook 提供的扩展方法
 */
export default function useExtends(props) {
  return {
    ...useCopyPaste(props),
    ...useEdgeEdit(props),
    ...useSelect(props),
    ...useDelete(props),
    ...useUndoRedo(props),
  };
}
