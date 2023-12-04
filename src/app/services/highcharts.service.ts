import { Injectable } from '@angular/core';
import * as Highcharts from 'highcharts';

@Injectable()
export class HighchartsService {
  charts = [];
  defaultOptions = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie',
    },
    title: {
      text: 'Browser market shares in January, 2018',
    },
    tooltip: {
      pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>',
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          style: {
            color:
              //   (Highcharts.theme && Highcharts.theme.contrastTextColor) ||
              'black',
          },
        },
        showInLegend: true,
      },
    },
    series: [
      {
        name: 'Brands',
        colorByPoint: true,
        data: [
          {
            name: 'Chrome',
            y: 61.41,
          },
          {
            name: 'Internet Explorer',
            y: 11.84,
          },
          {
            name: 'Firefox',
            y: 10.85,
          },
          {
            name: 'Edge',
            y: 4.67,
          },
          {
            name: 'Safari',
            y: 4.18,
          },
          {
            name: 'Other',
            y: 2.61,
          },
        ],
      },
    ],
  };

  constructor() {}

  getOptions() {
    return this.defaultOptions;
  }

  //   createChart(container: any, options?: Object) {
  //     let opts = this.defaultOptions;
  //     console.log(opts);
  //     let e = document.createElement('div');

  //     container.appendChild(e);

  //     if (opts.chart) {
  //       // opts.chart['renderTo'] = e;
  //     }
  //     Highcharts.chart(container, this.defaultOptions);
  //   }
}
