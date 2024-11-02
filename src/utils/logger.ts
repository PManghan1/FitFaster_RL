type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  enableConsole?: boolean;
  minLevel?: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export class Logger {
  private namespace: string;
  private enableConsole: boolean;
  private minLevel: LogLevel;

  constructor(namespace: string, options: LoggerOptions = {}) {
    this.namespace = namespace;
    this.enableConsole = options.enableConsole ?? __DEV__;
    this.minLevel = options.minLevel ?? 'debug';
  }

  private shouldLog(level: LogLevel): boolean {
    return this.enableConsole && LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, error?: unknown): string {
    const timestamp = new Date().toISOString();
    const errorStr = error
      ? `\n${error instanceof Error ? error.stack : JSON.stringify(error)}`
      : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.namespace}] ${message}${errorStr}`;
  }

  debug(message: string, error?: unknown): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, error));
    }
  }

  info(message: string, error?: unknown): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, error));
    }
  }

  warn(message: string, error?: unknown): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, error));
    }
  }

  error(message: string, error?: unknown): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, error));
    }
  }
}

export function createLogger(namespace: string, options?: LoggerOptions): Logger {
  return new Logger(namespace, options);
}
