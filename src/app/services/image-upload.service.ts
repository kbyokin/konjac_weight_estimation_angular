import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  formData = {
    file: new FormControl(),
    qrcodeSize: new FormControl(),
  };
  private apiUrl = 'http://127.0.0.1:8000/detect_weight_visible'; // lab server
  // private apiUrl = 'http://172.23.161.159:8000/detect_weight_visible'; // edge computer
  // private apiUrl = 'http://172.23.161.159:8000/detect_weight'; // edge computer
  // private apiUrl = 'http://127.0.0.1:9000/upload/';

  private serverUrl = 'http://172.23.161.109:9000/predict_laser/';

  constructor(private http: HttpClient) {}

  uploadImage(file: File, qrcodeSize: Number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    console.log(formData);
    formData.append('qrcodeSize', qrcodeSize.toString());

    // this.formData = new FormGroup({
    //   file: new FormControl(file),
    //   qrcodeSize: new FormControl(qrcodeSize)
    // })
    // const formData = {
    //   file: file,
    //   qrcodeSize: qrcodeSize
    // }
    // console.log(formData);
    // console.log(JSON.stringify(formData));

    return this.http.post<any>(this.apiUrl, formData, {
      headers: new HttpHeaders(),
      responseType: 'json', // Set response type to 'blob'
    });
  }

  laserPrediction(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(this.serverUrl, formData, {
      headers: new HttpHeaders(),
      responseType: 'json',
    });
  }
}