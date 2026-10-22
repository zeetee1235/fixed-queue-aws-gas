# 고정길이 큐 AWS 서버 + GAS 클라이언트

용량이 고정된 큐를 AWS App Runner의 REST API로 제공하고, Google Apps Script 웹 앱에서 큐 상태·사용자 동작·서버 수행 결과를 시각화한다.

## 배포 주소

- AWS API: https://psadxjuzdx.ap-northeast-1.awsapprunner.com
- 상태 검사: https://psadxjuzdx.ap-northeast-1.awsapprunner.com/healthz
- GAS 웹 앱: Apps Script API 활성화 후 이 문서에 추가

## 구현 기능

| 번호 | 기능 | API action |
| --- | --- | --- |
| 1 | 용량 지정 초기화 | `initialize` |
| 2 | push / pop | `push`, `pop` |
| 3 | 현재 데이터 개수 | `size` |
| 4 | full / empty 상태 | `status` |
| 5 | front 데이터 확인 | `front` |
| 6 | 전체 삭제 | `clear` |
| 7 | 값의 인덱스 검색 | `index` |
| 8 | 특정 값의 개수 | `count` |
| 9 | 값 존재 여부 | `contains` |
| 10 | front에서 rear까지 출력 | `list` |

API는 `POST /api/queue`로 호출하며 사용자별 `X-Queue-Session` 헤더로 상태를 분리한다.

```bash
curl -fsS \
  -H 'content-type: application/json' \
  -H 'x-queue-session: demo' \
  --data '{"action":"initialize","capacity":20}' \
  https://psadxjuzdx.ap-northeast-1.awsapprunner.com/api/queue
```

## 시험 시나리오의 확인 결과

입력 배열:

```text
19, 15, 29, 25, 33, 35, 43, 42, 50, 55, 62, 68, 77, 80
```

- 큐 용량: `20`
- 현재 크기: `14`
- 상태: `full=false`, `empty=false`
- front: `19`
- 값 `42`: 0 기반 인덱스 `7`, 사람 기준 위치 `8`, 개수 `1`
- 값 `88` 존재 여부: `false`
- 전체 출력: 입력 배열과 동일

GAS 화면의 **시험 시나리오 자동 실행** 버튼은 위 동작을 순서대로 실행하며 각 사용자 동작과 AWS 응답을 별도 로그로 표시한다.

## 로컬 검증

```bash
npm test
docker build -t fixed-queue-server .
docker run --rm -p 8080:8080 fixed-queue-server
curl -fsS http://127.0.0.1:8080/healthz
```

## AWS 운영

```bash
./scripts/aws-service.sh status
./scripts/aws-service.sh pause
./scripts/aws-service.sh resume
./scripts/aws-service.sh wait RUNNING
```

시험 종료 후 `pause`하면 App Runner 컴퓨팅 용량이 0이 된다. ECR 저장 비용은 별도로 남을 수 있다.

## 구성

```text
GAS 웹 앱 → UrlFetchApp → AWS App Runner → 사용자별 고정길이 큐
GitHub main Push → Actions OIDC → ECR latest → App Runner 자동 배포
```
