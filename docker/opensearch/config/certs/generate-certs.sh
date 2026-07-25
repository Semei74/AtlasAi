#!/bin/sh
# Generate self-signed TLS certificates for OpenSearch production mode.
#
# Usage:  ./generate-certs.sh
#
# Output (in the same directory as this script):
#   root-ca.pem       Root CA certificate
#   root-ca-key.pem   Root CA private key
#   node.pem          Node certificate (signed by root CA)
#   node-key.pem      Node private key
#   admin.pem         Admin certificate (for securityconfig)
#   admin-key.pem     Admin private key
#
# Requirements: openssl must be installed.

set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
DAYS=${CERT_DAYS:-3650}          # 10 years for dev/staging
KEY_SIZE=${CERT_KEY_SIZE:-2048}

echo "==> Generating root CA certificate..."
openssl genrsa -out "${DIR}/root-ca-key.pem" "${KEY_SIZE}"
openssl req -x509 -new -nodes -key "${DIR}/root-ca-key.pem" \
  -days "${DAYS}" -out "${DIR}/root-ca.pem" \
  -subj "/CN=opensearch-root-ca/OU=AtlasAI/O=AtlasAI/L=City/ST=State/C=US"

echo "==> Generating node certificate (for TLS)..."
openssl genrsa -out "${DIR}/node-key.pem" "${KEY_SIZE}"
openssl req -new -key "${DIR}/node-key.pem" -out "${DIR}/node.csr" \
  -subj "/CN=opensearch-node/OU=AtlasAI/O=AtlasAI/L=City/ST=State/C=US"
cat > "${DIR}/node.ext" <<'EXT'
subjectAltName=DNS:localhost,IP:127.0.0.1
extendedKeyUsage=serverAuth,clientAuth
EXT
openssl x509 -req -in "${DIR}/node.csr" -CA "${DIR}/root-ca.pem" \
  -CAkey "${DIR}/root-ca-key.pem" -CAcreateserial \
  -days "${DAYS}" -out "${DIR}/node.pem" -extfile "${DIR}/node.ext"

echo "==> Generating admin certificate..."
openssl genrsa -out "${DIR}/admin-key.pem" "${KEY_SIZE}"
openssl req -new -key "${DIR}/admin-key.pem" -out "${DIR}/admin.csr" \
  -subj "/CN=admin/OU=AtlasAI/O=AtlasAI/L=City/ST=State/C=US"
cat > "${DIR}/admin.ext" <<'EXT'
extendedKeyUsage=clientAuth
EXT
openssl x509 -req -in "${DIR}/admin.csr" -CA "${DIR}/root-ca.pem" \
  -CAkey "${DIR}/root-ca-key.pem" -CAcreateserial \
  -days "${DAYS}" -out "${DIR}/admin.pem" -extfile "${DIR}/admin.ext"

echo "==> Cleaning up temporary files..."
rm -f "${DIR}/node.csr" "${DIR}/node.ext" "${DIR}/admin.csr" "${DIR}/admin.ext" "${DIR}/root-ca.srl"

echo "==> Done. Certificates generated in ${DIR}"
echo "    root-ca.pem, node.pem, node-key.pem, admin.pem, admin-key.pem"
echo ""
echo "    IMPORTANT: For production, use a proper CA-signed certificate."
