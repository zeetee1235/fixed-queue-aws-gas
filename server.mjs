import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { FixedQueue, executeQueueAction } from './queue.mjs';

const port = Number(process.env.PORT || 8080);
const sessions = new Map();
const SESSION_LIMIT = 1000;
const clientHtml = await readFile(new URL('./apps-script/index.html', import.meta.url), 'utf8');

function send(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type, x-queue-session',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'cache-control': 'no-store'
  });
  response.end(JSON.stringify(body));
}

function sendHtml(response, body) {
  response.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store'
  });
  response.end(body);
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64 * 1024) throw new RangeError('요청 본문이 너무 큽니다.');
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

function getQueue(sessionId) {
  const id = String(sessionId || 'default').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100) || 'default';
  if (!sessions.has(id)) {
    if (sessions.size >= SESSION_LIMIT) sessions.delete(sessions.keys().next().value);
    sessions.set(id, new FixedQueue(20));
  }
  return { id, queue: sessions.get(id) };
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (request.method === 'OPTIONS') return send(response, 204, {});
    if (request.method === 'GET' && url.pathname === '/healthz') {
      return send(response, 200, { ok: true, service: 'fixed-queue-server' });
    }
    if (request.method === 'GET' && url.pathname === '/') {
      return sendHtml(response, clientHtml);
    }
    if (request.method === 'POST' && url.pathname === '/api/queue') {
      const payload = await readJson(request);
      const { id, queue } = getQueue(request.headers['x-queue-session'] || payload.sessionId);
      const result = executeQueueAction(queue, payload.action, payload);
      return send(response, 200, { ok: true, action: payload.action, sessionId: id, result });
    }
    return send(response, 404, { ok: false, error: '요청 경로를 찾을 수 없습니다.' });
  } catch (error) {
    const clientError = error instanceof RangeError || error instanceof TypeError || error instanceof SyntaxError;
    return send(response, clientError ? 400 : 500, { ok: false, error: error.message });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`fixed-queue-server listening on ${port}`);
});
