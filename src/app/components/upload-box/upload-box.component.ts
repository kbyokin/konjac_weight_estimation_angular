import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-upload-box',
  templateUrl: './upload-box.component.html',
  styleUrls: ['./upload-box.component.scss'],
})
export class UploadBoxComponent {
  selectedFile!: File;
  url!: string;
  isLoading = false;

  @Output() onUploadChange = new EventEmitter()

  selectFiles(event: any) {
    this.isLoading = true;
    this.selectedFile = event.target.files[0] as File;
    console.log(this.selectedFile);
    const reader = new FileReader();
    reader.onload = () => {
      this.url = reader.result as string;
      this.onUploadChange.emit(this.selectedFile);
    };
    reader.readAsDataURL(this.selectedFile);
    this.isLoading = false;
  }

  onEraseProcessedImage() {
    this.url = '';
    this.selectedFile!;
    console.log(this.selectedFile);
  }
}
