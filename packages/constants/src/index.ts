export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const HEADERS = {
  AUTHORIZATION: "authorization",
  CONTENT_TYPE: "content-type",
  ACCEPT: "accept",
  CORRELATION_ID: "x-correlation-id",
  REQUEST_ID: "x-request-id",
  USER_ID: "x-user-id",
  WORKSPACE_ID: "x-workspace-id",
  API_VERSION: "x-api-version",
  RATE_LIMIT: "x-rate-limit",
  RATE_REMAINING: "x-rate-remaining",
  RATE_RESET: "x-rate-reset",
} as const;

export const MIME_TYPES = {
  JSON: "application/json",
  HTML: "text/html",
  TEXT: "text/plain",
  FORM_DATA: "multipart/form-data",
  FORM_URLENCODED: "application/x-www-form-urlencoded",
  OCTET_STREAM: "application/octet-stream",
  PDF: "application/pdf",
  PNG: "image/png",
  JPEG: "image/jpeg",
  SVG: "image/svg+xml",
  CSV: "text/csv",
} as const;

export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  DAY: 86400,
  WEEK: 604800,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const TIME = {
  MILLISECOND: 1,
  SECOND: 1000,
  MINUTE: 60000,
  HOUR: 3600000,
  DAY: 86400000,
  WEEK: 604800000,
} as const;

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  URL: /^https?:\/\/.+/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  DEPENDENCY_ERROR: "DEPENDENCY_ERROR",
  AI_PROVIDER_ERROR: "AI_PROVIDER_ERROR",
  CONFIGURATION_ERROR: "CONFIGURATION_ERROR",
} as const;
