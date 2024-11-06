import type {
  PerformanceAlert,
  AlertSeverity,
  AlertType,
  MetricThresholds,
} from '../../types/analytics';
import { analyticsService } from '../../services/analytics';

/**
 * Performance alerts system
 */
export class PerformanceAlerts {
  private alerts: PerformanceAlert[] = [];
  private thresholds: MetricThresholds = {
    memory: {
      warning: 75, // 75% usage
      critical: 90, // 90% usage
    },
    api: {
      warning: 1000, // 1s
      critical: 3000, // 3s
    },
    frame: {
      warning: 30, // 30 FPS
      critical: 20, // 20 FPS
    },
    interaction: {
      warning: 100, // 100ms
      critical: 300, // 300ms
    },
  };

  /**
   * Create a new performance alert
   */
  createAlert(
    type: AlertType,
    severity: AlertSeverity,
    message: string,
    metric?: Record<string, unknown>
  ): void {
    const alert: PerformanceAlert = {
      id: `${type}_${Date.now()}`,
      type,
      severity,
      message,
      timestamp: Date.now(),
      metric,
    };

    this.alerts.push(alert);
    this.handleAlert(alert);
  }

  /**
   * Handle performance alert
   */
  private handleAlert(alert: PerformanceAlert): void {
    switch (alert.severity) {
      case 'critical':
        console.error(`Critical performance alert: ${alert.message}`, alert.metric);
        break;
      case 'warning':
        console.warn(`Performance warning: ${alert.message}`, alert.metric);
        break;
      case 'info':
        console.info(`Performance info: ${alert.message}`, alert.metric);
        break;
    }

    // Emit to analytics service
    void this.emitAlert(alert);
  }

  /**
   * Check if metric exceeds thresholds
   */
  checkThresholds(type: AlertType, value: number): AlertSeverity | null {
    const threshold = this.thresholds[type];
    if (!threshold) return null;

    if (value >= threshold.critical) {
      return 'critical';
    } else if (value >= threshold.warning) {
      return 'warning';
    }

    return null;
  }

  /**
   * Update performance thresholds
   */
  updateThresholds(newThresholds: Partial<MetricThresholds>): void {
    this.thresholds = {
      ...this.thresholds,
      ...newThresholds,
    };
  }

  /**
   * Emit alert to analytics service
   */
  private async emitAlert(alert: PerformanceAlert): Promise<void> {
    try {
      await analyticsService.trackError(
        {
          sessionId: `alert_${alert.id}`,
          platform: 'react-native',
          appVersion: '1.0.0',
          deviceInfo: {
            os: 'unknown',
            version: 'unknown',
            model: 'unknown',
          },
          performanceMetrics: alert.metric as Record<string, number>,
          message: alert.message,
        },
        {
          type: alert.type,
          severity: alert.severity,
          timestamp: alert.timestamp,
        }
      );
    } catch (error) {
      console.error('Failed to emit performance alert:', error);
    }
  }

  /**
   * Get recent alerts
   */
  getAlerts(limit = 100): PerformanceAlert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Clear alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }
}

export const performanceAlerts = new PerformanceAlerts();
