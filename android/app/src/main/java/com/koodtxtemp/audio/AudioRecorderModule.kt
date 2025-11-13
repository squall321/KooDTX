package com.koodtxtemp.audio

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.sqrt
import kotlin.math.log10

/**
 * AudioRecorderModule - Native Module for Audio Recording
 * Phase 90: Native Audio Module Structure
 *
 * Features:
 * - Initialize AudioRecord with custom configuration
 * - Calculate optimal buffer size
 * - Support for multiple sample rates (44100Hz default)
 * - PCM 16-bit format
 * - Mono/Stereo channel configuration
 */
class AudioRecorderModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "AudioRecorderModule"
        private const val MODULE_NAME = "AudioRecorderModule"

        // Event names
        private const val EVENT_AUDIO_DATA = "AudioData"
        private const val EVENT_AUDIO_ERROR = "AudioError"

        // Default audio configuration
        private const val DEFAULT_SAMPLE_RATE = 44100 // 44.1kHz (CD quality)
        private const val DEFAULT_CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
        private const val DEFAULT_AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
        private const val DEFAULT_AUDIO_SOURCE = MediaRecorder.AudioSource.VOICE_RECOGNITION

        // Buffer size multiplier (for smooth recording)
        private const val BUFFER_SIZE_MULTIPLIER = 2
    }

    // Audio recording state
    private var audioRecord: AudioRecord? = null
    private var isRecording = false
    private var isPaused = false
    private val shouldContinueRecording = AtomicBoolean(false)

    // Audio configuration
    private var sampleRate: Int = DEFAULT_SAMPLE_RATE
    private var channelConfig: Int = DEFAULT_CHANNEL_CONFIG
    private var audioFormat: Int = DEFAULT_AUDIO_FORMAT
    private var audioSource: Int = DEFAULT_AUDIO_SOURCE
    private var bufferSize: Int = 0

    // Recording thread
    private var recordingThread: Thread? = null

    // Audio data buffering
    private val audioDataBuffer = mutableListOf<Short>()
    private val BUFFER_SEND_SIZE = 4096 // Send data in chunks of 4096 samples

    // RMS and dB calculation
    private var lastRmsLevel: Double = 0.0
    private var lastDbLevel: Double = -96.0 // -96 dB is essentially silence

    // Silence detection
    private val SILENCE_THRESHOLD_DB = -50.0 // dB threshold for silence
    private var silenceDuration: Long = 0
    private var lastSoundTime: Long = System.currentTimeMillis()

    override fun getName(): String {
        return MODULE_NAME
    }

    /**
     * Initialize AudioRecord with configuration
     *
     * @param sampleRate Sample rate in Hz (e.g., 44100, 48000)
     * @param channels Number of channels (1 = mono, 2 = stereo)
     * @param bitsPerSample Bits per sample (8 or 16)
     * @param promise Promise to resolve/reject
     */
    @ReactMethod
    fun initialize(
        sampleRate: Int,
        channels: Int,
        bitsPerSample: Int,
        promise: Promise
    ) {
        try {
            // Validate and set sample rate
            this.sampleRate = when (sampleRate) {
                8000, 11025, 16000, 22050, 44100, 48000 -> sampleRate
                else -> {
                    Log.w(TAG, "Invalid sample rate $sampleRate, using default $DEFAULT_SAMPLE_RATE")
                    DEFAULT_SAMPLE_RATE
                }
            }

            // Validate and set channel configuration
            this.channelConfig = when (channels) {
                1 -> AudioFormat.CHANNEL_IN_MONO
                2 -> AudioFormat.CHANNEL_IN_STEREO
                else -> {
                    Log.w(TAG, "Invalid channel count $channels, using mono")
                    AudioFormat.CHANNEL_IN_MONO
                }
            }

            // Validate and set audio format
            this.audioFormat = when (bitsPerSample) {
                8 -> AudioFormat.ENCODING_PCM_8BIT
                16 -> AudioFormat.ENCODING_PCM_16BIT
                else -> {
                    Log.w(TAG, "Invalid bits per sample $bitsPerSample, using 16-bit")
                    AudioFormat.ENCODING_PCM_16BIT
                }
            }

            // Calculate buffer size
            this.bufferSize = calculateBufferSize()

            // Validate buffer size
            if (this.bufferSize <= 0) {
                promise.reject("BUFFER_SIZE_ERROR", "Failed to calculate valid buffer size")
                return
            }

            Log.i(TAG, "AudioRecorder initialized: " +
                    "sampleRate=$sampleRate, " +
                    "channels=$channels, " +
                    "bitsPerSample=$bitsPerSample, " +
                    "bufferSize=$bufferSize")

            // Return configuration
            val result = Arguments.createMap().apply {
                putInt("sampleRate", this@AudioRecorderModule.sampleRate)
                putInt("channels", channels)
                putInt("bitsPerSample", bitsPerSample)
                putInt("bufferSize", this@AudioRecorderModule.bufferSize)
                putString("channelConfig", if (channels == 1) "MONO" else "STEREO")
                putString("audioFormat", if (bitsPerSample == 8) "PCM_8BIT" else "PCM_16BIT")
            }

            promise.resolve(result)

        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize AudioRecorder", e)
            promise.reject("INIT_ERROR", "Failed to initialize AudioRecorder: ${e.message}", e)
        }
    }

    /**
     * Calculate optimal buffer size for AudioRecord
     *
     * Uses AudioRecord.getMinBufferSize() and applies a multiplier for smooth recording
     *
     * @return Calculated buffer size in bytes
     */
    private fun calculateBufferSize(): Int {
        val minBufferSize = AudioRecord.getMinBufferSize(
            sampleRate,
            channelConfig,
            audioFormat
        )

        if (minBufferSize == AudioRecord.ERROR || minBufferSize == AudioRecord.ERROR_BAD_VALUE) {
            Log.e(TAG, "Invalid buffer size: $minBufferSize")
            return -1
        }

        // Apply multiplier for smoother recording
        val calculatedSize = minBufferSize * BUFFER_SIZE_MULTIPLIER

        Log.d(TAG, "Buffer size: min=$minBufferSize, calculated=$calculatedSize")

        return calculatedSize
    }

    /**
     * Create AudioRecord instance
     *
     * @return Created AudioRecord instance
     * @throws IllegalStateException if initialization fails
     */
    private fun createAudioRecord(): AudioRecord {
        try {
            val record = AudioRecord(
                audioSource,
                sampleRate,
                channelConfig,
                audioFormat,
                bufferSize
            )

            if (record.state != AudioRecord.STATE_INITIALIZED) {
                throw IllegalStateException("AudioRecord not initialized properly")
            }

            Log.i(TAG, "AudioRecord created successfully")
            return record

        } catch (e: Exception) {
            Log.e(TAG, "Failed to create AudioRecord", e)
            throw IllegalStateException("Failed to create AudioRecord: ${e.message}", e)
        }
    }

    /**
     * Get current audio configuration
     *
     * @param promise Promise to resolve with configuration
     */
    @ReactMethod
    fun getConfiguration(promise: Promise) {
        try {
            val config = Arguments.createMap().apply {
                putInt("sampleRate", sampleRate)
                putInt("channelConfig", channelConfig)
                putInt("audioFormat", audioFormat)
                putInt("audioSource", audioSource)
                putInt("bufferSize", bufferSize)
                putBoolean("isRecording", isRecording)
                putBoolean("isPaused", isPaused)
                putString("state", when {
                    isRecording && !isPaused -> "RECORDING"
                    isRecording && isPaused -> "PAUSED"
                    else -> "IDLE"
                })
            }

            promise.resolve(config)

        } catch (e: Exception) {
            Log.e(TAG, "Failed to get configuration", e)
            promise.reject("CONFIG_ERROR", "Failed to get configuration: ${e.message}", e)
        }
    }

    /**
     * Check if AudioRecord is available
     *
     * @param promise Promise to resolve with availability status
     */
    @ReactMethod
    fun isAvailable(promise: Promise) {
        try {
            // Try to calculate buffer size to check availability
            val testBufferSize = AudioRecord.getMinBufferSize(
                DEFAULT_SAMPLE_RATE,
                DEFAULT_CHANNEL_CONFIG,
                DEFAULT_AUDIO_FORMAT
            )

            val available = testBufferSize != AudioRecord.ERROR &&
                    testBufferSize != AudioRecord.ERROR_BAD_VALUE

            val result = Arguments.createMap().apply {
                putBoolean("available", available)
                putInt("minBufferSize", if (available) testBufferSize else -1)
            }

            promise.resolve(result)

        } catch (e: Exception) {
            Log.e(TAG, "Failed to check availability", e)
            promise.reject("AVAILABILITY_ERROR", "Failed to check availability: ${e.message}", e)
        }
    }

    /**
     * Get recording state
     *
     * @param promise Promise to resolve with recording state
     */
    @ReactMethod
    fun getRecordingState(promise: Promise) {
        try {
            val state = Arguments.createMap().apply {
                putBoolean("isRecording", isRecording)
                putBoolean("isPaused", isPaused)
                putString("state", when {
                    isRecording && !isPaused -> "RECORDING"
                    isRecording && isPaused -> "PAUSED"
                    else -> "IDLE"
                })
                putBoolean("hasAudioRecord", audioRecord != null)
            }

            promise.resolve(state)

        } catch (e: Exception) {
            Log.e(TAG, "Failed to get recording state", e)
            promise.reject("STATE_ERROR", "Failed to get recording state: ${e.message}", e)
        }
    }

    /**
     * Start audio recording
     * Phase 91: AudioRecord start with background thread
     *
     * @param promise Promise to resolve/reject
     */
    @ReactMethod
    fun startRecording(promise: Promise) {
        try {
            if (isRecording) {
                promise.reject("ALREADY_RECORDING", "Already recording audio")
                return
            }

            // Create AudioRecord if not exists
            if (audioRecord == null) {
                audioRecord = createAudioRecord()
            }

            // Start recording
            audioRecord?.startRecording()
            isRecording = true
            isPaused = false
            shouldContinueRecording.set(true)

            // Start recording thread
            startRecordingThread()

            Log.i(TAG, "Audio recording started")
            promise.resolve(Arguments.createMap().apply {
                putBoolean("success", true)
                putString("state", "RECORDING")
            })

        } catch (e: Exception) {
            Log.e(TAG, "Failed to start recording", e)
            promise.reject("START_ERROR", "Failed to start recording: ${e.message}", e)
        }
    }

    /**
     * Stop audio recording
     * Phase 91: AudioRecord stop
     *
     * @param promise Promise to resolve/reject
     */
    @ReactMethod
    fun stopRecording(promise: Promise) {
        try {
            if (!isRecording) {
                promise.reject("NOT_RECORDING", "Not currently recording")
                return
            }

            // Signal thread to stop
            shouldContinueRecording.set(false)

            // Wait for thread to finish
            recordingThread?.join(1000)

            // Stop AudioRecord
            audioRecord?.let {
                if (it.recordingState == AudioRecord.RECORDSTATE_RECORDING) {
                    it.stop()
                }
            }

            isRecording = false
            isPaused = false

            // Clear buffer
            audioDataBuffer.clear()

            Log.i(TAG, "Audio recording stopped")
            promise.resolve(Arguments.createMap().apply {
                putBoolean("success", true)
                putString("state", "IDLE")
            })

        } catch (e: Exception) {
            Log.e(TAG, "Failed to stop recording", e)
            promise.reject("STOP_ERROR", "Failed to stop recording: ${e.message}", e)
        }
    }

    /**
     * Pause audio recording
     * Phase 91: Pause recording
     *
     * @param promise Promise to resolve/reject
     */
    @ReactMethod
    fun pauseRecording(promise: Promise) {
        try {
            if (!isRecording || isPaused) {
                promise.reject("INVALID_STATE", "Cannot pause: not recording or already paused")
                return
            }

            isPaused = true
            Log.i(TAG, "Audio recording paused")

            promise.resolve(Arguments.createMap().apply {
                putBoolean("success", true)
                putString("state", "PAUSED")
            })

        } catch (e: Exception) {
            Log.e(TAG, "Failed to pause recording", e)
            promise.reject("PAUSE_ERROR", "Failed to pause recording: ${e.message}", e)
        }
    }

    /**
     * Resume audio recording
     * Phase 91: Resume recording
     *
     * @param promise Promise to resolve/reject
     */
    @ReactMethod
    fun resumeRecording(promise: Promise) {
        try {
            if (!isRecording || !isPaused) {
                promise.reject("INVALID_STATE", "Cannot resume: not paused")
                return
            }

            isPaused = false
            Log.i(TAG, "Audio recording resumed")

            promise.resolve(Arguments.createMap().apply {
                putBoolean("success", true)
                putString("state", "RECORDING")
            })

        } catch (e: Exception) {
            Log.e(TAG, "Failed to resume recording", e)
            promise.reject("RESUME_ERROR", "Failed to resume recording: ${e.message}", e)
        }
    }

    /**
     * Start recording thread
     * Phase 91: Background thread recording with PCM data reading
     */
    private fun startRecordingThread() {
        recordingThread = Thread {
            android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_AUDIO)

            val audioData = ShortArray(bufferSize / 2) // 16-bit = 2 bytes per sample
            Log.d(TAG, "Recording thread started, buffer size: ${audioData.size}")

            while (shouldContinueRecording.get()) {
                try {
                    // Read PCM data
                    val readResult = audioRecord?.read(audioData, 0, audioData.size) ?: 0

                    if (readResult > 0 && !isPaused) {
                        // Calculate RMS and dB
                        val rms = calculateRMS(audioData, readResult)
                        val db = calculateDB(rms)

                        lastRmsLevel = rms
                        lastDbLevel = db

                        // Detect silence
                        val isSilent = detectSilence(db)

                        // Buffer audio data
                        synchronized(audioDataBuffer) {
                            for (i in 0 until readResult) {
                                audioDataBuffer.add(audioData[i])
                            }

                            // Send data when buffer is full
                            if (audioDataBuffer.size >= BUFFER_SEND_SIZE) {
                                sendAudioData()
                            }
                        }

                    } else if (readResult == AudioRecord.ERROR_INVALID_OPERATION) {
                        Log.e(TAG, "Invalid operation error")
                        sendErrorEvent("Invalid operation during recording")
                        break
                    } else if (readResult == AudioRecord.ERROR_BAD_VALUE) {
                        Log.e(TAG, "Bad value error")
                        sendErrorEvent("Bad value error during recording")
                        break
                    }

                } catch (e: Exception) {
                    Log.e(TAG, "Error in recording thread", e)
                    sendErrorEvent("Recording error: ${e.message}")
                    break
                }
            }

            // Send remaining buffered data
            synchronized(audioDataBuffer) {
                if (audioDataBuffer.isNotEmpty()) {
                    sendAudioData()
                }
            }

            Log.d(TAG, "Recording thread finished")
        }

        recordingThread?.start()
    }

    /**
     * Calculate RMS (Root Mean Square) level
     * Phase 91: RMS level calculation
     *
     * @param audioData PCM audio data
     * @param length Number of samples to process
     * @return RMS level
     */
    private fun calculateRMS(audioData: ShortArray, length: Int): Double {
        var sum = 0.0
        for (i in 0 until length) {
            val normalized = audioData[i].toDouble() / Short.MAX_VALUE
            sum += normalized * normalized
        }
        return sqrt(sum / length)
    }

    /**
     * Calculate dB level from RMS
     * Phase 91: dB conversion
     *
     * @param rms RMS level
     * @return dB level
     */
    private fun calculateDB(rms: Double): Double {
        return if (rms > 0) {
            20 * log10(rms)
        } else {
            -96.0 // Minimum dB level
        }
    }

    /**
     * Detect silence
     * Phase 91: Silence detection
     *
     * @param db Current dB level
     * @return True if silence detected
     */
    private fun detectSilence(db: Double): Boolean {
        val currentTime = System.currentTimeMillis()

        return if (db < SILENCE_THRESHOLD_DB) {
            // Silence detected
            if (silenceDuration == 0L) {
                silenceDuration = currentTime - lastSoundTime
            }
            true
        } else {
            // Sound detected
            lastSoundTime = currentTime
            silenceDuration = 0
            false
        }
    }

    /**
     * Send audio data to React Native
     * Phase 91: RN Bridge data transmission
     */
    private fun sendAudioData() {
        try {
            val dataToSend = audioDataBuffer.toList()
            audioDataBuffer.clear()

            val audioArray = Arguments.createArray()
            dataToSend.forEach { sample ->
                audioArray.pushInt(sample.toInt())
            }

            val params = Arguments.createMap().apply {
                putArray("data", audioArray)
                putDouble("timestamp", System.currentTimeMillis().toDouble())
                putInt("sampleRate", sampleRate)
                putInt("channels", if (channelConfig == AudioFormat.CHANNEL_IN_MONO) 1 else 2)
                putDouble("rmsLevel", lastRmsLevel)
                putDouble("dbLevel", lastDbLevel)
                putBoolean("isSilent", lastDbLevel < SILENCE_THRESHOLD_DB)
            }

            sendEvent(EVENT_AUDIO_DATA, params)

        } catch (e: Exception) {
            Log.e(TAG, "Failed to send audio data", e)
        }
    }

    /**
     * Send event to JavaScript
     *
     * @param eventName Event name
     * @param params Event parameters
     */
    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    /**
     * Send error event to JavaScript
     *
     * @param error Error message
     */
    private fun sendErrorEvent(error: String) {
        val params = Arguments.createMap().apply {
            putString("error", error)
            putDouble("timestamp", System.currentTimeMillis().toDouble())
        }
        sendEvent(EVENT_AUDIO_ERROR, params)
    }

    /**
     * Clean up resources
     */
    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        try {
            audioRecord?.let {
                if (it.state == AudioRecord.STATE_INITIALIZED) {
                    it.stop()
                }
                it.release()
            }
            audioRecord = null
            isRecording = false
            isPaused = false
            Log.i(TAG, "AudioRecorderModule destroyed and cleaned up")
        } catch (e: Exception) {
            Log.e(TAG, "Error during cleanup", e)
        }
    }
}
