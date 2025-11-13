/**
 * JSON Lines (JSONL) File Handler
 * Handles reading and writing JSONL format files for sensor data
 */

import RNFS from 'react-native-fs';
import {getStorageService} from '../services/StorageService';

/**
 * JSONL Write Options
 */
export interface JSONLWriteOptions {
  /**
   * Append to existing file
   */
  append?: boolean;

  /**
   * Create parent directories if they don't exist
   */
  createDirs?: boolean;

  /**
   * Validate JSON before writing
   */
  validate?: boolean;
}

/**
 * JSONL Read Options
 */
export interface JSONLReadOptions {
  /**
   * Start reading from line number (0-indexed)
   */
  startLine?: number;

  /**
   * Maximum number of lines to read
   */
  maxLines?: number;

  /**
   * Skip invalid JSON lines instead of throwing error
   */
  skipInvalid?: boolean;
}

/**
 * Chunk Write Options
 */
export interface ChunkWriteOptions {
  /**
   * Number of records per chunk
   */
  chunkSize?: number;

  /**
   * Callback for progress updates
   */
  onProgress?: (written: number, total: number) => void;

  /**
   * Callback for each chunk written
   */
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void;
}

/**
 * Write single JSON object as JSONL line
 */
export async function writeJSONLLine(
  filePath: string,
  data: any,
  options: JSONLWriteOptions = {},
): Promise<{success: boolean; error?: string}> {
  try {
    // Validate JSON if requested
    if (options.validate) {
      try {
        JSON.parse(JSON.stringify(data));
      } catch {
        throw new Error('Invalid JSON data');
      }
    }

    // Convert to JSON string and add newline
    const line = JSON.stringify(data) + '\n';

    // Write using storage service
    const storageService = getStorageService();
    const result = await storageService.writeFile(filePath, line, {
      append: options.append !== false, // Default to append
      createDirs: options.createDirs,
    });

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {success: false, error: errorMessage};
  }
}

/**
 * Write multiple JSON objects as JSONL
 */
export async function writeJSONL(
  filePath: string,
  data: any[],
  options: JSONLWriteOptions = {},
): Promise<{success: boolean; error?: string; linesWritten?: number}> {
  try {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    // Convert all objects to JSONL format
    const lines = data.map(item => JSON.stringify(item)).join('\n') + '\n';

    // Write using storage service
    const storageService = getStorageService();
    const result = await storageService.writeFile(filePath, lines, {
      append: options.append,
      createDirs: options.createDirs,
    });

    if (result.success) {
      return {success: true, linesWritten: data.length};
    } else {
      return {success: false, error: result.error};
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {success: false, error: errorMessage};
  }
}

/**
 * Write large datasets in chunks
 * Prevents memory issues when writing large arrays
 */
export async function writeJSONLChunked(
  filePath: string,
  data: any[],
  options: ChunkWriteOptions = {},
): Promise<{
  success: boolean;
  error?: string;
  linesWritten?: number;
  chunksWritten?: number;
}> {
  try {
    const chunkSize = options.chunkSize || 1000;
    const totalChunks = Math.ceil(data.length / chunkSize);
    let linesWritten = 0;

    // First chunk overwrites, rest appends
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, data.length);
      const chunk = data.slice(start, end);

      const result = await writeJSONL(filePath, chunk, {
        append: i > 0, // First chunk overwrites, rest append
        createDirs: i === 0, // Only create dirs on first write
      });

      if (!result.success) {
        throw new Error(
          result.error || `Failed to write chunk ${i + 1}/${totalChunks}`,
        );
      }

      linesWritten += chunk.length;

      // Progress callbacks
      if (options.onProgress) {
        options.onProgress(linesWritten, data.length);
      }

      if (options.onChunkComplete) {
        options.onChunkComplete(i + 1, totalChunks);
      }
    }

    return {
      success: true,
      linesWritten,
      chunksWritten: totalChunks,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {success: false, error: errorMessage};
  }
}

