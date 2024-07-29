import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SnowflakeService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  connect(): Observable<void> {
    // The connection is now handled on the server side
    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  getSchemas(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/schemas`);
  }

  getDatabases(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/databases`);
  }

  fetchMetadata(): Observable<any> {
    return this.http.get(`${this.apiUrl}/metadata`);
  }

  fetchSnowflakeFunctions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/functions`);
  }

  executeQuery(query: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/execute-query`, { query });
  }
}
