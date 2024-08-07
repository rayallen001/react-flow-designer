export default function toPixel(value) {
  const number = Number(value);

  // number 为 0 或者 NaN（即传入的 value 为 '', null, undefined, '123abc', '0', 0）时，返回 0
  if (!number) {
    return '0';
  }

  return `${number}px`;
}
