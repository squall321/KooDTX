/**
 * MAT File Exporter - MATLAB format export
 *
 * MAT files are MATLAB's native data format
 * Used in: MATLAB, Octave, Python (scipy.io)
 *
 * NOTE: Requires 'mat4js' or similar library for creating MAT files
 * Alternative: Export to JSON and convert server-side using Python/scipy
 *
 * Structure:
 * - sessionData (struct)
 *   - metadata (struct)
 *   - accelerometer (struct with fields: timestamp, x, y, z)
 *   - gyroscope (struct with fields: timestamp, x, y, z)
 *   - gps (struct with fields: timestamp, latitude, longitude, altitude)
 */

import type {SessionData, SensorDataPoint} from './csvExporter';

export interface MatExportOptions {
  version?: '5' | '7.3'; // MAT file version
  compression?: boolean; // Compress data
  variableName?: string; // Root variable name (default: 'sessionData')
}

export class MatExporter {
  /**
   * Export to MAT-compatible structure (for server-side conversion)
   */
  static async exportToMatJson(
    sessionData: SessionData,
    options: MatExportOptions = {}
  ): Promise<any> {
    const {variableName = 'sessionData'} = options;

    const matStructure: any = {
      _format: 'MAT-JSON',
      _version: options.version || '5',
      variables: {},
    };

    // Create main struct
    const mainStruct: any = {
      metadata: {
        sessionId: sessionData.sessionId,
        sessionName: sessionData.sessionName,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        duration: sessionData.endTime - sessionData.startTime,
      },
    };

    // Add sensor data
    if (sessionData.accelerometer) {
      mainStruct.accelerometer = this.sensorDataToMatStruct(sessionData.accelerometer);
    }

    if (sessionData.gyroscope) {
      mainStruct.gyroscope = this.sensorDataToMatStruct(sessionData.gyroscope);
    }

    if (sessionData.gps) {
      mainStruct.gps = this.gpsDataToMatStruct(sessionData.gps);
    }

    // Add audio info
    if (sessionData.audio) {
      mainStruct.audio = sessionData.audio;
    }

    matStructure.variables[variableName] = mainStruct;

    return matStructure;
  }

  /**
   * Convert sensor data to MATLAB struct format
   */
  private static sensorDataToMatStruct(sensorData: SensorDataPoint[]): any {
    return {
      timestamp: sensorData.map(p => p.timestamp),
      x: sensorData.map(p => p.x),
      y: sensorData.map(p => p.y),
      z: sensorData.map(p => p.z),
      _type: 'struct',
      _shape: [sensorData.length, 1],
    };
  }

  /**
   * Convert GPS data to MATLAB struct format
   */
  private static gpsDataToMatStruct(
    gpsData: Array<{timestamp: number; latitude: number; longitude: number; altitude?: number}>
  ): any {
    return {
      timestamp: gpsData.map(p => p.timestamp),
      latitude: gpsData.map(p => p.latitude),
      longitude: gpsData.map(p => p.longitude),
      altitude: gpsData.map(p => p.altitude || 0),
      _type: 'struct',
      _shape: [gpsData.length, 1],
    };
  }

  /**
   * Generate Python script to convert JSON to MAT file
   */
  static generatePythonConversionScript(): string {
    return `#!/usr/bin/env python3
"""
Convert MAT-JSON to actual MAT file
Usage: python convert_to_mat.py input.json output.mat
"""

import json
import scipy.io as sio
import numpy as np
import sys

def convert_json_to_mat(json_path, mat_path):
    # Load JSON
    with open(json_path, 'r') as f:
        data = json.load(f)

    # Convert to MATLAB-compatible structure
    mat_data = {}

    for var_name, var_data in data['variables'].items():
        mat_data[var_name] = process_struct(var_data)

    # Save as MAT file
    sio.savemat(mat_path, mat_data, do_compression=True)
    print(f"Converted {json_path} to {mat_path}")

def process_struct(struct_data):
    """Convert JSON struct to MATLAB struct"""
    if isinstance(struct_data, dict):
        result = {}
        for key, value in struct_data.items():
            if key.startswith('_'):
                continue  # Skip metadata fields

            if isinstance(value, list):
                # Convert to numpy array
                result[key] = np.array(value)
            elif isinstance(value, dict):
                # Recursively process nested structs
                result[key] = process_struct(value)
            else:
                result[key] = value
        return result
    else:
        return struct_data

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python convert_to_mat.py input.json output.mat")
        sys.exit(1)

    convert_json_to_mat(sys.argv[1], sys.argv[2])
`;
  }

