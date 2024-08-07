export default function setConnectionOverlayLabel(conn, label, options) {
  // 由于 label 为 ''、null、undefined 时，jsplumb 的 conn.setLabel 不生效，故需要对空值特殊处理：删除 Label
  if (!label) {
    const labelOverlay = conn.getLabelOverlay();
    if (labelOverlay) {
      conn.removeOverlay(labelOverlay.id);
    }
    return;
  }

  conn.setLabel({
    label,
    ...options,
  });
}
