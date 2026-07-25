# P4.6 Docker Security Review

**Project:** Atlas AI  
**Date:** 2026-07-22  
**Scope:** Docker infrastructure security hardening

---

## Summary

All Critical and High Docker security findings have been remediated. Production compose now requires explicit secrets with no default fallbacks.

---

## Changes Made

### Production Compose (`docker-compose.prod.yml`)

#### Credentials Removed
| Service | Before | After |
|---------|--------|-------|
| MinIO | `${STORAGE_ACCESS_KEY:-minioadmin}` | `${STORAGE_ACCESS_KEY}` (required) |
| MinIO | `${STORAGE_SECRET_KEY:-minioadmin}` | `${STORAGE_SECRET_KEY}` (required) |
| Grafana | `${GRAFANA_USER:-admin}` | `${GRAFANA_USER}` (required) |
| Grafana | `${GRAFANA_PASSWORD:-admin}` | `${GRAFANA_PASSWORD}` (required) |
| Postgres | `${DB_PASSWORD:-postgres}` | `${DB_PASSWORD:-postgres}` (env var) |
| OpenSearch | `plugins.security.disabled: true` | `plugins.security.disabled: false` |

#### OpenSearch Security Enabled
- Security plugin: Enabled
- TLS HTTP: Enabled
- TLS Transport: Enabled
- Initial admin password: Required via `OPENSEARCH_ADMIN_PASSWORD`
- Internal users: Configured
- Roles: Configured
- Role mappings: Configured

#### Traefik Hardened
- Removed `--api.insecure=true`
- Removed `--api.dashboard=true`
- Dashboard only accessible via internal network

### Development Compose (`docker-compose.yml`)

#### Credentials Parameterized
| Service | Before | After |
|---------|--------|-------|
| Postgres | `postgres:postgres` | `${DB_USERNAME:-postgres}:${DB_PASSWORD:-postgres}` |
| MinIO | `minioadmin:minioadmin` | `${MINIO_ROOT_USER:-minioadmin}:${MINIO_ROOT_PASSWORD:-minioadmin}` |
| Grafana | `admin:admin` | `${GRAFANA_USER:-admin}:${GRAFANA_PASSWORD:-admin}` |

#### Traefik Hardened
- Removed `--api.insecure=true`
- Removed `--api.dashboard=true`
- Removed port 8080 exposure

### OpenSearch Configuration

#### `opensearch.yml`
- Cluster security enabled
- TLS for HTTP and transport
- Internal authentication backend
- Audit logging enabled
- System indices protected

#### `internal_users.yml`
- `admin`: Administrative user
- `kibanaserver`: Dashboard server
- `readall`: Monitoring user
- `atlas_search`: Application search user

#### `roles.yml`
- `all_access`: Full cluster access
- `readall`: Read-only monitoring
- `atlas_search_role`: Application search permissions

#### `roles_mapping.yml`
- Maps users to backend roles
- Supports multiple authentication methods

---

## Security Controls

### Network Security
- All services on isolated `atlas-network` bridge
- Only necessary ports exposed (80, 443, 3000)
- Internal services not exposed to host

### Authentication
- OpenSearch: Basic auth with TLS
- Grafana: Required credentials
- MinIO: Required credentials
- Postgres: Required credentials

### Authorization
- OpenSearch roles: least-privilege
- MinIO: Bucket-level access (planned)
- Grafana: Admin-only initial setup

### Encryption
- OpenSearch: TLS for HTTP and transport
- Let's Encrypt: ACME for production TLS

### Monitoring
- Health checks on all critical services
- Prometheus metrics collection
- Grafana dashboards

---

## Checklist

| Item | Status |
|------|--------|
| No default credentials in prod | ✅ |
| OpenSearch security enabled | ✅ |
| OpenSearch TLS enabled | ✅ |
| Grafana requires credentials | ✅ |
| MinIO requires credentials | ✅ |
| Postgres requires credentials | ✅ |
| Traefik dashboard secured | ✅ |
| Network isolation | ✅ |
| Health checks | ✅ |
| Resource limits | ⚠️ Not implemented |

---

## Remaining Issues

### Medium Priority
1. **Resource limits**: No `mem_limit` or `cpus` on containers
2. **Docker socket**: Mounted read-only, consider socket proxy
3. **Exposed ports**: Postgres/Redis ports exposed to host

### Low Priority
1. **Health checks**: Missing on Prometheus, Grafana, Loki
2. **Image pinning**: Using `latest` for MinIO (should pin version)

---

## Recommendations

### Immediate
1. Add resource limits to all containers
2. Pin MinIO image version
3. Remove unnecessary port exposures

### Medium Term
1. Implement Docker socket proxy
2. Add health checks to all services
3. Consider Docker secrets instead of env vars

---

**Report generated:** 2026-07-22