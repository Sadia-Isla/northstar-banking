import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, GetRowIdParams, GridApi, GridReadyEvent, ICellRendererParams, ModuleRegistry } from 'ag-grid-community';
import { BankingService } from '../banking.service';
import { BankingSnapshot } from '../banking.models';

ModuleRegistry.registerModules([AllCommunityModule]);

interface LiveGridRow {
  ticker: string;
  company: string;
  instrument: string;
  price: number;
  pnl: number;
  totalValue: number;
  timeline: number[];
  logoColor: string;
  logoText: string;
}

@Component({
  selector: 'app-insights-page',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  providers: [CurrencyPipe],
  template: `
    <section class="page-shell" *ngIf="snapshot as data; else loadingTpl">
      <div class="panel wide insights-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Advisory View</p>
            <h1>Insights</h1>
          </div>
          <span>Live market monitor</span>
        </div>

        <section class="live-grid-hero">
          <div>
            <p class="eyebrow">Streaming Grid</p>
            <h2>Live watchlist with continuously updating positions.</h2>
            <p>
              Market rows refresh automatically with moving price history, P&L shifts,
              and rolling total value updates.
            </p>
          </div>
          <div class="live-grid-summary">
            <strong>{{ liveRows.length }}</strong>
            <span>instruments</span>
            <p>{{ positiveCount }} positive movers · {{ negativeCount }} negative movers</p>
          </div>
        </section>

        <div class="live-grid-shell ag-theme-quartz">
          <ag-grid-angular
            class="live-market-grid"
            [rowData]="liveRows"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [getRowId]="getRowId"
            [animateRows]="true"
            [rowHeight]="56"
            [headerHeight]="52"
            [suppressCellFocus]="true"
            (gridReady)="onGridReady($event)">
          </ag-grid-angular>

          <div class="live-grid-footer">
            <div class="live-grid-footer-stats">
              <span>Rows: {{ liveRows.length }}</span>
              <span>Total Rows: {{ liveRows.length }}</span>
            </div>
            <div class="live-grid-footer-stats">
              <span>Positive P&L: {{ positiveCount }}</span>
              <span>Negative P&L: {{ negativeCount }}</span>
            </div>
          </div>
        </div>

        <div class="insight-grid">
          <article class="panel nested">
            <h2>Spending Mix</h2>
            <div class="metric-list">
              <div class="metric-row" *ngFor="let category of data.spendingCategories">
                <div>
                  <strong>{{ category.label }}</strong>
                  <p>{{ category.amount | currency }}</p>
                </div>
                <span>{{ category.percentage }}%</span>
              </div>
            </div>
          </article>

          <article class="panel nested">
            <h2>Market Watch</h2>
            <div class="metric-list">
              <div class="metric-row" *ngFor="let mover of data.marketMovers">
                <div>
                  <strong>{{ mover.symbol }}</strong>
                  <p>{{ mover.name }}</p>
                </div>
                <div class="row-meta">
                  <strong>{{ mover.price | currency }}</strong>
                  <span [class.positive]="mover.changePercent >= 0" [class.negative]="mover.changePercent < 0">
                    {{ mover.changePercent }}%
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <ng-template #loadingTpl>
      <section class="page-shell">
        <div class="loading-card">Loading insight data...</div>
      </section>
    </ng-template>
  `,
  styleUrl: './page-styles.css'
})
export class InsightsPageComponent implements OnInit, OnDestroy {
  snapshot?: BankingSnapshot;
  liveRows: LiveGridRow[] = [];
  private marketTimer?: ReturnType<typeof setInterval>;
  private gridApi?: GridApi<LiveGridRow>;

  readonly getRowId = (params: GetRowIdParams<LiveGridRow>): string => params.data.ticker;

  readonly defaultColDef: ColDef<LiveGridRow> = {
    sortable: true,
    resizable: true,
    suppressMovable: true
  };

  readonly columnDefs: ColDef<LiveGridRow>[] = [
    {
      headerName: 'Ticker',
      field: 'ticker',
      flex: 1.55,
      minWidth: 260,
      cellRenderer: (params: ICellRendererParams<LiveGridRow>) => this.renderTickerCell(params.data)
    },
    {
      headerName: 'Timeline',
      field: 'timeline',
      flex: 1.1,
      minWidth: 220,
      sortable: false,
      cellRenderer: (params: ICellRendererParams<LiveGridRow>) => this.renderTimelineCell(params.data)
    },
    {
      headerName: 'Instrument',
      field: 'instrument',
      width: 130
    },
    {
      headerName: 'P&L',
      field: 'pnl',
      width: 170,
      enableCellChangeFlash: true,
      cellRenderer: (params: ICellRendererParams<LiveGridRow>) => this.renderPnlCell(params.data)
    },
    {
      headerName: 'Total Value',
      field: 'totalValue',
      width: 180,
      enableCellChangeFlash: true,
      cellRenderer: (params: ICellRendererParams<LiveGridRow>) => this.renderTotalValueCell(params.data)
    }
  ];

  constructor(
    private bankingService: BankingService,
    private currencyPipe: CurrencyPipe
  ) {}

  ngOnInit(): void {
    this.bankingService.getOverview().subscribe(data => {
      this.snapshot = data;
      this.liveRows = this.buildLiveRows(data);
      this.startLiveUpdates();
    });
  }

  ngOnDestroy(): void {
    if (this.marketTimer) {
      clearInterval(this.marketTimer);
    }
  }

