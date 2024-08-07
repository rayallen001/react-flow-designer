import { nanoid } from 'nanoid/non-secure';

export default function generateId() {
  return nanoid(10);
}
