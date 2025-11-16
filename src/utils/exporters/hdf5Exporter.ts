/**
 * HDF5 Exporter - Scientific data format export
 *
 * HDF5 (Hierarchical Data Format) is a popular format for scientific data
 * Used in: Python (h5py), MATLAB, R, Julia
 *
 * NOTE: Requires HDF5 library or conversion to HDF5-compatible format
 * Alternative: Export to JSON and convert server-side using Python/h5py
 *
 * Structure:
 * /session_id
 *   /metadata
 *     - sessionName
 *     - startTime
 *     - endTime
 *   /accelerometer
 *     - timestamp (dataset)
 *     - x (dataset)
 *     - y (dataset)
 *     - z (dataset)
 *   /gyroscope
 *     - timestamp (dataset)
 *     - x (dataset)
 *     - y (dataset)
 *     - z (dataset)
 *   /gps
 *     - timestamp (dataset)
 *     - latitude (dataset)
 *     - longitude (dataset)
 *     - altitude (dataset)
 */

import type {SessionData, SensorDataPoint} from './csvExporter';

export interface Hdf5ExportOptions {
  compression?: 'gzip' | 'none'; // Compression algorithm
  compressionLevel?: number; // 0-9 for gzip
  chunkSize?: number; // Chunk size for datasets
}

export class Hdf5Exporter {
  /**
   * Export to HDF5-compatible JSON structure
   * This can be converted to actual HDF5 server-side using Python
   */
  static async exportToHdf5Json(
    sessionData: SessionData,
    options: Hdf5ExportOptions = {}
  ): Promise<any> {
    const hdf5Structure: any = {
      _format: 'HDF5-JSON',
      _version: '1.0',
      groups: {},
    };

    // Root group (session)
    const sessionGroup = `/${sessionData.sessionId}`;
    hdf5Structure.groups[sessionGroup] = {
      attributes: {},
      groups: {},
      datasets: {},
    };

    // Metadata group
    hdf5Structure.groups[sessionGroup].groups['metadata'] = {
      attributes: {
        sessionName: sessionData.sessionName,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        duration: sessionData.endTime - sessionData.startTime,
      },
      groups: {},
      datasets: {},
    };

    // Add sensor datasets
    if (sessionData.accelerometer) {
      this.addSensorDatasets(
        hdf5Structure.groups[sessionGroup],
        'accelerometer',
        sessionData.accelerometer
      );
    }

    if (sessionData.gyroscope) {
      this.addSensorDatasets(
        hdf5Structure.groups[sessionGroup],
        'gyroscope',
        sessionData.gyroscope
      );
    }

    if (sessionData.gps) {
      this.addGpsDatasets(hdf5Structure.groups[sessionGroup], 'gps', sessionData.gps);
    }

    return hdf5Structure;
  }

  /**
   * Add sensor datasets to HDF5 structure
   */
  private static addSensorDatasets(
    parentGroup: any,
    sensorName: string,
    sensorData: SensorDataPoint[]
  ): void {
    parentGroup.groups[sensorName] = {
      attributes: {
        sensorType: sensorName,
        dataPoints: sensorData.length,
      },
      groups: {},
      datasets: {
        timestamp: {
          shape: [sensorData.length],
          type: 'float64',
          data: sensorData.map(p => p.timestamp),
        },
        x: {
          shape: [sensorData.length],
          type: 'float32',
          data: sensorData.map(p => p.x),
        },
        y: {
          shape: [sensorData.length],
          type: 'float32',
          data: sensorData.map(p => p.y),
        },
        z: {
          shape: [sensorData.length],
          type: 'float32',
          data: sensorData.map(p => p.z),
        },
      },
    };
  }

  /**
   * Add GPS datasets to HDF5 structure
   */
  private static addGpsDatasets(
    parentGroup: any,
    sensorName: string,
    gpsData: Array<{timestamp: number; latitude: number; longitude: number; altitude?: number}>
  ): void {
    parentGroup.groups[sensorName] = {
      attributes: {
        sensorType: 'gps',
        dataPoints: gpsData.length,
      },
      groups: {},
      datasets: {
        timestamp: {
          shape: [gpsData.length],
          type: 'float64',
          data: gpsData.map(p => p.timestamp),
        },
        latitude: {
          shape: [gpsData.length],
          type: 'float64',
          data: gpsData.map(p => p.latitude),
        },
        longitude: {
          shape: [gpsData.length],
          type: 'float64',
          data: gpsData.map(p => p.longitude),
        },
        altitude: {
          shape: [gpsData.length],
          type: 'float32',
          data: gpsData.map(p => p.altitude || 0),
        },
      },
    };
  }

