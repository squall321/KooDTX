package com.koodtxtemp.audio

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * AudioPackage - React Native Package for Audio Recorder Module
 * Phase 90: Native Audio Module Structure
 *
 * Registers the AudioRecorderModule with React Native
 */
class AudioPackage : ReactPackage {

    /**
     * Create native modules to register with React Native
     */
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(AudioRecorderModule(reactContext))
    }

    /**
     * Create view managers (not needed for this module)
     */
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
