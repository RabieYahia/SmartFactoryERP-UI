import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai';
import { ProductForecast } from '../../models/forecast.model';

@Component({
  selector: 'app-ai-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-dashboard.html',
  styleUrl: './ai-dashboard.css'
})
export class AiDashboardComponent {
  private aiService = inject(AiService);

  productId = signal<number | null>(null);
  forecast = signal<ProductForecast | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  async getForecast() {
    const id = this.productId();
    
    if (!id || id <= 0) {
      this.errorMessage.set('⚠️ Please enter a valid Product ID (must be greater than 0)');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.forecast.set(null);

    try {
      const result = await this.aiService.getForecast(id).toPromise();
      if (result) {
        this.forecast.set(result);
      } else {
        this.errorMessage.set('No forecast data available for this product.');
      }
    } catch (error: any) {
      console.error('Error fetching forecast:', error);
      
      // استخراج رسالة الخطأ من Backend
      let errorMsg = 'Failed to fetch forecast. Please try again.';
      
      if (error?.error?.message) {
        errorMsg = error.error.message;
      } else if (error?.message) {
        errorMsg = error.message;
      } else if (error?.status === 404) {
        errorMsg = `Product with ID ${id} not found in the system.`;
      } else if (error?.status === 400) {
        errorMsg = 'Invalid product ID provided.';
      } else if (error?.status === 500) {
        errorMsg = 'Server error occurred. Please contact support.';
      } else if (error?.status === 0) {
        errorMsg = 'Cannot connect to the server. Please check your connection.';
      }
      
      this.errorMessage.set(`❌ ${errorMsg}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  getAdviceClass(advice: string): string {
    const lowerAdvice = advice.toLowerCase();
    
    if (lowerAdvice.includes('high demand') || lowerAdvice.includes('stock up') || lowerAdvice.includes('🔥')) {
      return 'advice-increase';
    }
    if (lowerAdvice.includes('low demand') || lowerAdvice.includes('reduce') || lowerAdvice.includes('decrease')) {
      return 'advice-decrease';
    }
    return 'advice-maintain';
  }

  getAdviceIcon(advice: string): string {
    const lowerAdvice = advice.toLowerCase();
    
    if (lowerAdvice.includes('high demand') || lowerAdvice.includes('🔥')) {
      return 'bi-graph-up-arrow';
    }
    if (lowerAdvice.includes('low demand') || lowerAdvice.includes('📉')) {
      return 'bi-graph-down-arrow';
    }
    return 'bi-check-circle';
  }

  getDemandLevel(quantity: number): { label: string; color: string; icon: string } {
    if (quantity > 50) {
      return { label: 'Very High Demand', color: '#dc2626', icon: 'bi-fire' };
    } else if (quantity > 30) {
      return { label: 'High Demand', color: '#ea580c', icon: 'bi-arrow-up-circle-fill' };
    } else if (quantity > 15) {
      return { label: 'Moderate Demand', color: '#f59e0b', icon: 'bi-dash-circle-fill' };
    } else if (quantity > 5) {
      return { label: 'Low Demand', color: '#10b981', icon: 'bi-arrow-down-circle-fill' };
    } else {
      return { label: 'Very Low Demand', color: '#6b7280', icon: 'bi-x-circle-fill' };
    }
  }
}
