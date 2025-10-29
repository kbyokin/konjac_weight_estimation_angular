import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-upload-box',
  templateUrl: './upload-box.component.html',
  styleUrls: ['./upload-box.component.scss'],
})
export class UploadBoxComponent {
  selectedFile: File | null = null;
  url: string | null = null;
  isLoading = false;

  @Output() onUploadChange = new EventEmitter()
  @ViewChild('browse') fileInput?: ElementRef<HTMLInputElement>;

  selectFiles(event: any) {
    this.isLoading = true;
    const file = event.target.files[0] as File | undefined;

    if (!file) {
      this.isLoading = false;
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.url = reader.result as string;
      this.onUploadChange.emit(this.selectedFile);
      this.isLoading = false;
      if (event.target) {
        event.target.value = '';
      }
    };
    reader.onerror = () => {
      this.reset();
      this.isLoading = false;
    };
    reader.readAsDataURL(file);
  }

  onEraseProcessedImage() {
    this.reset();
  }

  reset() {
    this.url = null;
    this.selectedFile = null;
    this.isLoading = false;
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
