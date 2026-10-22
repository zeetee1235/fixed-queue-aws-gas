const SERVER_URL = 'https://psadxjuzdx.ap-northeast-1.awsapprunner.com';

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('고정길이 큐 제어 시스템')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function queueRequest(action, payload) {
  const properties = PropertiesService.getUserProperties();
  let sessionId = properties.getProperty('QUEUE_SESSION_ID');
  if (!sessionId) {
    sessionId = Utilities.getUuid();
    properties.setProperty('QUEUE_SESSION_ID', sessionId);
  }

  const body = Object.assign({}, payload || {}, { action: action });
  const response = UrlFetchApp.fetch(SERVER_URL + '/api/queue', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'X-Queue-Session': sessionId },
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });
  const status = response.getResponseCode();
  const data = JSON.parse(response.getContentText());
  if (status < 200 || status >= 300 || !data.ok) {
    throw new Error(data.error || ('서버 오류: HTTP ' + status));
  }
  return data;
}

function checkServer() {
  const response = UrlFetchApp.fetch(SERVER_URL + '/healthz', { muteHttpExceptions: true });
  return {
    status: response.getResponseCode(),
    body: JSON.parse(response.getContentText()),
    serverUrl: SERVER_URL
  };
}
