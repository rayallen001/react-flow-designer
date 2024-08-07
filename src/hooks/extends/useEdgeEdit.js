import noop from 'lodash/noop';
import { EDGE_CLASS } from '../../utils/constants';
import getConnectionInputOverlayId from '../../utils/getConnectionInputOverlayId';
import stopPropagation from '../../utils/stopPropagation';
import addClickOutsideListener from '../../utils/addClickOutsideListener';
import { ON_EDGE_DBL_CLICK, ON_EDGE_UPDATE } from '../../utils/emitterType';

export default function useEdgeEdit({ ref, emitter, readOnly }) {
  function setConnectionEditable(conn) {
    const { current } = ref;
    const { color, boxShadow } = current.getNodeTypeConfigByNodeId(conn.getData().source);
    let removeClickoutsideListener = noop;

    function updateEdgeLabel(label) {
      conn.removeOverlay(getConnectionInputOverlayId(conn));
      removeClickoutsideListener();
      current.setConnectionLabel(conn, label);
      emitter.emit(ON_EDGE_UPDATE, { data: conn.getData() });
    }

    conn.addOverlay([
      'Custom',
      {
        create() {
          const input = document.createElement('input');
          const initLabel = conn.getLabel() || '';
          input.classList.add(`${EDGE_CLASS}-input`);
          input.style.borderColor = color;
          input.style.boxShadow = boxShadow;
          input.value = initLabel;
          // 输入回车时，更新连线名称
          input.addEventListener('keydown', ({ key, keyCode }) => {
            if (key === 'Enter') {
              updateEdgeLabel(input.value);
            } else if (keyCode === 27) {
              // 按 ESC 时，恢复为初始值
              updateEdgeLabel(initLabel);
            }
          });
          // 加上这一句是为了避免在输入框中点击鼠标时，事件冒泡导致选中/反选连线
          input.addEventListener('click', stopPropagation);
          // 加上这一句是为了避免在输入框中双击时，事件冒泡导致重复创建输入框
          input.addEventListener('dblclick', stopPropagation);

          // 在输入框之外点击时，更新连线名称
          removeClickoutsideListener = addClickOutsideListener(input, () => {
            updateEdgeLabel(input.value);
          });

          // 输入框渲染时，自动获取焦点。注意：用 autofocus 仅第一次渲染时生效，故用 setTimeout + focus 方法
          setTimeout(() => {
            input.focus();
          }, 0);

          return input;
        },
        location: 0.5,
        id: getConnectionInputOverlayId(conn),
      },
    ]);
  }

  /**
   * 设置连线为可编辑状态
   * @param {object} edge
   */
  function setEdgeEditable({ target, source }) {
    const connection = ref.current.getConnection({ target, source });
    setConnectionEditable(connection);
  }

  emitter.useSubscription(ON_EDGE_DBL_CLICK, ({ connection }) => {
    if (readOnly) {
      return;
    }

    setConnectionEditable(connection);
  });

  return { setEdgeEditable };
}
