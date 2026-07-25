export interface AuditFields {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function createAuditFields(): AuditFields {
  const now = new Date();

  return { createdAt: now, updatedAt: now };
}

export function touchAuditFields(fields: AuditFields): AuditFields {
  return { createdAt: fields.createdAt, updatedAt: new Date() };
}
