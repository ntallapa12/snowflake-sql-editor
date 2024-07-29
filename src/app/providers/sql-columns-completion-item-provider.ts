import * as monaco from 'monaco-editor';
import {SNOWFLAKE_FUNCTIONS} from "../utils/snowflake-functions";
import { SnowflakeService } from '../services/snowflake.service';

interface TableInfo {
  name: string;
  alias?: string;
}

export class SqlColumnsCompletionItemProvider {
  private tableColumns: Map<string, string[]> = new Map();
  private _model: monaco.editor.ITextModel | null = null;
  private schemas: string[] = [];
  private databases: string[] = [];

  constructor(private snowflakeService: SnowflakeService) {
    this.loadSchemasAndDatabases();
  }
  setModel(model: monaco.editor.ITextModel) {
    this._model = model;
  }

  setTableColumns(tableColumns: Map<string, string[]>) {
    this.tableColumns = tableColumns;
  }

  register(): monaco.IDisposable {
    console.log('Registering completion provider');
    return monaco.languages.registerCompletionItemProvider('snowflake-sql', {
      triggerCharacters: ['.', ' '],
      provideCompletionItems: (
        model: monaco.editor.ITextModel,
        position: monaco.Position,
      ): monaco.languages.ProviderResult<monaco.languages.CompletionList> => {
        console.log('Providing completion items');

        // Remove the model check, as we want to provide suggestions for any model
        const wordUntilPosition = model.getWordUntilPosition(position);
        const lineContent = model.getLineContent(position.lineNumber);

        // Check if we're after a table alias
        const tableInfo = this.getRelevantTableInfo(lineContent, wordUntilPosition);
        console.log('Table info:', tableInfo)
        if (tableInfo && tableInfo.name && this.tableColumns.has(tableInfo.name)) {
          const suggestions = [
            ...this.getColumnSuggestions(tableInfo, position, wordUntilPosition),
            ...this.getKeywordSuggestions(position, wordUntilPosition),
            ...this.getFunctionSuggestions(position)
          ];
          return {
            suggestions
          };
        }

        const suggestions = [
          ...this.getTableSuggestions(position, wordUntilPosition),
          ...this.getKeywordSuggestions(position, wordUntilPosition),
          ...this.getFunctionSuggestions(position),
          ...this.getSchemaSuggestions(position, wordUntilPosition),
          ...this.getDatabaseSuggestions(position, wordUntilPosition)
          ]
        // If not after a table alias, provide keyword suggestions
        return {
          suggestions
        };
      }
    });
  }

  private loadSchemasAndDatabases() {
    this.snowflakeService.getSchemas().subscribe(
      schemas => this.schemas = schemas,
      error => console.error('Error fetching schemas:', error)
    );
    this.snowflakeService.getDatabases().subscribe(
      databases => this.databases = databases,
      error => console.error('Error fetching databases:', error)
    );
  }

  private getTableSuggestions(position: monaco.Position, word: monaco.editor.IWordAtPosition): monaco.languages.CompletionItem[] {
    const tables = Array.from(this.tableColumns.keys());
    return tables.map(table => ({
      label: table,
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: table,
      range: {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      },
      // You might want to add these properties as well for better completion items
      detail: 'Table',
      documentation: `This is a table named ${table}`
    }));
  }

  private getRelevantTableInfo(lineContent: string, word: monaco.editor.IWordAtPosition): { name: string; alias: string; schema: string; database: string } | null {
    const beforeWord = lineContent.substring(0, word.startColumn - 1);

    // Match for fully qualified table names with or without quotes, and optional alias
    const fullMatch = beforeWord.match(/FROM\s+(("([^"]+)"|([^\s."]+))\.("([^"]+)"|([^\s."]+))\.("([^"]+)"|([^\s."]+)))(\s+AS\s+(\w+))?.*?(WHERE|$)/i);
    console.log('Full match:', fullMatch);

    if (fullMatch) {
      const database = fullMatch[3] || fullMatch[4] || '';
      const schema = fullMatch[6] || fullMatch[7] || '';
      const tableName = fullMatch[9] || fullMatch[10] || '';
      const alias = fullMatch[12] || tableName;

      return {
        name: tableName,
        alias: alias,
        schema: schema,
        database: database
      };
    }

    // Match for table names without full qualification, with or without alias
    const simpleMatch = beforeWord.match(/FROM\s+([^\s]+)(\s+AS\s+(\w+))?.*?(WHERE|$)/i);

    if (simpleMatch) {
      return {
        name: simpleMatch[1],
        alias: simpleMatch[3] || simpleMatch[1],
        schema: '',
        database: ''
      };
    }

    return null;
  }

  private getColumnSuggestions(tableInfo: { name: string; alias: string }, position: monaco.Position, word: monaco.editor.IWordAtPosition): monaco.languages.CompletionItem[] {
    const columns = this.tableColumns.get(tableInfo.name) || [];
    return columns.map(column => ({
      label: column,
      kind: monaco.languages.CompletionItemKind.Field,
      insertText: column,
      range: {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      },
      // You might want to add these properties as well for better completion items
      detail: `Column of ${tableInfo.name}`,
      documentation: `This is a column named ${column} in table ${tableInfo.name}`
    }));
  }

  private getKeywordSuggestions(position: monaco.Position, word: monaco.editor.IWordAtPosition): monaco.languages.CompletionItem[] {
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'INSERT', 'UPDATE', 'DELETE',
      'CREATE', 'TABLE', 'DROP', 'ALTER', 'INDEX', 'VIEW', 'PROCEDURE', 'FUNCTION',
      'WAREHOUSE', 'CLONE', 'SHARE', 'STAGE', 'PIPE', 'TASK', 'STREAM',
      'COPY', 'MERGE', 'UNDROP', 'RLIKE', 'SAMPLE', 'QUALIFY', 'PIVOT', 'UNPIVOT', 'LIMIT'
    ];
    return keywords.map(keyword => ({
      label: keyword,
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: keyword,
      range: {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }
    }));
  }

  private getFunctionSuggestions(position: monaco.Position): monaco.languages.CompletionItem[] {
    return SNOWFLAKE_FUNCTIONS.map(func => ({
      label: func.name,
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: func.name,
      detail: func.signature,
      documentation: func.description,
      range: {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: position.column,
        endColumn: position.column
      }
    }));
  }
  private getSchemaSuggestions(position: monaco.Position, word: monaco.editor.IWordAtPosition): monaco.languages.CompletionItem[] {
    return this.schemas.map(schema => ({
      label: schema,
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: schema,
      range: {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }
    }));
  }

  private getDatabaseSuggestions(position: monaco.Position, word: monaco.editor.IWordAtPosition): monaco.languages.CompletionItem[] {
    return this.databases.map(database => ({
      label: database,
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: database,
      range: {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }
    }));
  }
}
