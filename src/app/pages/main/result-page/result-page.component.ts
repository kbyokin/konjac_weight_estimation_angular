import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsService } from 'src/app/services/highcharts.service';

@Component({
  selector: 'app-result-page',
  templateUrl: './result-page.component.html',
})
export class ResultPageComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  constructor(private hcs: HighchartsService) {}

  data = [1, 2, 3, 4];

  chartOptions: Highcharts.Options = {
    series: [
      {
        type: 'line',
        data: this.data,
      },
    ],
  };

  ngOnInit(): void {}
}
