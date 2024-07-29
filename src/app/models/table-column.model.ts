// src/app/models/table-column.model.ts
export interface Column {
  name: string;
  type: string;
  is_nullable: string;
}

export interface Table {
  name: string;
  columns: Column[];
}

export interface Response {
  sql: string;
}
