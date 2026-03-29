package com.smartnotes

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class VoiceModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), RecognitionListener {

    private var speechRecognizer: SpeechRecognizer? = null
    private val mainHandler = Handler(Looper.getMainLooper())
    private var isStopping = false

    override fun getName(): String = "VoiceModule"

    private fun sendEvent(eventName: String, params: WritableMap?) {
        try {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}

    @ReactMethod
    fun startSpeech(locale: String, promise: Promise) {
        isStopping = false
        mainHandler.post {
            try {
                speechRecognizer?.destroy()
                speechRecognizer = null

                if (!SpeechRecognizer.isRecognitionAvailable(reactApplicationContext)) {
                    promise.reject("NOT_AVAILABLE", "Speech recognition not available")
                    return@post
                }

                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactApplicationContext)
                speechRecognizer?.setRecognitionListener(this)

                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(
                        RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                        RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
                    )
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, locale)
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                    putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)

                    // Longer silence timeouts — keeps listening longer
                    putExtra(
                        RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS,
                        15000L
                    )
                    putExtra(
                        RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS,
                        3000L
                    )
                    putExtra(
                        RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS,
                        3000L
                    )
                }

                speechRecognizer?.startListening(intent)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("START_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun stopSpeech(promise: Promise) {
        isStopping = true
        mainHandler.post {
            try {
                speechRecognizer?.stopListening()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("STOP_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun cancelSpeech(promise: Promise) {
        isStopping = true
        mainHandler.post {
            try {
                speechRecognizer?.cancel()
                speechRecognizer?.destroy()
                speechRecognizer = null
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("CANCEL_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun destroySpeech(promise: Promise) {
        isStopping = true
        mainHandler.post {
            try {
                speechRecognizer?.cancel()
                speechRecognizer?.destroy()
                speechRecognizer = null
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("DESTROY_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun isRecognitionAvailable(promise: Promise) {
        promise.resolve(SpeechRecognizer.isRecognitionAvailable(reactApplicationContext))
    }

    // ══════════════════════════════════════════
    // RecognitionListener
    // ══════════════════════════════════════════

    override fun onReadyForSpeech(params: Bundle?) {
        if (isStopping) return
        val event = Arguments.createMap().apply {
            putBoolean("ready", true)
        }
        sendEvent("onSpeechStart", event)
    }

    override fun onBeginningOfSpeech() {
        // Don't send duplicate start
    }

    override fun onRmsChanged(rmsdB: Float) {
        if (isStopping) return
        val event = Arguments.createMap().apply {
            putDouble("value", rmsdB.toDouble())
        }
        sendEvent("onSpeechVolumeChanged", event)
    }

    override fun onBufferReceived(buffer: ByteArray?) {}

    override fun onEndOfSpeech() {
        val event = Arguments.createMap().apply {
            putBoolean("ended", true)
        }
        sendEvent("onSpeechEnd", event)
    }

    override fun onError(errorCode: Int) {
        // If user is stopping, send end event instead of error
        if (isStopping) {
            val event = Arguments.createMap().apply {
                putBoolean("ended", true)
            }
            sendEvent("onSpeechEnd", event)
            return
        }

        val errorMessage = when (errorCode) {
            SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
            SpeechRecognizer.ERROR_CLIENT -> "Client side error"
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient permissions"
            SpeechRecognizer.ERROR_NETWORK -> "Network error"
            SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
            SpeechRecognizer.ERROR_NO_MATCH -> "No speech match found"
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognition service busy"
            SpeechRecognizer.ERROR_SERVER -> "Server error"
            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech input"
            else -> "Unknown error: $errorCode"
        }

        val errorData = Arguments.createMap().apply {
            putInt("code", errorCode)
            putString("message", errorMessage)
        }

        val event = Arguments.createMap().apply {
            putMap("error", errorData)
        }

        sendEvent("onSpeechError", event)
    }

    override fun onResults(results: Bundle?) {
        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)

        val arr = Arguments.createArray()
        if (matches != null) {
            for (match in matches) {
                arr.pushString(match)
            }
        }

        val event = Arguments.createMap().apply {
            putArray("value", arr)
        }

        sendEvent("onSpeechResults", event)
    }

    override fun onPartialResults(partialResults: Bundle?) {
        if (isStopping) return

        val matches =
            partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)

        val arr = Arguments.createArray()
        if (matches != null) {
            for (match in matches) {
                arr.pushString(match)
            }
        }

        val event = Arguments.createMap().apply {
            putArray("value", arr)
        }

        sendEvent("onSpeechPartialResults", event)
    }

    override fun onEvent(eventType: Int, params: Bundle?) {}

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        mainHandler.post {
            speechRecognizer?.cancel()
            speechRecognizer?.destroy()
            speechRecognizer = null
        }
    }
}