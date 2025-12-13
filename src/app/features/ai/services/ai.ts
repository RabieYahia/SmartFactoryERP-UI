import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductForecast } from '../models/forecast.model';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7093/api/v1/ai';

  getForecast(productId: number): Observable<ProductForecast> {
    return this.http.get<ProductForecast>(`${this.apiUrl}/forecast/${productId}`);
  }
}