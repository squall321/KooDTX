/**
 * CSV Exporter - Enhanced CSV export with UTF-8 BOM, column selection, and date formatting
 *
 * Features:
 * - UTF-8 BOM for Excel compatibility
 * - Column selection
 * - Date format customization
 * - Large dataset streaming
 */

export interface CsvExportOptions {
  includeBOM?: boolean; // Add UTF-8 BOM for Excel
  columns?: string[]; // Selected columns to export
  dateFormat?: 'iso' | 'unix' | 'custom'; // Date format
  customDateFormat?: string; // Custom date format string
  delimiter?: string; // CSV delimiter (default: ',')
  includeHeaders?: boolean; // Include header row
  decimalSeparator?: string; // Decimal separator (default: '.')
}

export interface SensorDataPoint {
  timestamp: number;
  x: number;
  y: number;
  z: number;
  [key: string]: any;
}

export interface SessionData {
  sessionId: string;
  sessionName: string;
  startTime: number;
  endTime: number;
  accelerometer?: SensorDataPoint[];
  gyroscope?: SensorDataPoint[];
  gps?: Array<{timestamp: number; latitude: number; longitude: number; altitude?: number}>;
  audio?: {filename: string; duration: number};
  metadata?: Record<string, any>;
}

export class CsvExporter {
  private static readonly UTF8_BOM = '\uFEFF';

  /**
   * Export session data to CSV format
   */
  static async exportSession(
    sessionData: SessionData,
    sensorType: 'accelerometer' | 'gyroscope' | 'gps',
    options: CsvExportOptions = {}
  ): Promise<string> {
    const {
      includeBOM = true,
      columns,
      dateFormat = 'iso',
      delimiter = ',',
      includeHeaders = true,
      decimalSeparator = '.',
    } = options;

    const sensorData = sessionData[sensorType];
    if (!sensorData || sensorData.length === 0) {
      throw new Error(`No ${sensorType} data available`);
    }

    let csv = includeBOM ? this.UTF8_BOM : '';

    // Determine columns
    const availableColumns = this.getAvailableColumns(sensorType);
    const selectedColumns = columns || availableColumns;

    // Add headers
    if (includeHeaders) {
      csv += selectedColumns.join(delimiter) + '\n';
    }

    // Add data rows
    for (const dataPoint of sensorData) {
      const row = selectedColumns.map(column => {
        let value: any;

        if (column === 'timestamp') {
          value = this.formatDate(dataPoint.timestamp, dateFormat, options.customDateFormat);
        } else {
          value = dataPoint[column];
        }

        // Format numbers
        if (typeof value === 'number' && decimalSeparator !== '.') {
          value = value.toString().replace('.', decimalSeparator);
        }

        // Escape values containing delimiter or quotes
        if (typeof value === 'string' && (value.includes(delimiter) || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }

        return value ?? '';
      });

      csv += row.join(delimiter) + '\n';
    }

    return csv;
  }

  /**
   * Export all sensors to separate CSV files (returns map)
   */
  static async exportAllSensors(
    sessionData: SessionData,
    options: CsvExportOptions = {}
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    const sensors: Array<'accelerometer' | 'gyroscope' | 'gps'> = [
      'accelerometer',
      'gyroscope',
      'gps',
    ];

    for (const sensorType of sensors) {
      if (sessionData[sensorType] && sessionData[sensorType]!.length > 0) {
        try {
          const csv = await this.exportSession(sessionData, sensorType, options);
          results.set(sensorType, csv);
        } catch (error) {
          console.warn(`Failed to export ${sensorType}:`, error);
        }
      }
    }

    return results;
  }

  /**
   * Get available columns for sensor type
   */
  private static getAvailableColumns(sensorType: string): string[] {
    switch (sensorType) {
      case 'accelerometer':
      case 'gyroscope':
        return ['timestamp', 'x', 'y', 'z'];
      case 'gps':
        return ['timestamp', 'latitude', 'longitude', 'altitude'];
      default:
        return ['timestamp'];
    }
  }

  /**
   * Format date according to options
   */
  private static formatDate(
    timestamp: number,
    format: 'iso' | 'unix' | 'custom',
    customFormat?: string
  ): string {
    switch (format) {
      case 'iso':
        return new Date(timestamp).toISOString();
      case 'unix':
        return timestamp.toString();
      case 'custom':
        return customFormat
          ? this.applyCustomDateFormat(timestamp, customFormat)
          : new Date(timestamp).toISOString();
      default:
        return new Date(timestamp).toISOString();
    }
  }

  /**
   * Apply custom date format
   * Supports: YYYY, MM, DD, HH, mm, ss, SSS
   */
  private static applyCustomDateFormat(timestamp: number, format: string): string {
    const date = new Date(timestamp);

    const replacements: Record<string, string> = {
      YYYY: date.getFullYear().toString(),
      MM: (date.getMonth() + 1).toString().padStart(2, '0'),
      DD: date.getDate().toString().padStart(2, '0'),
      HH: date.getHours().toString().padStart(2, '0'),
      mm: date.getMinutes().toString().padStart(2, '0'),
      ss: date.getSeconds().toString().padStart(2, '0'),
      SSS: date.getMilliseconds().toString().padStart(3, '0'),
    };

    let result = format;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(key, 'g'), value);
    }

    return result;
  }

  /**
   * Export with streaming for large datasets
   * Returns async generator that yields CSV chunks
   */
  static async* exportSessionStreaming(
    sessionData: SessionData,
    sensorType: 'accelerometer' | 'gyroscope' | 'gps',
    options: CsvExportOptions = {},
    chunkSize: number = 1000
  ): AsyncGenerator<string> {
    const {
      includeBOM = true,
      columns,
      dateFormat = 'iso',
      delimiter = ',',
      includeHeaders = true,
      decimalSeparator = '.',
    } = options;

    const sensorData = sessionData[sensorType];
    if (!sensorData || sensorData.length === 0) {
      throw new Error(`No ${sensorType} data available`);
    }

    // Yield BOM and headers
    let header = includeBOM ? this.UTF8_BOM : '';
    const availableColumns = this.getAvailableColumns(sensorType);
    const selectedColumns = columns || availableColumns;

    if (includeHeaders) {
      header += selectedColumns.join(delimiter) + '\n';
    }
    yield header;

    // Yield data in chunks
    for (let i = 0; i < sensorData.length; i += chunkSize) {
      const chunk = sensorData.slice(i, i + chunkSize);
      let csv = '';

      for (const dataPoint of chunk) {
        const row = selectedColumns.map(column => {
          let value: any;

          if (column === 'timestamp') {
            value = this.formatDate(dataPoint.timestamp, dateFormat, options.customDateFormat);
          } else {
            value = dataPoint[column];
          }

          if (typeof value === 'number' && decimalSeparator !== '.') {
            value = value.toString().replace('.', decimalSeparator);
          }

          if (typeof value === 'string' && (value.includes(delimiter) || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }

          return value ?? '';
        });

        csv += row.join(delimiter) + '\n';
      }

      yield csv;
    }
  }
}
