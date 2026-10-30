#!/usr/bin/env bash
# scripts/install-git-hooks.sh: Automate pre-commit & pre-push hook configuration
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p .git/hooks

cat << 'EOF' > .git/hooks/pre-commit
#!/usr/bin/env bash
exec bash scripts/preflight.sh
EOF
chmod +x .git/hooks/pre-commit

cat << 'EOF' > .git/hooks/pre-push
#!/usr/bin/env bash
exec bash scripts/preflight.sh
EOF
chmod +x .git/hooks/pre-push

echo "SUCCESS: Git pre-commit and pre-push hooks installed and wired to scripts/preflight.sh"

