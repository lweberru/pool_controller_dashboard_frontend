#!/usr/bin/env bash
set -euo pipefail

# create_or_update_release.sh <tag> <title> <notes> [--force-tag]
# - Deletes existing GitHub release for <tag> (if any) and creates a new one
# - If --force-tag is provided, the script will move the <tag> to HEAD and push it
# Requirements: `gh` CLI authenticated and `git` remote configured

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <tag> <title> <notes> [--force-tag]"
  exit 2
fi

TAG="$1"
TITLE="$2"
NOTES="$3"
FORCE_TAG=false
if [ "${4:-}" = "--force-tag" ]; then
  FORCE_TAG=true
fi

REPO_OWNER_AND_NAME="lweberru/pool_controller_dashboard_frontend"

echo "Preparing release for tag=${TAG} (force_tag=${FORCE_TAG})"

if $FORCE_TAG; then
  echo "Updating tag ${TAG} to point at HEAD"
  git tag -f "${TAG}" || true
  git push --force origin "refs/tags/${TAG}" || true
fi

echo "Deleting existing release (if any) for ${TAG}..."
set +e
gh release view "${TAG}" --repo "${REPO_OWNER_AND_NAME}" >/dev/null 2>&1
if [ $? -eq 0 ]; then
  gh release delete "${TAG}" --repo "${REPO_OWNER_AND_NAME}" -y
fi
set -e

echo "Creating release ${TAG}..."
gh release create "${TAG}" --repo "${REPO_OWNER_AND_NAME}" --title "${TITLE}" --notes "${NOTES}"

echo "Release ${TAG} created."

exit 0
