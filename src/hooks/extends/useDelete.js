import { useKeyPress } from 'ahooks';
import { ON_DELETE } from '../../utils/emitterType';

export default function useDelete({ ref, readOnly, emitter }) {
  function deleteSelected() {
    const { current } = ref;
    const edges = current.getSelectedEdgesData();
    const nodes = current.getSelectedNodesData();
    current.deleteEdges(edges);
    current.deleteNodes(nodes);

    emitter.emit(ON_DELETE, { nodes, edges });
  }

  useKeyPress('delete', () => {
    if (readOnly) {
      return;
    }

    deleteSelected();
  });

  return { deleteSelected };
}