  /**
   * Generate MATLAB script to read MAT file
   */
  static generateMatlabReadScript(): string {
    return `% Read MAT file exported from KooDTX
% Usage: Open MATLAB and run this script

% Load MAT file
filename = 'session_data.mat';
data = load(filename);

% Access session data
sessionData = data.sessionData;

% Display metadata
disp('Session Metadata:');
disp(sessionData.metadata);

% Plot accelerometer data
if isfield(sessionData, 'accelerometer')
    figure('Name', 'Accelerometer Data');

    subplot(3, 1, 1);
    plot(sessionData.accelerometer.timestamp, sessionData.accelerometer.x);
    title('Accelerometer X-axis');
    ylabel('Acceleration (m/s²)');

    subplot(3, 1, 2);
    plot(sessionData.accelerometer.timestamp, sessionData.accelerometer.y);
    title('Accelerometer Y-axis');
    ylabel('Acceleration (m/s²)');

    subplot(3, 1, 3);
    plot(sessionData.accelerometer.timestamp, sessionData.accelerometer.z);
    title('Accelerometer Z-axis');
    xlabel('Timestamp (ms)');
    ylabel('Acceleration (m/s²)');
end

% Plot gyroscope data
if isfield(sessionData, 'gyroscope')
    figure('Name', 'Gyroscope Data');

    subplot(3, 1, 1);
    plot(sessionData.gyroscope.timestamp, sessionData.gyroscope.x);
    title('Gyroscope X-axis');
    ylabel('Angular Velocity (rad/s)');

    subplot(3, 1, 2);
    plot(sessionData.gyroscope.timestamp, sessionData.gyroscope.y);
    title('Gyroscope Y-axis');
    ylabel('Angular Velocity (rad/s)');

    subplot(3, 1, 3);
    plot(sessionData.gyroscope.timestamp, sessionData.gyroscope.z);
    title('Gyroscope Z-axis');
    xlabel('Timestamp (ms)');
    ylabel('Angular Velocity (rad/s)');
end

% Plot GPS track
if isfield(sessionData, 'gps')
    figure('Name', 'GPS Track');

    subplot(2, 1, 1);
    plot(sessionData.gps.longitude, sessionData.gps.latitude, 'b-o');
    title('GPS Track');
    xlabel('Longitude');
    ylabel('Latitude');
    grid on;

    subplot(2, 1, 2);
    plot(sessionData.gps.timestamp, sessionData.gps.altitude);
    title('Altitude over Time');
    xlabel('Timestamp (ms)');
    ylabel('Altitude (m)');
    grid on;
end

% Calculate statistics
if isfield(sessionData, 'accelerometer')
    disp('Accelerometer Statistics:');
    fprintf('X - Mean: %.3f, Std: %.3f\\n', ...
        mean(sessionData.accelerometer.x), ...
        std(sessionData.accelerometer.x));
    fprintf('Y - Mean: %.3f, Std: %.3f\\n', ...
        mean(sessionData.accelerometer.y), ...
        std(sessionData.accelerometer.y));
    fprintf('Z - Mean: %.3f, Std: %.3f\\n', ...
        mean(sessionData.accelerometer.z), ...
        std(sessionData.accelerometer.z));
end
`;
  }

  /**
   * Get usage instructions
   */
  static getUsageInstructions(): string {
    return `# MAT File Export Usage

## Step 1: Export to MAT-JSON format from app

\`\`\`typescript
import { MatExporter } from './matExporter';

const matJson = await MatExporter.exportToMatJson(sessionData);
// Save to file or send to server
\`\`\`

## Step 2: Convert to actual MAT file (Python)

### Install dependencies:
\`\`\`bash
pip install scipy numpy
\`\`\`

### Generate conversion script:
\`\`\`typescript
const script = MatExporter.generatePythonConversionScript();
// Save as convert_to_mat.py
\`\`\`

### Run conversion:
\`\`\`bash
python convert_to_mat.py session_data.json session_data.mat
\`\`\`

## Step 3: Read MAT file (MATLAB)

### Generate MATLAB script:
\`\`\`typescript
const matlabScript = MatExporter.generateMatlabReadScript();
// Save as read_session_data.m
\`\`\`

### Run in MATLAB:
\`\`\`matlab
run('read_session_data.m');
\`\`\`

## Step 4: Read MAT file (Python)

\`\`\`python
import scipy.io as sio
import numpy as np

# Load MAT file
data = sio.loadmat('session_data.mat')
session_data = data['sessionData'][0, 0]

# Access data
metadata = session_data['metadata'][0, 0]
accel = session_data['accelerometer'][0, 0]

# Get accelerometer data
accel_x = accel['x'].flatten()
accel_y = accel['y'].flatten()
accel_z = accel['z'].flatten()
timestamps = accel['timestamp'].flatten()

print(f"Session: {metadata['sessionName'][0]}")
print(f"Data points: {len(accel_x)}")

# Plot
import matplotlib.pyplot as plt
plt.plot(timestamps, accel_x, label='X')
plt.plot(timestamps, accel_y, label='Y')
plt.plot(timestamps, accel_z, label='Z')
plt.legend()
plt.xlabel('Timestamp (ms)')
plt.ylabel('Acceleration (m/s²)')
plt.title('Accelerometer Data')
plt.show()
\`\`\`

## Alternative: Variable naming

You can customize the MATLAB variable name:

\`\`\`typescript
const matJson = await MatExporter.exportToMatJson(sessionData, {
  variableName: 'myData',  // Will be accessible as 'myData' in MATLAB
  version: '7.3',          // Use MAT v7.3 for large files
  compression: true
});
\`\`\`
`;
  }
}
