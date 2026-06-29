export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export interface JsonObject {
  [key: string]: JsonValue | undefined;
}

export type JsonArray = readonly JsonValue[];

export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

export type NonEmptyArray<T> = [T, ...T[]];

export type AtLeastOne<T> = NonEmptyArray<keyof T>;

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface TimestampFields {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type OrderDirection = "asc" | "desc";

export interface OrderBy<T> {
  field: keyof T;
  direction: OrderDirection;
}

export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };
