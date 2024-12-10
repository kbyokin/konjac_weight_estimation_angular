import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private apiUrl = 'http://localhost:8001/get_image';

  constructor(private http: HttpClient) {}

  getImage(): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'image/jpeg',
    });

    return this.http.get(this.apiUrl, {
      headers: headers,
      responseType: 'blob',
    });
  }
}
