import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-support-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <div class="panel wide">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Client Services</p>
            <h1>Support & Guidance</h1>
          </div>
          <span>Available 24/7</span>
        </div>

        <div class="support-grid">
          <article class="support-card">
            <h2>Dedicated Advisor</h2>
            <p>Book a portfolio review, discuss liquidity planning, or prepare for quarter-end cash flow needs.</p>
            <a href="#">Schedule a meeting</a>
          </article>
          <article class="support-card">
            <h2>Security Center</h2>
            <p>Review travel notices, device approvals, and identity protection controls across your accounts.</p>
            <a href="#">Open security dashboard</a>
          </article>
          <article class="support-card">
            <h2>Document Vault</h2>
            <p>Access statements, tax documents, and secure client correspondence in one place.</p>
            <a href="#">View documents</a>
          </article>
        </div>
      </div>
    </section>
  `,
  styleUrl: './page-styles.css'
})
export class SupportPageComponent {}
