import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'konjac_web_app';
  statusText!: string;

  onStatusChange(event: any) {
    this.statusText = event
  }
}
