import { Injectable } from '@angular/core';
import { SnowflakeService } from './snowflake.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import * as monaco from 'monaco-editor';

interface MetadataItem {
  TABLE_NAME: string;
  COLUMN_NAME: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutoCompleteService {
  private sqlKeywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'INSERT', 'UPDATE', 'DELETE',
    'CREATE', 'TABLE', 'DROP', 'ALTER', 'INDEX', 'VIEW', 'PROCEDURE', 'FUNCTION',
    'WAREHOUSE', 'CLONE', 'SHARE', 'STAGE', 'PIPE', 'TASK', 'STREAM',
    'COPY', 'MERGE', 'UNDROP', 'RLIKE', 'SAMPLE', 'QUALIFY', 'PIVOT', 'UNPIVOT'
  ];
  constructor(private snowflakeService: SnowflakeService) {}

  getAutoCompleteItems(): Observable<monaco.languages.CompletionItem[]> {
    return combineLatest([
      this.snowflakeService.fetchMetadata(),
      this.snowflakeService.fetchSnowflakeFunctions()
    ]).pipe(
      map(([metadata, functions]: [MetadataItem[], string[]]) => {
        const suggestions: monaco.languages.CompletionItem[] = [];

        // Add table and column suggestions
        metadata.forEach((item: MetadataItem) => {
          suggestions.push({
            label: item.TABLE_NAME,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: item.TABLE_NAME,
            range: {
              startLineNumber: 0,
              endLineNumber: 0,
              startColumn: 0,
              endColumn: 0
            }
          });
          suggestions.push({
            label: item.COLUMN_NAME,
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: item.COLUMN_NAME,
            range: {
              startLineNumber: 0,
              endLineNumber: 0,
              startColumn: 0,
              endColumn: 0
            }
          });
        });


        this.sqlKeywords.map(keyword => (
          suggestions.push({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range: {
              startLineNumber: 0,
              endLineNumber: 0,
              startColumn: 0,
              endColumn: 0
            }
          })));


        // Add function suggestions
        functions.forEach((func: string) => {
          suggestions.push({
            label: func,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: func,
            range: {
              startLineNumber: 0,
              endLineNumber: 0,
              startColumn: 0,
              endColumn: 0
            }
          });
        });

        return suggestions;
      })
    );
  }
}
