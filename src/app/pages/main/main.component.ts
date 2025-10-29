import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { ImageUploadService } from 'src/app/services/image-upload.service';
import { ImageService } from 'src/app/services/image.service';
import { UploadBoxComponent } from 'src/app/components/upload-box/upload-box.component';
import { QrReaderService } from 'src/app/services/qr-reader.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, OnDestroy {
  qrcodeSize: Number = 15;
  uploadFile: File | null = null;
  results: any;
  isLoading: boolean = false;
  imageUrl: any;
  resImage: any;
  resWeight: number[] = [];
  foundQR: any;
  qrDecodedText: string | null = null;
  qrDecodeError: string | null = null;
  isQrDecoding: boolean = false;

  selectedMode: string = '1';
  minSlider: number = 200;
  maxSlider: number = 2000;
  sizeMin: number = 300;
  sizeMax: number = 1500;

  sizeCategory = ['小', '中', '大', '外'];

  sizeRanges: { min: number; max: number } = {
    min: this.sizeMin,
    max: this.sizeMax
  }

  subscription: any;
  everyfivesecond: Observable<number> = timer(0, 1000);

  @ViewChild('uploadBox') uploadBoxComponent?: UploadBoxComponent;

  constructor(
    private imageUploadService: ImageUploadService,
    private imageService: ImageService,
    private qrReaderService: QrReaderService
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // console.log(this.uploadFile);

    // this.getImage();
    this.subscription = this.everyfivesecond.subscribe(() => {
      // this.getImage();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSliderChange(event: any, side: string) {
    if (side === 'min') {
      this.sizeMin = event;
    } else {
      this.sizeMax = event;
    }

    this.sizeRanges = {
      min: this.sizeMin,
      max: this.sizeMax,
    };
  }

  onUploadFileChange(event: any) {
    // console.log(event);
    this.uploadFile = event as File;
    this.qrDecodedText = null;
    this.qrDecodeError = null;
    this.foundQR = null;
    if (this.uploadFile && this.selectedMode === '1') {
      this.decodeQrFromFile(this.uploadFile);
    }
    // this.onReset();
  }

  formatLabel(value: number): string {
    return `${value}`;
  }

  getImage(): void {
    this.imageService.getImage().subscribe(
      (data: Blob) => {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          this.imageUrl = event.target.result;
        };
        reader.readAsDataURL(data);
      },
      (error) => {
        this.imageUrl = '';
        console.error('Error fetching image:', error);
      }
    );
  }

  displayImage(imageData: string): string {
    return `data:image/jpeg;base64,${imageData}`;
  }

  onModeChange(event: any) {
    this.selectedMode = event.value;
    if (this.selectedMode !== '1') {
      this.qrDecodedText = null;
      this.qrDecodeError = null;
      this.isQrDecoding = false;
    } else if (this.uploadFile) {
      this.decodeQrFromFile(this.uploadFile);
    }
  }

  onQRcodeSizeChange(event: any) {
    const inputElement = event.target as HTMLInputElement;
    const newValue = inputElement.value;
    this.qrcodeSize = Number(newValue);
  }

  get submitDisabled(): boolean {
    if (!this.uploadFile) {
      return true;
    }

    if (this.selectedMode === '1') {
      if (this.isQrDecoding) {
        return true;
      }

      if (this.qrDecodeError) {
        return true;
      }

      return !this.qrDecodedText;
    }

    return false;
  }

  onSubmit() {
    if (!this.uploadFile) {
      return;
    }
    console.log('qrsize', this.qrcodeSize);
    this.isLoading = true;
    this.imageUploadService
      .uploadImage(this.uploadFile, this.qrcodeSize)
      .subscribe({
        next: (data) => {
          console.log(data.info);
          // const blob = new Blob([data.file], { type: 'image/png' });
          // const url = window.URL.createObjectURL(blob);
          // console.log(url);
          this.results = data.file;
          this.resImage = data.image;
          this.resWeight = data.info?.weights ?? [];
          console.log('response data', this.resWeight);
          this.foundQR = data.info.info;
          if (!this.qrDecodedText && this.foundQR && this.foundQR !== 'qr not found') {
            this.qrDecodeError = null;
            this.qrDecodedText = this.foundQR;
          }
          if (!this.qrDecodedText && this.foundQR === 'qr not found') {
            this.qrDecodeError = 'QR code not found in the uploaded image.';
          }
          if (this.foundQR == 'qr not found') {
            alert(this.foundQR);
            this.resImage = '';
          }
          this.isLoading = !this.isLoading;
        },
        error: (error) => {
          console.error('Error occurred while uploading the image:', error);
          // Handle errors here
        },
      });
  }

  onReset() {
    this.resImage = ''
    this.resWeight = []
    this.imageUrl = ''
    this.uploadFile = null
    this.qrDecodedText = null
    this.qrDecodeError = null
    this.isQrDecoding = false
    this.foundQR = null
    this.uploadBoxComponent?.reset()
    this.isLoading = false
  }

  private decodeQrFromFile(file: File) {
    this.isQrDecoding = true;
    this.qrReaderService
      .readFromFile(file)
      .then((text) => {
        if (text) {
          this.qrDecodedText = text;
          this.qrDecodeError = null;
        } else {
          this.qrDecodedText = null;
          this.qrDecodeError = 'QR code not found in the uploaded image.';
        }
      })
      .catch((error) => {
        console.error('Failed to decode QR code', error);
        this.qrDecodedText = null;
        this.qrDecodeError = 'Failed to decode QR code.';
      })
      .finally(() => {
        this.isQrDecoding = false;
      });
  }
}
