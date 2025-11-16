/**
 * Exporters Index
 * Central export for all data export formats
 */

export * from './csvExporter';
export * from './jsonExporter';
export * from './xlsxExporter';
export * from './hdf5Exporter';
export * from './matExporter';

// Re-export types
export type {
  CsvExportOptions,
  SensorDataPoint,
  SessionData,
} from './csvExporter';

export type {JsonExportOptions} from './jsonExporter';
export type {XlsxExportOptions} from './xlsxExporter';
export type {Hdf5ExportOptions} from './hdf5Exporter';
export type {MatExportOptions} from './matExporter';

/**
 * Supported export formats
 */
export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  XLSX = 'xlsx',
  HDF5 = 'hdf5',
  MAT = 'mat',
}

/**
 * Format metadata
 */
export interface ExportFormatInfo {
  format: ExportFormat;
  name: string;
  description: string;
  extension: string;
  mimeType: string;
  requiresLibrary?: string;
  useCases: string[];
}

/**
 * Get information about all supported formats
 */
export function getSupportedFormats(): ExportFormatInfo[] {
  return [
    {
      format: ExportFormat.CSV,
      name: 'CSV (Comma-Separated Values)',
      description: 'Universal text format, compatible with Excel, Google Sheets, and data analysis tools',
      extension: '.csv',
      mimeType: 'text/csv',
      useCases: ['Excel analysis', 'Google Sheets', 'Simple data processing', 'Database import'],
    },
    {
      format: ExportFormat.JSON,
      name: 'JSON (JavaScript Object Notation)',
      description: 'Structured data format, ideal for web applications and data interchange',
      extension: '.json',
      mimeType: 'application/json',
      useCases: ['Web applications', 'API integration', 'Data backup', 'JavaScript processing'],
    },
    {
      format: ExportFormat.XLSX,
      name: 'Excel (XLSX)',
      description: 'Microsoft Excel format with multiple sheets and formatting',
      extension: '.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      requiresLibrary: 'xlsx',
      useCases: ['Excel analysis', 'Professional reports', 'Multi-sheet data', 'Business analysis'],
    },
    {
      format: ExportFormat.HDF5,
      name: 'HDF5 (Hierarchical Data Format)',
      description: 'Scientific data format for large datasets, used in Python, MATLAB, R',
      extension: '.h5',
      mimeType: 'application/x-hdf',
      requiresLibrary: 'Server-side conversion (Python/h5py)',
      useCases: ['Scientific research', 'Machine learning', 'Big data', 'Python/MATLAB analysis'],
    },
    {
      format: ExportFormat.MAT,
      name: 'MAT (MATLAB)',
      description: 'MATLAB native format for numerical computing and analysis',
      extension: '.mat',
      mimeType: 'application/x-matlab-data',
      requiresLibrary: 'Server-side conversion (Python/scipy)',
      useCases: ['MATLAB analysis', 'Signal processing', 'Numerical computing', 'Octave'],
    },
  ];
}

/**
 * Get format by extension
 */
export function getFormatByExtension(extension: string): ExportFormatInfo | undefined {
  const formats = getSupportedFormats();
  return formats.find(f => f.extension === extension || f.extension === `.${extension}`);
}

/**
 * Check if format requires external library
 */
export function requiresLibrary(format: ExportFormat): boolean {
  const formatInfo = getSupportedFormats().find(f => f.format === format);
  return !!formatInfo?.requiresLibrary;
}

/**
 * Get recommended format based on use case
 */
export function getRecommendedFormat(useCase: string): ExportFormat {
  const useCaseLower = useCase.toLowerCase();

  if (useCaseLower.includes('excel') || useCaseLower.includes('business')) {
    return ExportFormat.XLSX;
  }

  if (useCaseLower.includes('matlab') || useCaseLower.includes('octave')) {
    return ExportFormat.MAT;
  }

  if (
    useCaseLower.includes('python') ||
    useCaseLower.includes('scientific') ||
    useCaseLower.includes('machine learning')
  ) {
    return ExportFormat.HDF5;
  }

  if (useCaseLower.includes('web') || useCaseLower.includes('api')) {
    return ExportFormat.JSON;
  }

  // Default to CSV (most universal)
  return ExportFormat.CSV;
}
