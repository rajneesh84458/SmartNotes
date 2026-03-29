// import {useState, useCallback, useEffect, useRef} from 'react';
// import {Alert, Platform, PermissionsAndroid, Linking} from 'react-native';
// import Voice from '../screens/Voice';

// const useVoiceToText = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [spokenText, setSpokenText] = useState('');
//   const [partialText, setPartialText] = useState('');
//   const [error, setError] = useState(null);
//   const [isAvailable, setIsAvailable] = useState(false);
//   const [permissionGranted, setPermissionGranted] = useState(
//     Platform.OS === 'ios' ? true : false,
//   );

//   // Track whether we want continuous listening (auto-restart after each segment)
//   const continuousRef = useRef(false);
//   const accumulatedTextRef = useRef('');

//   // ────────── Setup & Cleanup ──────────
//   useEffect(() => {
//     // Check availability
//     Voice.isAvailable()
//       .then(available => setIsAvailable(available))
//       .catch(() => setIsAvailable(false));

//     // Request permission on mount
//     requestPermissions();

//     // Subscribe to native events
//     const subStart = Voice.onSpeechStart(() => {
//       setIsListening(true);
//       setError(null);
//     });

//     const subEnd = Voice.onSpeechEnd(() => {
//       // If continuous mode, auto-restart after a brief delay
//       if (continuousRef.current) {
//         setTimeout(() => {
//           if (continuousRef.current) {
//             try {
//               Voice.startListening();
//             } catch (e) {
//               console.warn('Auto-restart failed:', e);
//               setIsListening(false);
//               continuousRef.current = false;
//             }
//           }
//         }, 300);
//       } else {
//         setIsListening(false);
//       }
//     });

//     const subResult = Voice.onSpeechResult(text => {
//       if (text) {
//         // Append to accumulated text
//         accumulatedTextRef.current = accumulatedTextRef.current
//           ? `${accumulatedTextRef.current} ${text}`
//           : text;
//         setSpokenText(accumulatedTextRef.current);
//         setPartialText('');
//       }
//     });

//     const subPartial = Voice.onSpeechPartial(text => {
//       if (text) {
//         setPartialText(text);
//       }
//     });

//     const subError = Voice.onSpeechError(errMsg => {
//       console.warn('Speech error:', errMsg);
//       // "No match found" and "Speech timeout" are non-fatal during continuous listening
//       if (
//         continuousRef.current &&
//         (errMsg.includes('No match') || errMsg.includes('timeout'))
//       ) {
//         // Auto-restart
//         setTimeout(() => {
//           if (continuousRef.current) {
//             try {
//               Voice.startListening();
//             } catch (_) {}
//           }
//         }, 500);
//         return;
//       }
//       setError(errMsg);
//       setIsListening(false);
//       continuousRef.current = false;
//     });

//     return () => {
//       subStart.remove();
//       subEnd.remove();
//       subResult.remove();
//       subPartial.remove();
//       subError.remove();
//       Voice.destroy();
//     };
//   }, []);

//   // ────────── Request Permissions ──────────
//   const requestPermissions = async () => {
//     try {
//       if (Platform.OS === 'android') {
//         const hasPermission = await PermissionsAndroid.check(
//           PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//         );

//         if (hasPermission) {
//           setPermissionGranted(true);
//           return true;
//         }

//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//           {
//             title: 'Microphone Permission',
//             message:
//               'This app needs access to your microphone for speech recognition.',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           },
//         );

//         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//           setPermissionGranted(true);
//           return true;
//         } else {
//           setPermissionGranted(false);
//           return false;
//         }
//       } else {
//         setPermissionGranted(true);
//         return true;
//       }
//     } catch (err) {
//       console.error('Permission error:', err);
//       setPermissionGranted(false);
//       return false;
//     }
//   };

//   // ────────── Start Listening ──────────
//   const startListening = useCallback(async () => {
//     try {
//       setError(null);

//       if (!permissionGranted) {
//         const hasPermission = await requestPermissions();
//         if (!hasPermission) {
//           Alert.alert(
//             'Permission Required',
//             'Microphone permission is needed for voice input.',
//             [
//               {text: 'Cancel', style: 'cancel'},
//               {text: 'Open Settings', onPress: () => Linking.openSettings()},
//             ],
//           );
//           return;
//         }
//       }

