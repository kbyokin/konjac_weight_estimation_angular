import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { HighchartsChartModule } from 'highcharts-angular';
import * as histogram from 'highcharts/modules/histogram-bellcurve';
import { ChartModule, HIGHCHARTS_MODULES } from 'angular-highcharts';

/** Angular Material */
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';

/** Components */
import { MainComponent } from './pages/main/main.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { UploadBoxComponent } from './components/upload-box/upload-box.component';
import { SizeRangeComponent } from './components/size-range/size-range.component';
import { ResultPageComponent } from './pages/main/result-page/result-page.component';
import { ChartsComponent } from './components/charts/charts.component';


@NgModule({
  declarations: [
    AppComponent,
    SidenavComponent,
    MainComponent,
    UploadBoxComponent,
    SizeRangeComponent,
    ResultPageComponent,
    ChartsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    HttpClientModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatSliderModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    HighchartsChartModule,
    ChartModule,
  ],
  providers: [{ provide: HIGHCHARTS_MODULES, useFactory: () => [histogram] }],
  bootstrap: [AppComponent],
})
export class AppModule {}
