import { Component } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
@Component({
  selector: 'app-dashboard-info',
  templateUrl: './dashboard-info.component.html',
  styleUrl: './dashboard-info.component.scss',
})
export class DashboardInfoComponent {
  private revenueChart?: Chart;
  private profileChart?: Chart;

  ngOnInit(): void {
    this.initializeCharts();
  }

  ngOnDestroy(): void {
    this.revenueChart?.destroy();
    this.profileChart?.destroy();
  }

  private initializeCharts(): void {
    this.initRevenueChart();
    this.initProfileChart();
  }

  private initRevenueChart(): void {
    const ctx = document.getElementById('totalRevenueChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.revenueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: '2024',
            data: [15, 5, 12, 25, 15, 10, 7],
            backgroundColor: 'rgba(105, 108, 255, 0.8)',
            borderRadius: 4,
          },
          {
            label: '2023',
            data: [-12, -18, -8, -15, -5, -15, -12],
            backgroundColor: 'rgba(3, 195, 236, 0.8)',
            borderRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  private initProfileChart(): void {
    const ctx = document.getElementById('profileReportChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.profileChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Sales Trend',
          data: [50, 40, 60, 75, 65, 70],
          borderColor: '#ffab00',
          backgroundColor: 'rgba(255, 171, 0, 0.1)',
          fill: true,
          tension: 0.4,
          pointStyle: 'circle',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              stepSize: 20
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
}
