import { Component, inject } from '@angular/core';

import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toasts" aria-live="polite">
      @for (toast of notifications.toasts(); track toast.id) {
        <div class="toast" [class]="'toast toast-' + toast.kind" role="status">
          <span>{{ toast.text }}</span>
          <button type="button" aria-label="Close" (click)="notifications.dismiss(toast.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: `
    .toasts { position: fixed; top: 16px; right: 16px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; max-width: min(380px, calc(100vw - 32px)); }
    .toast { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border-radius: 10px; color: #fff; font-size: 14px; line-height: 1.4; box-shadow: 0 6px 20px rgba(0,0,0,.18); }
    .toast span { flex: 1; }
    .toast button { background: none; border: 0; color: inherit; font-size: 18px; line-height: 1; cursor: pointer; opacity: .8; }
    .toast-success { background: #2d5016; }
    .toast-error { background: #b42318; }
    .toast-info { background: #344054; }
  `
})
export class ToastContainer {
  readonly notifications = inject(NotificationService);
}
