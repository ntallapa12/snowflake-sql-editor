// src/app/providers/per-model-provider-base.ts
import * as monaco from 'monaco-editor';

export interface PerModelProvider {
  setForModel(model: monaco.editor.ITextModel | null): void;
  unset(): void;
}

export abstract class PerModelProviderBase implements PerModelProvider {
  protected _model: monaco.editor.ITextModel | null = null;
  private _registration: monaco.IDisposable | null = null;

  setForModel(model: monaco.editor.ITextModel | null): void {
    if (this._registration) {
      this._registration.dispose();
      this._registration = null;
    }

    this._model = model;

    if (model) {
      this._registration = this.register();
    }
  }

  unset(): void {
    this.setForModel(null);
  }

  protected abstract register(): monaco.IDisposable;
}