  /**
   * Generate Python script to convert JSON to HDF5
   */
  static generatePythonConversionScript(): string {
    return `#!/usr/bin/env python3
"""
Convert HDF5-JSON to actual HDF5 file
Usage: python convert_to_hdf5.py input.json output.h5
"""

import json
import h5py
import numpy as np
import sys

def convert_json_to_hdf5(json_path, hdf5_path):
    # Load JSON
    with open(json_path, 'r') as f:
        data = json.load(f)

    # Create HDF5 file
    with h5py.File(hdf5_path, 'w') as hf:
        # Process groups
        for group_path, group_data in data['groups'].items():
            process_group(hf, group_path, group_data)

    print(f"Converted {json_path} to {hdf5_path}")

def process_group(hf, path, group_data):
    # Create or get group
    if path == '/':
        group = hf
    else:
        group = hf.create_group(path)

    # Add attributes
    for attr_name, attr_value in group_data.get('attributes', {}).items():
        group.attrs[attr_name] = attr_value

    # Add datasets
    for ds_name, ds_data in group_data.get('datasets', {}).items():
        dtype = np.dtype(ds_data['type'])
        data = np.array(ds_data['data'], dtype=dtype)
        group.create_dataset(ds_name, data=data, compression='gzip')

    # Process subgroups
    for subgroup_path, subgroup_data in group_data.get('groups', {}).items():
        full_path = f"{path}/{subgroup_path}".replace('//', '/')
        process_group(hf, full_path, subgroup_data)

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python convert_to_hdf5.py input.json output.h5")
        sys.exit(1)

    convert_json_to_hdf5(sys.argv[1], sys.argv[2])
`;
  }

  /**
   * Generate usage instructions
   */
  static getUsageInstructions(): string {
    return `# HDF5 Export Usage

## Step 1: Export to HDF5-JSON format from app

\`\`\`typescript
import { Hdf5Exporter } from './hdf5Exporter';

const hdf5Json = await Hdf5Exporter.exportToHdf5Json(sessionData);
// Save to file or send to server
\`\`\`

## Step 2: Convert to actual HDF5 file (Python)

### Install dependencies:
\`\`\`bash
pip install h5py numpy
\`\`\`

### Generate conversion script:
\`\`\`typescript
const script = Hdf5Exporter.generatePythonConversionScript();
// Save as convert_to_hdf5.py
\`\`\`

### Run conversion:
\`\`\`bash
python convert_to_hdf5.py session_data.json session_data.h5
\`\`\`

## Step 3: Read HDF5 file (Python)

\`\`\`python
import h5py
import numpy as np

with h5py.File('session_data.h5', 'r') as f:
    # List all groups
    print(list(f.keys()))

    # Access accelerometer data
    session_id = list(f.keys())[0]
    accel_x = f[f'{session_id}/accelerometer/x'][:]
    accel_y = f[f'{session_id}/accelerometer/y'][:]
    accel_z = f[f'{session_id}/accelerometer/z'][:]

    print(f"Accelerometer shape: {accel_x.shape}")
\`\`\`

## Step 4: Read HDF5 file (MATLAB)

\`\`\`matlab
% Read HDF5 file
filename = 'session_data.h5';
info = h5info(filename);

% Read accelerometer data
session_id = info.Groups(1).Name;
accel_x = h5read(filename, [session_id '/accelerometer/x']);
accel_y = h5read(filename, [session_id '/accelerometer/y']);
accel_z = h5read(filename, [session_id '/accelerometer/z']);

% Plot
plot(accel_x);
title('Accelerometer X-axis');
\`\`\`

## Alternative: Direct server-side conversion

If you have a server API, you can:
1. Send session data as JSON
2. Server converts to HDF5 using Python
3. Server returns download link

This avoids client-side file conversion.
`;
  }
}
