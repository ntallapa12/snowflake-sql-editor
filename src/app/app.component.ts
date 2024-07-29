import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SqlEditorComponent } from './sql-editor/sql-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SqlEditorComponent],
  template: `
    <h1>Snowflake SQL Editor</h1>
    <app-sql-editor></app-sql-editor>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'snowflake-sql-editor';

  constructor() {
    console.log('AppComponent constructed');
  }

  ngOnInit() {
    console.log('AppComponent initialized');
  }
}
