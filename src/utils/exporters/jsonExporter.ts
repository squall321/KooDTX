/**
 * JSON Exporter - Enhanced JSON export with compression and streaming
 *
 * Features:
 * - Pretty print or minified
 * - gzip compression
 * - Streaming for large files
 * - Custom serialization
 */

import type {SessionData} from './csvExporter';

export interface JsonExportOptions {
  prettyPrint?: boolean; // Format with indentation
  indent?: number; // Indentation spaces (default: 2)
  compress?: boolean; // gzip compression
  includeMetadata?: boolean; // Include session metadata
  excludeFields?: string[]; // Fields to exclude
}

export class JsonExporter {
  /**
   * Export session to JSON string
   */
  static async exportSession(
    sessionData: SessionData,
    options: JsonExportOptions = {}
  ): Promise<string> {
    const {
      prettyPrint = false,
      indent = 2,
      includeMetadata = true,
      excludeFields = [],
    } = options;

    // Create export object
    const exportData: any = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
    };

    if (includeMetadata) {
      exportData.metadata = {
        sessionId: sessionData.sessionId,
        sessionName: sessionData.sessionName,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        duration: sessionData.endTime - sessionData.startTime,
      };

      if (sessionData.metadata) {
        exportData.metadata.custom = sessionData.metadata;
      }
    }

    // Add sensor data
    exportData.sensors = {};

    if (sessionData.accelerometer && !excludeFields.includes('accelerometer')) {
      exportData.sensors.accelerometer = sessionData.accelerometer;
    }

    if (sessionData.gyroscope && !excludeFields.includes('gyroscope')) {
      exportData.sensors.gyroscope = sessionData.gyroscope;
    }

    if (sessionData.gps && !excludeFields.includes('gps')) {
      exportData.sensors.gps = sessionData.gps;
    }

    // Add audio info
    if (sessionData.audio && !excludeFields.includes('audio')) {
      exportData.audio = sessionData.audio;
    }

    // Serialize to JSON
    const json = prettyPrint
      ? JSON.stringify(exportData, null, indent)
      : JSON.stringify(exportData);

    return json;
  }

  /**
   * Export with gzip compression
   * Returns base64 encoded compressed data
   */
  static async exportSessionCompressed(
    sessionData: SessionData,
    options: JsonExportOptions = {}
  ): Promise<string> {
    // TODO: Implement gzip compression
    // Requires: npm install pako (gzip library for JavaScript)
    throw new Error('Compression requires pako library. Run: npm install pako');

    /*
    import pako from 'pako';

    const json = await this.exportSession(sessionData, options);
    const compressed = pako.gzip(json);
    const base64 = btoa(String.fromCharCode.apply(null, Array.from(compressed)));
    return base64;
    */
  }

  /**
   * Streaming JSON export for large datasets
   * Yields JSON chunks that can be concatenated
   */
  static async* exportSessionStreaming(
    sessionData: SessionData,
    options: JsonExportOptions = {}
  ): AsyncGenerator<string> {
    const {prettyPrint = false, indent = 2, includeMetadata = true} = options;

    const ind = prettyPrint ? ' '.repeat(indent) : '';
    const nl = prettyPrint ? '\n' : '';

    // Start object
    yield `{${nl}`;

    // Version
    yield `${ind}"version": "1.0",${nl}`;
    yield `${ind}"exportedAt": "${new Date().toISOString()}",${nl}`;

    // Metadata
    if (includeMetadata) {
      yield `${ind}"metadata": {${nl}`;
      yield `${ind}${ind}"sessionId": "${sessionData.sessionId}",${nl}`;
      yield `${ind}${ind}"sessionName": "${sessionData.sessionName}",${nl}`;
      yield `${ind}${ind}"startTime": ${sessionData.startTime},${nl}`;
      yield `${ind}${ind}"endTime": ${sessionData.endTime},${nl}`;
      yield `${ind}${ind}"duration": ${sessionData.endTime - sessionData.startTime}${nl}`;
      yield `${ind}},${nl}`;
    }

    // Sensors
    yield `${ind}"sensors": {${nl}`;

    let firstSensor = true;

    // Accelerometer
    if (sessionData.accelerometer) {
      if (!firstSensor) yield `,${nl}`;
      yield `${ind}${ind}"accelerometer": ${prettyPrint ? '[\n' : '['}`;

      for (let i = 0; i < sessionData.accelerometer.length; i++) {
        const point = sessionData.accelerometer[i];
        const pointJson = JSON.stringify(point);
        yield i > 0 ? `,${nl}${ind}${ind}${ind}${pointJson}` : `${ind}${ind}${ind}${pointJson}`;
      }

      yield `${nl}${ind}${ind}]`;
      firstSensor = false;
    }

    // Gyroscope
    if (sessionData.gyroscope) {
      if (!firstSensor) yield `,${nl}`;
      yield `${ind}${ind}"gyroscope": ${prettyPrint ? '[\n' : '['}`;

      for (let i = 0; i < sessionData.gyroscope.length; i++) {
        const point = sessionData.gyroscope[i];
        const pointJson = JSON.stringify(point);
        yield i > 0 ? `,${nl}${ind}${ind}${ind}${pointJson}` : `${ind}${ind}${ind}${pointJson}`;
      }

      yield `${nl}${ind}${ind}]`;
      firstSensor = false;
    }

    // GPS
    if (sessionData.gps) {
      if (!firstSensor) yield `,${nl}`;
      yield `${ind}${ind}"gps": ${prettyPrint ? '[\n' : '['}`;

      for (let i = 0; i < sessionData.gps.length; i++) {
        const point = sessionData.gps[i];
        const pointJson = JSON.stringify(point);
        yield i > 0 ? `,${nl}${ind}${ind}${ind}${pointJson}` : `${ind}${ind}${ind}${pointJson}`;
      }

      yield `${nl}${ind}${ind}]`;
      firstSensor = false;
    }

    yield `${nl}${ind}}`;

    // Audio
    if (sessionData.audio) {
      yield `,${nl}${ind}"audio": ${JSON.stringify(sessionData.audio)}`;
    }

    // End object
    yield `${nl}}`;
  }

  /**
   * Parse imported JSON
   */
  static async parseImport(jsonString: string): Promise<SessionData> {
    try {
      const data = JSON.parse(jsonString);

      // Validate structure
      if (!data.metadata || !data.sensors) {
        throw new Error('Invalid JSON format');
      }

      const sessionData: SessionData = {
        sessionId: data.metadata.sessionId,
        sessionName: data.metadata.sessionName,
        startTime: data.metadata.startTime,
        endTime: data.metadata.endTime,
        accelerometer: data.sensors.accelerometer,
        gyroscope: data.sensors.gyroscope,
        gps: data.sensors.gps,
        audio: data.audio,
        metadata: data.metadata.custom,
      };

      return sessionData;
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error}`);
    }
  }
}
