#!/usr/bin/env bash
set -euo pipefail

readonly REGION="${AWS_REGION:-ap-northeast-1}"
readonly PROFILE="${AWS_PROFILE:-avf-deploy}"
readonly NAME="fixed-queue-server"
readonly ARN="arn:aws:apprunner:ap-northeast-1:681498213984:service/fixed-queue-server/3b35589a941e49fcb89320b5a9c6e0a3"

case "${1:-}" in
  status)
    aws --profile "$PROFILE" apprunner describe-service --region "$REGION" --service-arn "$ARN" --query 'Service.{Status:Status,URL:ServiceUrl}' --output table
    ;;
  pause|resume)
    aws --profile "$PROFILE" apprunner "${1}-service" --region "$REGION" --service-arn "$ARN" >/dev/null
    printf '%s requested for %s.\n' "$1" "$NAME"
    ;;
  wait)
    expected="${2:-RUNNING}"
    while true; do
      current="$(aws --profile "$PROFILE" apprunner describe-service --region "$REGION" --service-arn "$ARN" --query 'Service.Status' --output text)"
      printf 'Status: %s\n' "$current"
      [[ "$current" == "$expected" ]] && break
      [[ "$current" == *FAILED ]] && exit 1
      sleep 10
    done
    ;;
  *)
    printf 'Usage: %s {status|pause|resume|wait [STATUS]}\n' "$0" >&2
    exit 2
    ;;
esac
