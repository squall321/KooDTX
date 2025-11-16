# Data Export Formats Guide

Complete guide for exporting sensor data in multiple formats.

## Table of Contents

1. [Supported Formats](#supported-formats)
2. [CSV Export](#csv-export)
3. [JSON Export](#json-export)
4. [Excel (XLSX) Export](#excel-xlsx-export)
5. [HDF5 Export](#hdf5-export)
6. [MAT File Export](#mat-file-export)
7. [Format Comparison](#format-comparison)
8. [Usage Examples](#usage-examples)

---

## Supported Formats

| Format | Extension | Best For | Requires Library |
|--------|-----------|----------|------------------|
| **CSV** | `.csv` | Excel, Google Sheets, Universal | No |
| **JSON** | `.json` | Web apps, API integration | No |
| **XLSX** | `.xlsx` | Microsoft Excel, Multi-sheet | Yes (`xlsx`) |
| **HDF5** | `.h5` | Scientific computing, Python | Server-side |
| **MAT** | `.mat` | MATLAB, Numerical analysis | Server-side |

---

## CSV Export

### Features
- UTF-8 BOM for Excel compatibility
- Column selection
- Custom date formats
- Large file streaming
- Custom delimiter support

### Usage

```typescript
import { CsvExporter } from '@/utils/exporters';

// Basic export
const csv = await CsvExporter.exportSession(sessionData, 'accelerometer');

// With options
const csv = await CsvExporter.exportSession(sessionData, 'accelerometer', {
  includeBOM: true,
  dateFormat: 'iso',
  delimiter: ',',
  columns: ['timestamp', 'x', 'y'], // Only selected columns
  decimalSeparator: '.', // or ',' for European format
});

// Export all sensors
const allSensors = await CsvExporter.exportAllSensors(sessionData);
// Returns: Map<string, string>
```

### Custom Date Formats

```typescript
// ISO format (default)
dateFormat: 'iso'  // 2024-11-16T10:30:00.000Z

// Unix timestamp
dateFormat: 'unix'  // 1700132400000

// Custom format
dateFormat: 'custom',
customDateFormat: 'YYYY-MM-DD HH:mm:ss'  // 2024-11-16 10:30:00
```

### Streaming for Large Files

```typescript
// Use streaming for datasets > 10,000 points
for await (const chunk of CsvExporter.exportSessionStreaming(
  sessionData,
  'accelerometer',
  { includeBOM: true },
  1000 // chunk size
)) {
  // Write chunk to file or stream
  await writeChunk(chunk);
}
```

---

## JSON Export

### Features
- Pretty print or minified
- Gzip compression support
- Streaming for large files
- Field exclusion

### Usage

```typescript
import { JsonExporter } from '@/utils/exporters';

// Basic export
const json = await JsonExporter.exportSession(sessionData);

// Pretty print
const json = await JsonExporter.exportSession(sessionData, {
  prettyPrint: true,
  indent: 2,
});

// Exclude fields
const json = await JsonExporter.exportSession(sessionData, {
  excludeFields: ['accelerometer', 'gyroscope'], // Only GPS
});

// Compressed (requires pako library)
const compressed = await JsonExporter.exportSessionCompressed(sessionData);
```

### Streaming Export

```typescript
let jsonString = '';
for await (const chunk of JsonExporter.exportSessionStreaming(
  sessionData,
  { prettyPrint: true }
)) {
  jsonString += chunk;
}
```

### Import from JSON

```typescript
const sessionData = await JsonExporter.parseImport(jsonString);
```

---

## Excel (XLSX) Export

### Features
- Multiple sheets (one per sensor)
- Metadata sheet
- Auto column width
- Number formatting
- Optional charts

### Installation

```bash
npm install xlsx
```

### Usage

```typescript
import { XlsxExporter } from '@/utils/exporters';

// Export to Excel
const base64Excel = await XlsxExporter.exportSession(sessionData, {
  includeMetadata: true,
  autoColumnWidth: true,
  numberFormat: '0.000', // 3 decimal places
});

// Save to file
const filePath = await XlsxExporter.saveToFile(
  base64Excel,
  'session_data.xlsx'
);
```

### Excel Structure

```
Workbook
├── Metadata (sheet)
│   ├── Session Information
│   ├── Sensor Data Counts
│   └── Audio Information
├── Accelerometer (sheet)
│   ├── Timestamp | ISO Time | X | Y | Z
│   └── [data rows...]
├── Gyroscope (sheet)
│   └── [data rows...]
└── GPS (sheet)
    └── [data rows...]
```

---

## HDF5 Export

### Features
- Hierarchical structure
- Optimized for large datasets
- Compatible with Python, MATLAB, R
- Server-side conversion

### Workflow

#### Step 1: Export to HDF5-JSON

```typescript
import { Hdf5Exporter } from '@/utils/exporters';

const hdf5Json = await Hdf5Exporter.exportToHdf5Json(sessionData);
// Save or send to server
```

#### Step 2: Convert to HDF5 (Python)

```bash
# Install dependencies
pip install h5py numpy

# Generate conversion script
# (Use Hdf5Exporter.generatePythonConversionScript())

# Convert
python convert_to_hdf5.py session.json session.h5
```

#### Step 3: Read in Python

```python
import h5py

with h5py.File('session.h5', 'r') as f:
    session_id = list(f.keys())[0]
    accel_x = f[f'{session_id}/accelerometer/x'][:]
    accel_y = f[f'{session_id}/accelerometer/y'][:]
    accel_z = f[f'{session_id}/accelerometer/z'][:]
```

### HDF5 Structure

```
/session_id
  /metadata
    - sessionName (attribute)
    - startTime (attribute)
    - endTime (attribute)
  /accelerometer
    - timestamp (dataset: float64[n])
    - x (dataset: float32[n])
    - y (dataset: float32[n])
    - z (dataset: float32[n])
  /gyroscope
    - [same structure]
  /gps
    - timestamp (dataset: float64[n])
    - latitude (dataset: float64[n])
    - longitude (dataset: float64[n])
    - altitude (dataset: float32[n])
```

---

## MAT File Export

### Features
- MATLAB native format
- Compatible with Octave
- Python scipy.io support
- Server-side conversion

### Workflow

#### Step 1: Export to MAT-JSON

```typescript
import { MatExporter } from '@/utils/exporters';

const matJson = await MatExporter.exportToMatJson(sessionData, {
  variableName: 'sessionData', // MATLAB variable name
  version: '5', // or '7.3' for large files
});
```

#### Step 2: Convert to MAT (Python)

```bash
# Install dependencies
pip install scipy numpy

# Convert
python convert_to_mat.py session.json session.mat
```

#### Step 3: Read in MATLAB

```matlab
% Load MAT file
data = load('session.mat');
sessionData = data.sessionData;

% Access data
accel_x = sessionData.accelerometer.x;
accel_y = sessionData.accelerometer.y;
accel_z = sessionData.accelerometer.z;

% Plot
plot(accel_x);
title('Accelerometer X-axis');
```

---

## Format Comparison

| Feature | CSV | JSON | XLSX | HDF5 | MAT |
|---------|-----|------|------|------|-----|
| **File Size** | Medium | Large | Small | Small | Small |
| **Human Readable** | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Excel Compatible** | ✅ Yes | ❌ No | ✅ Yes | ❌ No | ❌ No |
| **Python** | ✅ pandas | ✅ Native | ✅ openpyxl | ✅ h5py | ✅ scipy |
| **MATLAB** | ✅ readtable | ✅ jsondecode | ⚠️ Limited | ✅ h5read | ✅ Native |
| **Compression** | ❌ No | ⚠️ Optional | ✅ Yes | ✅ Yes | ✅ Yes |
| **Streaming** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Metadata** | ❌ Limited | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Setup Complexity** | 🟢 None | 🟢 None | 🟡 Medium | 🔴 High | 🟡 Medium |

### Recommendations

- **Quick analysis**: Use **CSV**
- **Web/API**: Use **JSON**
- **Business reports**: Use **XLSX**
- **Scientific research**: Use **HDF5**
- **MATLAB users**: Use **MAT**

---

## Usage Examples

### Example 1: Export for Excel Analysis

```typescript
import { CsvExporter } from '@/utils/exporters';

const csv = await CsvExporter.exportSession(sessionData, 'accelerometer', {
  includeBOM: true, // For Excel compatibility
  dateFormat: 'custom',
  customDateFormat: 'YYYY-MM-DD HH:mm:ss',
  delimiter: ',',
});

// Save to file
await saveFile('session_accel.csv', csv);
```

### Example 2: Export for Python Analysis

```typescript
import { Hdf5Exporter } from '@/utils/exporters';

const hdf5Json = await Hdf5Exporter.exportToHdf5Json(sessionData);

// Send to server for conversion
await fetch('/api/convert/hdf5', {
  method: 'POST',
  body: JSON.stringify(hdf5Json),
});

// Server returns download link
```

### Example 3: Export All Formats

```typescript
import {
  CsvExporter,
  JsonExporter,
  XlsxExporter,
  getSupportedFormats,
} from '@/utils/exporters';

async function exportAll(sessionData) {
  const exports = {};

  // CSV (all sensors)
  const csvData = await CsvExporter.exportAllSensors(sessionData);
  exports.csv = csvData;

  // JSON
  exports.json = await JsonExporter.exportSession(sessionData, {
    prettyPrint: true,
  });

  // Excel (requires xlsx library)
  try {
    exports.xlsx = await XlsxExporter.exportSession(sessionData);
  } catch (error) {
    console.warn('XLSX export not available:', error);
  }

  return exports;
}
```

### Example 4: User Format Selection

```typescript
import { ExportFormat, getRecommendedFormat } from '@/utils/exporters';

function showExportDialog(sessionData) {
  const formats = getSupportedFormats();

  // User selects format
  const selectedFormat = await userSelectFormat(formats);

  switch (selectedFormat.format) {
    case ExportFormat.CSV:
      return await CsvExporter.exportSession(sessionData, 'accelerometer');

    case ExportFormat.JSON:
      return await JsonExporter.exportSession(sessionData);

    case ExportFormat.XLSX:
      return await XlsxExporter.exportSession(sessionData);

    // ... etc
  }
}
```

---

## Installation

### Required Libraries

```bash
# For XLSX export
npm install xlsx

# For JSON compression (optional)
npm install pako

# For React Native file system
npm install react-native-fs
```

### Server-Side (Python)

```bash
# For HDF5 conversion
pip install h5py numpy

# For MAT conversion
pip install scipy numpy
```

---

## Next Steps

1. Choose the appropriate format for your use case
2. Install required libraries if needed
3. Implement export in your screens
4. Test with sample data
5. Set up server-side conversion for HDF5/MAT if needed

For implementation details, see:
- `src/utils/exporters/` - Exporter implementations
- `src/screens/ExportScreen.tsx` - UI implementation
- Phase 256 implementation guide

---

**Created:** 2025-11-16
**Version:** 1.0
**Status:** ✅ Complete
