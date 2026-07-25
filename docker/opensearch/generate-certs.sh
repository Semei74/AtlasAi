#!/bin/bash
# Generate OpenSearch security certificates
# Run this script before starting production

set -e

CERT_DIR="/Users/aleksandr-box/Desktop/AtlasAi/docker/opensearch/config/certs"
mkdir -p "$CERT_DIR"

# Generate root CA
openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -nodes \
  -subj "/CN=AtlasAI Root CA/OU=AtlasAI/O=AtlasAI/L=City/ST=State/C=US" \
  -keyout "$CERT_DIR/root-ca-key.pem" \
  -out "$CERT_DIR/root-ca.pem"

# Generate node certificate
openssl req -newkey rsa:4096 -sha256 -nodes \
  -subj "/CN=opensearch/OU=AtlasAI/O=AtlasAI/L=City/ST=State/C=US" \
  -keyout "$CERT_DIR/node-key.pem" \
  -out "$CERT_DIR/node.csr"

# Sign node certificate with root CA
openssl x509 -req -in "$CERT_DIR/node.csr" -CA "$CERT_DIR/root-ca.pem" -CAkey "$CERT_DIR/root-ca-key.pem" \
  -CAcreateserial -out "$CERT_DIR/node.pem" -days 3650 -sha256 \
  -extfile <(echo -e "subjectAltName=DNS:opensearch,DNS:localhost,IP:127.0.0.1\nkeyUsage=digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth,clientAuth")

# Set proper permissions
chmod 644 "$CERT_DIR"/*.pem
chmod 640 "$CERT_DIR"/*-key.pem

# Clean up CSR
rm "$CERT_DIR/node.csr"

echo "Certificates generated in $CERT_DIR"
ls -la "$CERT_DIR"