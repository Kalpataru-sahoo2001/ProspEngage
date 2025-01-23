
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-container">
      <h2>Registration Status</h2>
      
      <div class="status-card">
        <div class="status-icon pending">
          <i class="status-symbol"></i>
        </div>
        
        <div class="status-badge pending">
          PENDING
        </div>

        <div class="status-details">       
          <div class="status-message pending">
            Your registration is being reviewed by our team
          </div>
        </div>
      </div>
    </div>
  `,
  // Keep the existing styles from your current component
  styles: [`
    .status-container {
      background: #ffffff;
      width: 100%;
      max-width: 500px;
      text-align: center;
      margin: 2rem auto;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                  0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border-radius: 12px;
    }

    h2 {
      color: #1e293b;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
    }

    .status-card {
      background: #f8fafc;
      border-radius: 8px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .status-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .status-icon.pending {
      background-color: #fef3c7;
    }

    .status-symbol::before {
      font-family: Arial, sans-serif;
      font-size: 2rem;
      content: "⏳";
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-badge.pending {
      background-color: #fef3c7;
      color: #92400e;
    }

    .status-details {
      text-align: center;
      margin-top: 1rem;
    }

    .status-message {
      font-size: 1rem;
      line-height: 1.5;
      margin-top: 0.5rem;
    }

    .status-message.pending {
      color: #92400e;
    }
  `]
})
export class RegistrationStatusComponent {
  @Input() registrationId: string = '';
}