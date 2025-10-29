import { Injectable } from '@angular/core';
import { scan } from 'qr-scanner-wechat';

@Injectable({
  providedIn: 'root',
})
export class QrReaderService {
  async readFromFile(file: File): Promise<string | null> {
    const imageData = await this.extractImageData(file);

    try {
      const result = await scan({
        data: imageData.data,
        width: imageData.width,
        height: imageData.height,
      });

      return result?.text ?? null;
    } catch (error) {
      console.error('QR scan failed', error);
      throw error;
    }
  }

  private async extractImageData(file: File): Promise<ImageData> {
    const dataUrl = await this.readFileAsDataUrl(file);
    const image = await this.loadImageElement(dataUrl);

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Unable to get 2D context for QR decoding');
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return context.getImageData(0, 0, canvas.width, canvas.height);
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error ?? new Error('Failed to read file for QR decoding'));

      reader.readAsDataURL(file);
    });
  }

  private loadImageElement(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load image for QR decoding'));

      image.src = src;
    });
  }
}
