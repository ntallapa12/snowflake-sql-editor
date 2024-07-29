// src/app/providers/sql-formatting-provider.ts
import { format } from 'sql-formatter';

export class SqlFormattingProvider {
  static register() {
    monaco.languages.registerDocumentFormattingEditProvider('snowflake-sql', {
      provideDocumentFormattingEdits: (model: monaco.editor.ITextModel, options: monaco.languages.FormattingOptions) => {
        const formatted = format(model.getValue(), {
          language: 'sql',
          indent: ' '.repeat(options.tabSize || 4),
          uppercase: true,
        } as any); // Use 'as any' to bypass strict type checking

        return [{
          range: model.getFullModelRange(),
          text: formatted,
        }];
      },
    });
  }
}
