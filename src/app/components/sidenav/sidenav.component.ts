import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/** Services */
import { ImageUploadService } from 'src/app/services/image-upload.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent {
  status!: string;
  selectedFile!: File;
  processedImageUrl!: string;

  @Output() onUploadCompleted = new EventEmitter<string>();

  constructor(
    private http: HttpClient,
    private imageUploadService: ImageUploadService
  ) {}

  selectFiles(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }

  getImage() {
    this.http.get('http://127.0.0.1:8000/get_image/').subscribe(
      {
        next: data => console.log(data),
        error: error => console.log(error)
      }
    );
  }

  onUpload() {
    this.imageUploadService.uploadImage(this.selectedFile).subscribe({
      next: (data) => {
        console.log(data);
        // const blob = new Blob([data.file], { type: 'image/png' });
        // const url = window.URL.createObjectURL(blob);
        // console.log(url);
        this.processedImageUrl = data.file;
      },
      error: (error) => {
        console.error('Error occurred while uploading the image:', error);
        // Handle errors here
      },
    });
  }

  onEraseProcessedImage() {
    this.processedImageUrl = '';
    this.selectFiles!;
  }
}
