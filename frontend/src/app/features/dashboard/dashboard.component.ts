import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { map } from 'rxjs';

import { MaterialService } from '../materials/material.service';
import { DashboardService } from './dashboard.service';

const STATUS_COLORS = { new: '#94a3b8', pending: '#f59e0b', batched: '#16a34a' };
const LOW_STOCK_COUNT = 10;

@Component({
  selector: 'app-dashboard',
  imports: [BaseChartDirective, MatIconModule, MatProgressBarModule, RouterLink],
  //registered here rather than app wide, so chart.js is only downloaded when the dashboard opens
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  protected readonly summary = toSignal(inject(DashboardService).summary());

  //the materials with the least stock, the ones most likely to hold spools back
  private readonly lowestStock = toSignal(
    inject(MaterialService)
      .list('', { page: 0, size: LOW_STOCK_COUNT, sort: { active: 'quantity', direction: 'asc' } })
      .pipe(map(page => page.content))
  );

  protected readonly cards = computed(() => {
    const summary = this.summary();
    if (!summary) {
      return [];
    }
    return [
      { label: 'Total ISOs', value: summary.totalIsos, icon: 'description', link: '/isos', query: {} },
      { label: 'Total spools', value: summary.totalSpools, icon: 'plumbing', link: '/spools', query: {} },
      { label: 'Available materials', value: summary.availableMaterials, icon: 'inventory_2', link: '/materials', query: {} },
      { label: 'Generated batches', value: summary.generatedBatches, icon: 'precision_manufacturing', link: '/batches', query: {} },
      {
        label: 'Pending spools', value: summary.pendingSpools, icon: 'pending', link: '/spools',
        query: { status: 'PENDING_MATERIAL' }, warning: summary.pendingSpools > 0
      }
    ];
  });

  protected readonly statusChart = computed<ChartConfiguration<'doughnut'>['data'] | null>(() => {
    const summary = this.summary();
    if (!summary) {
      return null;
    }
    return {
      labels: ['New', 'Pending material', 'Batched'],
      datasets: [{
        data: [summary.newSpools, summary.pendingSpools, summary.batchedSpools],
        backgroundColor: [STATUS_COLORS.new, STATUS_COLORS.pending, STATUS_COLORS.batched]
      }]
    };
  });

  protected readonly stockChart = computed<ChartConfiguration<'bar'>['data'] | null>(() => {
    const materials = this.lowestStock();
    if (!materials) {
      return null;
    }
    return {
      labels: materials.map(material => material.code),
      datasets: [{
        label: 'In stock',
        data: materials.map(material => material.quantity),
        backgroundColor: materials.map(material => material.quantity === 0 ? '#dc2626' : '#2563eb'),
        borderRadius: 4,
        //keeps out of stock materials visible as a thin red bar instead of no bar at all
        minBarLength: 4
      }]
    };
  });

  protected readonly statusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  protected readonly stockChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
  };
}
