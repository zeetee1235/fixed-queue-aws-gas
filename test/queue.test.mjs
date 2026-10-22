import test from 'node:test';
import assert from 'node:assert/strict';
import { FixedQueue, executeQueueAction } from '../queue.mjs';

const values = [19, 15, 29, 25, 33, 35, 43, 42, 50, 55, 62, 68, 77, 80];

test('시험 시나리오 결과가 정확하다', () => {
  const queue = new FixedQueue(20);
  assert.deepEqual(executeQueueAction(queue, 'push', { values }).data, values);
  assert.deepEqual(executeQueueAction(queue, 'status'), {
    capacity: 20, length: 14, empty: false, full: false, data: values
  });
  assert.equal(executeQueueAction(queue, 'front').front, 19);
  assert.deepEqual(executeQueueAction(queue, 'index', { value: 42 }).indexes, [7]);
  assert.deepEqual(executeQueueAction(queue, 'index', { value: 42 }).positions, [8]);
  assert.equal(executeQueueAction(queue, 'count', { value: 42 }).count, 1);
  assert.equal(executeQueueAction(queue, 'contains', { value: 88 }).contains, false);
  assert.deepEqual(executeQueueAction(queue, 'list').frontToRear, values);
});

test('고정 용량, pop, clear와 빈 큐 오류를 처리한다', () => {
  const queue = new FixedQueue(2);
  queue.push(1);
  queue.push(2);
  assert.equal(queue.isFull(), true);
  assert.throws(() => queue.push(3), /가득/);
  assert.equal(queue.pop().popped, 1);
  assert.equal(queue.clear().removed, 1);
  assert.equal(queue.isEmpty(), true);
  assert.throws(() => queue.front(), /비어/);
});