//       // Enable continuous mode & clear previous text
//       continuousRef.current = true;
//       accumulatedTextRef.current = '';
//       setSpokenText('');
//       setPartialText('Listening...');

//       Voice.startListening();
//     } catch (err) {
//       console.error('Start listening error:', err);
//       setError(err?.message || 'Failed to start speech recognition');
//       setIsListening(false);
//       continuousRef.current = false;
//     }
//   }, [permissionGranted]);

//   // ────────── Stop Listening ──────────
//   const stopListening = useCallback(async () => {
//     continuousRef.current = false;
//     setPartialText('');
//     try {
//       Voice.stopListening();
//     } catch (_) {}
//     setIsListening(false);
//   }, []);

//   // ────────── Cancel ──────────
//   const cancelListening = useCallback(async () => {
//     continuousRef.current = false;
//     setPartialText('');
//     try {
//       Voice.cancel();
//     } catch (_) {}
//     setIsListening(false);
//   }, []);

//   // ────────── Toggle ──────────
//   const toggleListening = useCallback(async () => {
//     if (isListening) {
//       await stopListening();
//     } else {
//       await startListening();
//     }
//   }, [isListening, startListening, stopListening]);

//   // ────────── Reset ──────────
//   const resetText = useCallback(() => {
//     accumulatedTextRef.current = '';
//     setSpokenText('');
//     setPartialText('');
//     setError(null);
//   }, []);

//   return {
//     isListening,
//     spokenText,
//     partialText,
//     error,
//     isAvailable,
//     permissionGranted,
//     requestPermissions,
//     startListening,
//     stopListening,
//     cancelListening,
//     toggleListening,
//     resetText,
//   };
// };

// export default useVoiceToText;


import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  Platform,
  PermissionsAndroid,
  Linking,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

const { VoiceModule } = NativeModules;
const voiceEmitter = VoiceModule ? new NativeEventEmitter(VoiceModule) : null;

console.log('🔍 VoiceModule:', VoiceModule ? 'Found ✅' : 'NOT FOUND ❌');

const useVoiceToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [partialText, setPartialText] = useState('');
  const [error, setError] = useState(null);
  const [isAvailable] = useState(!!VoiceModule);
  const [permissionGranted, setPermissionGranted] = useState(
    Platform.OS === 'ios' ? true : false,
  );

  const continuousRef = useRef(false);
  const accumulatedTextRef = useRef('');
  const onResultCallbackRef = useRef(null);
  const isStoppingRef = useRef(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    if (!voiceEmitter) {
      console.warn('⚠️ VoiceModule not available');
      return;
    }

    const onStart = voiceEmitter.addListener('onSpeechStart', () => {
      console.log('🎙️ Speech started');
      setIsListening(true);
      setError(null);
    });

    const onEnd = voiceEmitter.addListener('onSpeechEnd', () => {
      console.log('🎙️ Speech ended');

      // If user is stopping, don't restart
      if (isStoppingRef.current) {
        console.log('🛑 User stopped, not restarting');
        setIsListening(false);
        setPartialText('');
        return;
      }

      if (continuousRef.current) {
        console.log('🔄 Restarting for continuous listening...');
        setPartialText('Listening...');
        setTimeout(async () => {
          if (continuousRef.current && !isStoppingRef.current && VoiceModule) {
            try {
              await VoiceModule.startSpeech('en-US');
              console.log('✅ Restarted');
            } catch (err) {
              console.error('❌ Restart error:', err);
              // Destroy and retry
              setTimeout(async () => {
                if (continuousRef.current && !isStoppingRef.current) {
                  try {
                    await VoiceModule.destroySpeech();
                    await VoiceModule.startSpeech('en-US');
                  } catch (e) {
                    console.error('❌ Final restart failed:', e);
                    continuousRef.current = false;
                    setIsListening(false);
                    setPartialText('');
                  }
                }
              }, 500);
            }
          }
        }, 400);
      } else {
        setIsListening(false);
        setPartialText('');
      }
    });

    const onResults = voiceEmitter.addListener('onSpeechResults', (event) => {
      console.log('📝 Final Results:', JSON.stringify(event));

      // Don't process results if user is stopping
      if (isStoppingRef.current && !continuousRef.current) {
        // Still process final result even when stopping
      }

      const results = event?.value;
      if (results && results.length > 0) {
        const newText = results[0];
        console.log('📝 Recognized text:', newText);

        if (newText && String(newText).trim()) {
          if (accumulatedTextRef.current) {
            accumulatedTextRef.current =
              accumulatedTextRef.current + ' ' + String(newText).trim();
          } else {
            accumulatedTextRef.current = String(newText).trim();
          }

          const accumulated = accumulatedTextRef.current;
          console.log('📝 Accumulated:', accumulated);

          setSpokenText(accumulated);
          setPartialText('');

          if (onResultCallbackRef.current) {
            console.log('📝 Calling onResult callback');
            onResultCallbackRef.current(accumulated);
          }
        }
      }
    });

    const onPartial = voiceEmitter.addListener(
      'onSpeechPartialResults',
      (event) => {
        const results = event?.value;
        if (results && results.length > 0) {
          const text = String(results[0]);
          if (text.trim()) {
            // Show accumulated + current partial
            const prefix = accumulatedTextRef.current
              ? accumulatedTextRef.current + ' '
              : '';
            setPartialText(prefix + text);
          }
        }
      },
    );

    const onError = voiceEmitter.addListener('onSpeechError', (event) => {
      console.log('⚠️ Speech Error:', JSON.stringify(event));

      const errorCode = event?.error?.code;
      const errorMessage = event?.error?.message || 'Speech recognition error';

      // If user is stopping, ignore all errors
      if (isStoppingRef.current) {
        console.log('🛑 Ignoring error — user is stopping');
        setIsListening(false);
        setPartialText('');
        return;
      }

      // Recoverable errors in continuous mode:
      // 6 = No speech input (silence timeout)
      // 7 = No match found
      // 8 = Recognition busy (can retry)
      const isRecoverable =
        errorCode === 6 || errorCode === 7 || errorCode === 8;

      if (continuousRef.current && isRecoverable) {
        console.log(
          '🔄 Recoverable error (code:',
          errorCode,
          '), restarting...',
        );
        setPartialText('Listening...');

        setTimeout(async () => {
          if (continuousRef.current && !isStoppingRef.current && VoiceModule) {
            try {
              // Destroy old instance before restarting
              try {
                await VoiceModule.destroySpeech();
              } catch (e) {}

              await VoiceModule.startSpeech('en-US');
              console.log('✅ Restarted after error');
            } catch (err) {
              console.error('❌ Restart after error failed:', err);
              // One more retry
              setTimeout(async () => {
                if (continuousRef.current && !isStoppingRef.current) {
                  try {
                    await VoiceModule.startSpeech('en-US');
                  } catch (e) {
                    console.error('❌ Final restart failed');
                    continuousRef.current = false;
                    setIsListening(false);
                    setPartialText('');
                    setError('Speech recognition stopped. Tap mic to try again.');
                  }
                }
              }, 800);
            }
          }
        }, 500);
        return;
      }

      // Non-continuous mode OR non-recoverable error
      console.error('❌ Error:', errorMessage);
      setError(errorMessage);
      setIsListening(false);
      setPartialText('');
      continuousRef.current = false;
    });

    const onVolume = voiceEmitter.addListener(
      'onSpeechVolumeChanged',
      () => {},
    );

    return () => {
      onStart.remove();
      onEnd.remove();
      onResults.remove();
      onPartial.remove();
      onError.remove();
      onVolume.remove();
      continuousRef.current = false;
      isStoppingRef.current = false;
    };
  }, []);

  // ────────── Request Permissions ──────────
  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );

        if (hasPermission) {
          setPermissionGranted(true);
          return true;
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message:
              'This app needs access to your microphone for speech recognition.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionGranted(true);
          return true;
        } else {
          setPermissionGranted(false);
          return false;
        }
      } else {
        setPermissionGranted(true);
        return true;
      }
    } catch (err) {
      console.error('❌ Permission error:', err);
      setPermissionGranted(false);
      return false;
    }
  };

  // ────────── Start Listening ──────────
  const startListening = useCallback(
    async (options = {}) => {
      try {
        setError(null);

        if (!VoiceModule) {
          setError('Voice module not found. Rebuild the app.');
          return;
        }

        if (!permissionGranted) {
          const hasPermission = await requestPermissions();
          if (!hasPermission) {
            Alert.alert(
              'Permission Required',
              'Microphone permission is needed for voice input.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Open Settings',
                  onPress: () => Linking.openSettings(),
                },
              ],
            );
            return;
          }
        }

        const { continuous = true, onResult = null } = options;

        // Reset
        isStoppingRef.current = false;
        accumulatedTextRef.current = '';
        setSpokenText('');
        setPartialText('Listening...');

        continuousRef.current = continuous;
        onResultCallbackRef.current = onResult;

        console.log('🎙️ Starting speech (continuous:', continuous, ')');

        // Destroy any previous instance
        try {
          await VoiceModule.destroySpeech();
        } catch (e) {}

        await VoiceModule.startSpeech('en-US');
        console.log('✅ startSpeech resolved');
      } catch (err) {
        console.error('❌ Start Error:', err);
        setError('Failed to start: ' + (err.message || err));
        continuousRef.current = false;
        isStoppingRef.current = false;
        setIsListening(false);
        setPartialText('');
      }
    },
    [permissionGranted],
  );

  // ────────── Stop Listening (graceful) ──────────
  const stopListening = useCallback(async () => {
    try {
      console.log('🛑 Stopping gracefully...');

      // Set stopping flag FIRST — prevents restarts
      isStoppingRef.current = true;
      continuousRef.current = false;

      // Small delay to let any pending result come through
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (VoiceModule) {
        try {
          await VoiceModule.stopSpeech();
          console.log('✅ stopSpeech done');
        } catch (e) {
          console.log('⚠️ stopSpeech failed, destroying...');
          try {
            await VoiceModule.destroySpeech();
          } catch (e2) {}
        }
      }

      // Final state cleanup after a short delay
      setTimeout(() => {
        setIsListening(false);
        setPartialText('');
        isStoppingRef.current = false;

        // Send final accumulated text via callback
        if (onResultCallbackRef.current && accumulatedTextRef.current) {
          onResultCallbackRef.current(accumulatedTextRef.current);
        }
        onResultCallbackRef.current = null;
      }, 300);
    } catch (err) {
      console.error('❌ Stop Error:', err);
      continuousRef.current = false;
      isStoppingRef.current = false;
      setIsListening(false);
      setPartialText('');
      onResultCallbackRef.current = null;
    }
  }, []);

  // ────────── Cancel ──────────
  const cancelListening = useCallback(async () => {
    try {
      console.log('🛑 Cancelling...');
      isStoppingRef.current = true;
      continuousRef.current = false;
      onResultCallbackRef.current = null;

      if (VoiceModule) {
        try {
          await VoiceModule.cancelSpeech();
        } catch (e) {
          try {
            await VoiceModule.destroySpeech();
          } catch (e2) {}
        }
      }

      setIsListening(false);
      setPartialText('');

      setTimeout(() => {
        isStoppingRef.current = false;
      }, 500);
    } catch (err) {
      console.error('❌ Cancel Error:', err);
      continuousRef.current = false;
      isStoppingRef.current = false;
      setIsListening(false);
      setPartialText('');
    }
  }, []);

  // ────────── Toggle ──────────
  const toggleListening = useCallback(
    async (options = {}) => {
      if (isListening || continuousRef.current) {
        await stopListening();
      } else {
        await startListening(options);
      }
    },
    [isListening, startListening, stopListening],
  );

  // ────────── Reset ──────────
  const resetText = useCallback(() => {
    setSpokenText('');
    setPartialText('');
    setError(null);
    accumulatedTextRef.current = '';
  }, []);

  // ────────── Cleanup on unmount ──────────
  useEffect(() => {
    return () => {
      continuousRef.current = false;
      isStoppingRef.current = true;
      onResultCallbackRef.current = null;
      if (VoiceModule) {
        try {
          VoiceModule.destroySpeech();
        } catch (e) {}
      }
    };
  }, []);

  return {
    isListening,
    spokenText,
    partialText,
    error,
    isAvailable,
    permissionGranted,
    requestPermissions,
    startListening,
    stopListening,
    cancelListening,
    toggleListening,
    resetText,
  };
};

export default useVoiceToText;