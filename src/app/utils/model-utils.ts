// src/app/utils/model-utils.ts
import * as monaco from 'monaco-editor';

export class ModelUtils {
  static charBefore(model: monaco.editor.ITextModel, lineNumber: number, column: number) {
    return model.getValueInRange({
      startLineNumber: lineNumber,
      startColumn: column - 1,
      endLineNumber: lineNumber,
      endColumn: column,
    });
  }
}
