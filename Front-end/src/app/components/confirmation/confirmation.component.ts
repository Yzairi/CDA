import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConfirmationService, ConfirmationData } from '../../services/confirmation.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirmation-container" *ngIf="confirmations.length > 0">
      <div class="confirmation-overlay"></div>
      <div class="confirmation-modal" *ngFor="let confirmation of confirmations">
        <div class="confirmation-header" [ngClass]="'confirmation-' + confirmation.type">
          <h3>{{ confirmation.title }}</h3>
        </div>
        <div class="confirmation-body">
          <p>{{ confirmation.message }}</p>
        </div>
        <div class="confirmation-footer">
          <button 
            class="btn btn-cancel" 
            (click)="onCancel(confirmation.id)">
            {{ confirmation.cancelText }}
          </button>
          <button 
            class="btn btn-confirm" 
            [ngClass]="'btn-' + confirmation.type"
            (click)="onConfirm(confirmation.id)">
            {{ confirmation.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent implements OnInit, OnDestroy {
  confirmations: ConfirmationData[] = [];
  private subscription?: Subscription;

  constructor(private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
    this.subscription = this.confirmationService.confirmations$.subscribe(
      confirmations => this.confirmations = confirmations
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onConfirm(id: string): void {
    this.confirmationService.respond(id, true);
  }

  onCancel(id: string): void {
    this.confirmationService.respond(id, false);
  }
}