/**
 * Read entire JSONL file
 */
export async function readJSONL(
  filePath: string,
  options: JSONLReadOptions = {},
): Promise<{success: boolean; data?: any[]; error?: string; linesRead?: number}> {
  try {
    const storageService = getStorageService();
    const result = await storageService.readFile(filePath);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to read file');
    }

    // Split by newlines and parse each line
    const lines = result.data.split('\n').filter(line => line.trim() !== '');
    const data: any[] = [];
    const skipInvalid = options.skipInvalid !== false;

    // Apply line range if specified
    const startLine = options.startLine || 0;
    const endLine = options.maxLines
      ? Math.min(startLine + options.maxLines, lines.length)
      : lines.length;

    for (let i = startLine; i < endLine; i++) {
      try {
        const parsed = JSON.parse(lines[i]);
        data.push(parsed);
      } catch (parseError) {
        if (!skipInvalid) {
          throw new Error(`Invalid JSON at line ${i + 1}: ${lines[i]}`);
        }
        // Skip invalid lines if skipInvalid is true
        console.warn(`Skipping invalid JSON at line ${i + 1}`);
      }
    }

    return {
      success: true,
      data,
      linesRead: data.length,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {success: false, error: errorMessage};
  }
}

/**
 * Read JSONL file line by line (streaming)
 * More memory efficient for large files
 */
export async function* readJSONLStream(
  filePath: string,
  options: JSONLReadOptions = {},
): AsyncGenerator<any, void, undefined> {
  try {
    const storageService = getStorageService();
    const result = await storageService.readFile(filePath);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to read file');
    }

    const lines = result.data.split('\n');
    const startLine = options.startLine || 0;
    const endLine = options.maxLines
      ? Math.min(startLine + options.maxLines, lines.length)
      : lines.length;
    const skipInvalid = options.skipInvalid !== false;

    for (let i = startLine; i < endLine; i++) {
      const line = lines[i].trim();
      if (line === '') continue;

      try {
        const parsed = JSON.parse(line);
        yield parsed;
      } catch (parseError) {
        if (!skipInvalid) {
          throw new Error(`Invalid JSON at line ${i + 1}: ${line}`);
        }
        console.warn(`Skipping invalid JSON at line ${i + 1}`);
      }
    }
  } catch (error) {
    console.error('Error reading JSONL stream:', error);
    throw error;
  }
}

/**
 * Count lines in JSONL file
 */
export async function countJSONLLines(
  filePath: string,
): Promise<{success: boolean; count?: number; error?: string}> {
  try {
    const storageService = getStorageService();
    const result = await storageService.readFile(filePath);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to read file');
    }

    const lines = result.data.split('\n').filter(line => line.trim() !== '');
    return {success: true, count: lines.length};
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {success: false, error: errorMessage};
  }
}

/**
 * Validate JSONL file
 * Checks if all lines are valid JSON
 */
export async function validateJSONLFile(
  filePath: string,
): Promise<{
  success: boolean;
  valid: boolean;
  totalLines?: number;
  invalidLines?: number[];
  error?: string;
}> {
  try {
    const storageService = getStorageService();
    const result = await storageService.readFile(filePath);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to read file');
    }

    const lines = result.data.split('\n').filter(line => line.trim() !== '');
    const invalidLines: number[] = [];

    for (let i = 0; i < lines.length; i++) {
      try {
        JSON.parse(lines[i]);
      } catch {
        invalidLines.push(i + 1); // 1-indexed for user display
      }
    }

    return {
      success: true,
      valid: invalidLines.length === 0,
      totalLines: lines.length,
      invalidLines,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {success: false, valid: false, error: errorMessage};
  }
}

/**
 * Merge multiple JSONL files into one
 */