  get positiveCount(): number {
    return this.liveRows.filter(row => row.pnl >= 0).length;
  }

  get negativeCount(): number {
    return this.liveRows.filter(row => row.pnl < 0).length;
  }

  onGridReady(event: GridReadyEvent<LiveGridRow>): void {
    this.gridApi = event.api;
    event.api.sizeColumnsToFit();
  }

  private buildLiveRows(data: BankingSnapshot): LiveGridRow[] {
    const templates = [
      ['UBER', 'Uber Technologies Inc', 'Stock', '#111111', 'U'],
      ['XLF', 'Financial Select Sector SPDR Fund', 'ETF', '#406b53', 'X'],
      ['MRNA', 'Moderna Inc', 'Stock', '#b71c4a', 'M'],
      ['VYM', 'Vanguard High Dividend Yield ETF', 'ETF', '#9d1d24', 'V'],
      ['GER30Y', 'Germany 30-Year Government Bond', 'Bond', '#3f85c5', 'G'],
      ['KO', 'Coca-Cola Co', 'Stock', '#f15a24', 'K'],
      ['GOOGL', 'Alphabet Inc', 'Stock', '#4285f4', 'G'],
      ['TLH', 'iShares 10-20 Year Treasury Bond ETF', 'ETF', '#79b92c', 'T'],
      ['SPY', 'S&P 500 ETF', 'ETF', '#0a4d97', 'S'],
      ['QQQ', 'Nasdaq 100 ETF', 'ETF', '#1f5aa8', 'Q'],
      ['BND', 'Total Bond Market', 'Bond', '#5f7288', 'B'],
      ['GLD', 'Gold Trust', 'ETF', '#caa436', 'G']
    ] as const;

    return templates.map((template, index) => {
      const marketMover = data.marketMovers[index % data.marketMovers.length];
      const basePrice = Number(marketMover.price) + index * 17.35;
      const pnl = Number(marketMover.changePercent) * (index % 2 === 0 ? 34 : -28);
      const totalValue = 750 + index * 345 + Math.abs(pnl) * 21;

      return {
        ticker: template[0],
        company: template[1],
        instrument: template[2],
        logoColor: template[3],
        logoText: template[4],
        price: Number(basePrice.toFixed(2)),
        pnl: Number(pnl.toFixed(2)),
        totalValue: Number(totalValue.toFixed(2)),
        timeline: this.createTimeline(index)
      };
    });
  }

  private createTimeline(seed: number): number[] {
    return Array.from({ length: 24 }, (_, index) =>
      18 + ((seed * 11 + index * 7) % 52)
    );
  }

  private startLiveUpdates(): void {
    if (this.marketTimer) {
      clearInterval(this.marketTimer);
    }

    this.marketTimer = setInterval(() => {
      this.liveRows = this.liveRows.map((row, index) => {
        const drift = ((index % 3) - 1) * 0.24;
        const swing = (((Date.now() / 1000) + index) % 5 - 2) * 0.14;
        const nextPrice = Number((row.price + drift + swing).toFixed(2));
        const nextPnl = Number((row.pnl + drift * 10 + swing * 8).toFixed(2));
        const nextValue = Number((row.totalValue + nextPnl * 1.4).toFixed(2));
        const nextTimeline = [
          ...row.timeline.slice(1),
          Math.max(12, Math.min(78, row.timeline[row.timeline.length - 1] + Math.round((Math.random() - 0.5) * 20)))
        ];

        return {
          ...row,
          price: nextPrice,
          pnl: nextPnl,
          totalValue: nextValue,
          timeline: nextTimeline
        };
      });

      this.gridApi?.flashCells({
        columns: ['pnl', 'totalValue'],
        flashDuration: 650,
        fadeDuration: 450
      });
    }, 1400);
  }

  private renderTickerCell(row?: LiveGridRow): string {
    if (!row) {
      return '';
    }

    return `
      <div class="ticker-cell">
        <span class="ticker-badge" style="background:${row.logoColor}">${row.logoText}</span>
        <div class="ticker-copy">
          <strong>${row.ticker}</strong>
          <span>${row.company}</span>
        </div>
      </div>
    `;
  }

  private renderTimelineCell(row?: LiveGridRow): string {
    if (!row) {
      return '';
    }

    const bars = row.timeline
      .map(value => `<span class="timeline-bar" style="height:${value}%"></span>`)
      .join('');

    return `<div class="timeline-cell">${bars}</div>`;
  }

  private renderPnlCell(row?: LiveGridRow): string {
    if (!row) {
      return '';
    }

    const changeClass = row.pnl >= 0 ? 'positive' : 'negative';
    const arrow = row.pnl >= 0 ? '&uarr;' : '&darr;';

    return `
      <div class="pnl-cell">
        <span class="${changeClass}">${arrow} ${Math.abs(row.pnl).toFixed(2)}</span>
        <span class="pnl-pill">${Math.abs((row.pnl / Math.max(row.price, 1)) * 100).toFixed(2)}</span>
      </div>
    `;
  }

  private renderTotalValueCell(row?: LiveGridRow): string {
    if (!row) {
      return '';
    }

    const totalValue = this.currencyPipe.transform(row.totalValue, 'USD', 'symbol', '1.0-0') ?? `$${row.totalValue}`;
    const price = this.currencyPipe.transform(row.price, 'USD', 'symbol', '1.2-2') ?? `$${row.price}`;

    return `
      <div class="value-cell">
        <span>${price}</span>
        <strong class="value-pill">${totalValue}</strong>
      </div>
    `;
  }
}
