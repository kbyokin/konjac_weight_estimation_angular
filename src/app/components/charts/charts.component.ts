import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import * as Highcharts from 'highcharts';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],
})
export class ChartsComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('histogramCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() weightData: number[] = [];
  @Input() sizeRange: { min: number; max: number } | null = null;
  @Input() binCount: number = 20;
  @Input() title: string = 'ヒスとグラム';
  @Input() xAxisLabel: string = '重さ (g)';
  @Input() yAxisLabel: string = '回数';
  @Input() minChartHeight: number | null = 320;
  private chart: any;
  Highcharts: typeof Highcharts = Highcharts;
  updateFlag = false;

  histOptions: any;
  pieOptions: any;

  weightData_ = [];

  dataWithRange = [
    {
      name: '小',
      y: 0,
    },
    {
      name: '中',
      y: 0,
    },
    {
      name: '大',
      y: 0,
    },
    {
      name: '外',
      y: 0,
    },
  ];

  points = [
    1676.1812417701028, 1676.1812417701028, 1355.5248951409044,
    1300.1975598298402, 1451.9838457352023, 1515.2823970266534,
    1204.1907585554318, 1706.313984320565, 1076.315148179886,
    1355.5248951409044, 678.642673242776, 1617.0165613410927,
    1355.5248951409044, 1515.2823970266534, 1950.7467215325676,
    1706.313984320565, 1300.1975598298402, 1946.3992878226843,
    1205.6958522763787, 1083.7481488478738, 481.03366360928874,
    1171.7012072216642, 1076.315148179886, 364.5272297044688, 992.8825300353568,
    1204.1907585554318, 1083.7481488478738, 481.03366360928874,
    1171.7012072216642, 1076.315148179886, 364.5272297044688, 992.8825300353568,
    1204.1907585554318, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 50,
    23, 23, 11, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34,
  ];

  private sanitizedWeights: number[] = [];

  ngOnInit(): void {
    this.prepareData();
  }

  ngAfterViewInit(): void {
    this.refreshCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['weightData'] || changes['sizeRange']) {
      this.prepareData();
      this.refreshCharts();
    }
  }

  private prepareData(): void {
    const rawData = Array.isArray(this.weightData) ? this.weightData : [];
    this.sanitizedWeights = rawData
      .map((value) => Number(value))
      .filter((value) => !Number.isNaN(value) && Number.isFinite(value));

    this.dataWithRange = this.filterData();
    this.histOptions = this.getHistOptions(this.sanitizedWeights);
    this.pieOptions = this.getPieOptions(this.dataWithRange);
    this.updateFlag = !this.updateFlag;
  }

  private refreshCharts(): void {
    if (!this.canvasRef) {
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.createChart(this.sanitizedWeights);
  }

  private createChart(data: number[]): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // Calculate histogram bins with fixed bin size of 100
    // const min = Math.floor(Math.min(...data) / 100) * 100;
    // const max = Math.ceil(Math.max(...data) / 100) * 100;
    const min = 0;
    const max = 2000;
    const binWidth = 100;
    const binCount = Math.ceil((max - min) / binWidth);
    const bins = Array(binCount).fill(0);

    // Count frequencies
    data.forEach((value: any) => {
      const binIndex = Math.floor((value - min) / binWidth);
      if (binIndex >= 0 && binIndex < binCount) {
        bins[binIndex]++;
      }
    });

    console.log('bins', bins);

    // Generate bin labels
    const labels = Array(binCount)
      .fill(0)
      .map((_, i) => {
        const start = (min + i * binWidth).toFixed(1);
        const end = (min + (i + 1) * binWidth).toFixed(1);
        return `${Number(start)} - ${Number(end)}`;
      });

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Frequency',
            data: bins,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 12,
            right: 16,
            bottom: 8,
            left: 8,
          },
        },
        plugins: {
          title: {
            display: true,
            text: this.title,
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: this.xAxisLabel,
            },
          },
          y: {
            title: {
              display: true,
              text: this.yAxisLabel,
            },
            beginAtZero: true,
            ticks: { mirror: true },
          },
          // yAxes: [{ ticks: { mirror: true } }],
        },
      },
    });

    if (this.minChartHeight) {
      const parentElement = this.canvasRef.nativeElement.parentElement as HTMLElement | null;
      if (parentElement) {
        parentElement.style.minHeight = `${this.minChartHeight}px`;
      }
    }
  }

  filterData() {
    const range = this.sizeRange ?? { min: 0, max: 0 };
    const dataset = this.sanitizedWeights;

    const small_konjac = dataset.filter((weight: number) => weight < range.min);
    const medium_konjac = dataset.filter(
      (weight: number) => weight >= range.min && weight <= range.max
    );
    const large_konjac = dataset.filter(
      (weight: number) => weight > range.max && weight <= 2000
    );
    const super_large_konjac = dataset.filter((weight: number) => weight > 2000);
    const data = [
      {
        name: '小',
        y: small_konjac.length,
      },
      {
        name: '中',
        y: medium_konjac.length,
      },
      {
        name: '大',
        y: large_konjac.length,
      },
      {
        name: '外',
        y: super_large_konjac.length,
      },
    ];
    return data;
  }

  getHistOptions_(data: any) {
    const histChartOptions: Highcharts.Options = {
      title: {
        text: 'ヒストグラム',
      },
      xAxis: [
        {
          title: { text: 'Data Range' },
          alignTicks: false,
        },
      ],
      yAxis: [
        {
          // Left axis for histogram counts
          title: { text: 'Frequency' },
          min: 0, // Starts at 0 for counts
        },
        // {
        //   // Right axis for scatter data scale
        //   title: { text: 'Data Values' },
        //   opposite: true,
        //   min: 300, // Set based on the minimum scatter value
        // },
      ],
      series: [
        {
          name: 'Histogram',
          type: 'histogram',
          xAxis: 0,
          yAxis: 0,
          baseSeries: 'data',
          binWidth: 100, // Bin size
        },
        // {
        //   name: 'Data',
        //   type: 'scatter',
        //   xAxis: 0,
        //   yAxis: 1, // Uses the second Y-axis
        //   visible: false,
        //   data: data, // Generate random data for demonstration
        //   id: 'data',
        // },
      ],
    };
    return histChartOptions;
  }

  getHistOptions(data: any) {
    // console.log(data);
    const histChartOptions: Highcharts.Options = {
      title: {
        text: 'ヒストグラム',
      },

      xAxis: [
        {
          title: { text: 'Data' },
          alignTicks: false,
        },
        {
          title: { text: 'Histogram' },
          alignTicks: false,
          opposite: true,
        },
      ],

      yAxis: [
        {
          title: { text: 'Data' },
        },
        {
          title: { text: 'Histogram' },
          opposite: true,
        },
      ],

      plotOptions: {
        histogram: {
          accessibility: {
            point: {
              valueDescriptionFormat:
                '{index}. {point.x:.3f} to {point.x2:.3f}, {point.y}.',
            },
          },
        },
      },

      series: [
        {
          name: 'Histogram',
          type: 'histogram',
          xAxis: 1,
          yAxis: 1,
          baseSeries: 's1',
          zIndex: -1,
        },
        {
          name: 'Data',
          type: 'scatter',
          data: data,
          id: 's1',
          marker: {
            radius: 1.5,
          },
        },
      ],

      lang: {
        noData: 'No avaiable data.',
      },
    };
    return histChartOptions;
  }

  getPieOptions(data: any) {
    const pieChartOptions: Highcharts.Options = {
      chart: {
        type: 'pie',
      },
      series: [
        {
          type: 'pie',
          data: data,
        },
      ],
      // lang: {
      //   noData: 'No avaiable data.',
      // },
      title: {
        text: '比率',
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
              color: 'black',
            },
          },
          showInLegend: true,
        },
      },
    };

    return pieChartOptions;
  }
}
