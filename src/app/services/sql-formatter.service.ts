import { Injectable } from '@angular/core';
import { format } from 'sql-formatter';

@Injectable({
  providedIn: 'root'
})
export class SqlFormatterService {
  formatSql(sql: string): string {
    return format(sql, { language: 'snowflake' });
  }
}
