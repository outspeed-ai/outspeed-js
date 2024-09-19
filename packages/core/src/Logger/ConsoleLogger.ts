import { Logger } from "./Logger"

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * Implementation of the Logger that logs messages to the console.
 */
export class ConsoleLogger extends Logger {
  private static instance: ConsoleLogger | null = null;
  private static logLevel: LogLevel = LogLevel.INFO;

  private constructor() {
    super();
  }

  /**
   * Gets the singleton instance of ConsoleLogger.
   * @returns {ConsoleLogger} The singleton instance.
   */
  public static getLogger(): ConsoleLogger {
    if (!ConsoleLogger.instance) {
      ConsoleLogger.instance = new ConsoleLogger();
    }
    return ConsoleLogger.instance;
  }

  /**
   * Sets the log level for the logger.
   * @param {LogLevel} level - The log level to set.
   */
  public static setLogLevel(level: LogLevel): void {
    ConsoleLogger.logLevel = level;
  }

  /**
   * Logs a debug message with the given label to the console.
   * @param {string} label - The label associated with the log message.
   * @param {...unknown[]} message - The message or data to log.
   */
  public debug(label: string, ...message: unknown[]): void {
    if (ConsoleLogger.logLevel <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${label}:`, ...message);
    }
  }

  /**
   * Logs an informational message with the given label to the console.
   * @param {string} label - The label associated with the log message.
   * @param {...unknown[]} message - The message or data to log.
   */
  public info(label: string, ...message: unknown[]): void {
    if (ConsoleLogger.logLevel <= LogLevel.INFO) {
      console.log(`[INFO] ${label}:`, ...message);
    }
  }

  /**
   * Logs a warning message with the given label to the console.
   * @param {string} label - The label associated with the warning message.
   * @param {...unknown[]} message - The warning message or data to log.
   */
  public warn(label: string, ...message: unknown[]): void {
    if (ConsoleLogger.logLevel <= LogLevel.WARN) {
      console.warn(`[WARN] ${label}:`, ...message);
    }
  }

  /**
   * Logs an error message with the given label to the console.
   * @param {string} label - The label associated with the error message.
   * @param {...unknown[]} message - The error message or data to log.
   */
  public error(label: string, ...message: unknown[]): void {
    if (ConsoleLogger.logLevel <= LogLevel.ERROR) {
      console.error(`[ERROR] ${label}:`, ...message);
    }
  }
}