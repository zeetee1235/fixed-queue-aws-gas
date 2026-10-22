export class FixedQueue {
  constructor(capacity = 20) {
    this.initialize(capacity);
  }

  initialize(capacity = 20) {
    if (!Number.isInteger(capacity) || capacity <= 0 || capacity > 1000) {
      throw new RangeError('capacity는 1 이상 1000 이하의 정수여야 합니다.');
    }
    this.capacity = capacity;
    this.items = [];
    return this.snapshot();
  }

  push(value) {
    if (this.isFull()) throw new RangeError('큐가 가득 찼습니다.');
    this.items.push(value);
    return this.snapshot({ pushed: value });
  }

  pushMany(values) {
    if (!Array.isArray(values)) throw new TypeError('values는 배열이어야 합니다.');
    if (this.items.length + values.length > this.capacity) {
      throw new RangeError(`남은 공간은 ${this.capacity - this.items.length}개입니다.`);
    }
    this.items.push(...values);
    return this.snapshot({ pushed: values });
  }

  pop() {
    if (this.isEmpty()) throw new RangeError('큐가 비어 있습니다.');
    const popped = this.items.shift();
    return this.snapshot({ popped });
  }

  size() {
    return this.items.length;
  }

  isFull() {
    return this.size() === this.capacity;
  }

  isEmpty() {
    return this.size() === 0;
  }

  status() {
    return this.snapshot();
  }

  front() {
    if (this.isEmpty()) throw new RangeError('큐가 비어 있습니다.');
    return this.snapshot({ front: this.items[0] });
  }

  clear() {
    const removed = this.items.length;
    this.items = [];
    return this.snapshot({ removed });
  }

  indexOf(value) {
    const indexes = [];
    this.items.forEach((item, index) => {
      if (Object.is(item, value)) indexes.push(index);
    });
    return this.snapshot({
      value,
      index: indexes.length ? indexes[0] : -1,
      indexes,
      positions: indexes.map((index) => index + 1)
    });
  }

  count(value) {
    const count = this.items.filter((item) => Object.is(item, value)).length;
    return this.snapshot({ value, count });
  }

  contains(value) {
    return this.snapshot({ value, contains: this.items.some((item) => Object.is(item, value)) });
  }

  list() {
    return this.snapshot({ frontToRear: [...this.items] });
  }

  snapshot(extra = {}) {
    return {
      ...extra,
      capacity: this.capacity,
      length: this.items.length,
      empty: this.isEmpty(),
      full: this.isFull(),
      data: [...this.items]
    };
  }
}

export function executeQueueAction(queue, action, payload = {}) {
  switch (action) {
    case 'initialize': return queue.initialize(payload.capacity ?? 20);
    case 'push': return Array.isArray(payload.values) ? queue.pushMany(payload.values) : queue.push(payload.value);
    case 'pop': return queue.pop();
    case 'size': return queue.snapshot({ size: queue.size() });
    case 'status': return queue.status();
    case 'front': return queue.front();
    case 'clear': return queue.clear();
    case 'index': return queue.indexOf(payload.value);
    case 'count': return queue.count(payload.value);
    case 'contains': return queue.contains(payload.value);
    case 'list': return queue.list();
    default: throw new TypeError(`지원하지 않는 action입니다: ${action}`);
  }
}