export async function mergeJSONLFiles(
  inputPaths: string[],
  outputPath: string,
): Promise<{success: boolean; error?: string; totalLines?: number}> {
  try {
    let totalLines = 0;
    const storageService = getStorageService();

    for (let i = 0; i < inputPaths.length; i++) {
      const result = await storageService.readFile(inputPaths[i]);

      if (!result.success || !result.data) {
        throw new Error(
          result.error || `Failed to read file: ${inputPaths[i]}`,
        );
      }

      // Write to output (append after first file)
      const writeResult = await storageService.writeFile(
        outputPath,
        result.data,
        {
          append: i > 0,
          createDirs: i === 0,
        },
      );

      if (!writeResult.success) {
        throw new Error(
          writeResult.error || `Failed to write to: ${outputPath}`,
        );
      }

      const lines = result.data
        .split('\n')
        .filter(line => line.trim() !== '').length;
      totalLines += lines;
    }

    return {success: true, totalLines};
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {success: false, error: errorMessage};
  }
}

/**
 * Split large JSONL file into smaller chunks
 */
export async function splitJSONLFile(
  inputPath: string,
  outputDir: string,
  linesPerFile: number,
): Promise<{
  success: boolean;
  error?: string;
  filesCreated?: number;
  totalLines?: number;
}> {
  try {
    const result = await readJSONL(inputPath);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to read input file');
    }

    const data = result.data;
    const totalFiles = Math.ceil(data.length / linesPerFile);

    for (let i = 0; i < totalFiles; i++) {
      const start = i * linesPerFile;
      const end = Math.min(start + linesPerFile, data.length);
      const chunk = data.slice(start, end);

      const outputPath = `${outputDir}/part_${String(i + 1).padStart(4, '0')}.jsonl`;
      const writeResult = await writeJSONL(outputPath, chunk, {
        createDirs: true,
      });

      if (!writeResult.success) {
        throw new Error(
          writeResult.error || `Failed to write chunk ${i + 1}`,
        );
      }
    }

    return {
      success: true,
      filesCreated: totalFiles,
      totalLines: data.length,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {success: false, error: errorMessage};
  }
}

/**
 * Filter JSONL file by predicate
 * Creates a new file with only matching records
 */
export async function filterJSONL(
  inputPath: string,
  outputPath: string,
  predicate: (record: any) => boolean,
): Promise<{
  success: boolean;
  error?: string;
  inputLines?: number;
  outputLines?: number;
}> {
  try {
    const result = await readJSONL(inputPath);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to read input file');
    }

    const filtered = result.data.filter(predicate);

    const writeResult = await writeJSONL(outputPath, filtered, {
      createDirs: true,
    });

    if (!writeResult.success) {
      throw new Error(writeResult.error || 'Failed to write output file');
    }

    return {
      success: true,
      inputLines: result.data.length,
      outputLines: filtered.length,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {success: false, error: errorMessage};
  }
}

/**
 * Get JSONL file statistics
 */
export async function getJSONLStats(
  filePath: string,
): Promise<{
  success: boolean;
  stats?: {
    totalLines: number;
    validLines: number;
    invalidLines: number;
    fileSize: number;
    avgLineSize: number;
  };
  error?: string;
}> {
  try {
    const storageService = getStorageService();
    const fileInfo = await storageService.getFileInfo(filePath);

    if (!fileInfo.success || !fileInfo.info?.exists) {
      throw new Error('File does not exist');
    }

    const validation = await validateJSONLFile(filePath);

    if (!validation.success || validation.totalLines === undefined) {
      throw new Error(validation.error || 'Failed to validate file');
    }

    const stats = {
      totalLines: validation.totalLines,
      validLines: validation.totalLines - (validation.invalidLines?.length || 0),
      invalidLines: validation.invalidLines?.length || 0,
      fileSize: fileInfo.info.size,
      avgLineSize:
        validation.totalLines > 0
          ? Math.round(fileInfo.info.size / validation.totalLines)
          : 0,
    };

    return {success: true, stats};
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {success: false, error: errorMessage};
  }
}
