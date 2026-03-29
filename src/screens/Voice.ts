import {NativeModules, NativeEventEmitter, Platform} from 'react-native';

const {VoiceModule} = NativeModules;

const emitter = new NativeEventEmitter(VoiceModule);

export type VoiceEvent = 'onSpeechStart' | 'onSpeechEnd' | 'onSpeechResult' | 'onSpeechPartial' | 'onSpeechError';

export const startListening = (): void => {
  VoiceModule.startListening();
};

export const stopListening = (): void => {
  VoiceModule.stopListening();
};

export const cancel = (): void => {
  VoiceModule.cancel();
};

export const destroy = (): void => {
  VoiceModule.destroy();
};

export const isAvailable = (): Promise<boolean> => {
  return VoiceModule.isAvailable();
};

export const onSpeechStart = (callback: () => void) => {
  return emitter.addListener('onSpeechStart', callback);
};

export const onSpeechEnd = (callback: () => void) => {
  return emitter.addListener('onSpeechEnd', callback);
};

export const onSpeechResult = (callback: (text: string) => void) => {
  return emitter.addListener('onSpeechResult', callback);
};

export const onSpeechPartial = (callback: (text: string) => void) => {
  return emitter.addListener('onSpeechPartial', callback);
};

export const onSpeechError = (callback: (error: string) => void) => {
  return emitter.addListener('onSpeechError', callback);
};

export default {
  startListening,
  stopListening,
  cancel,
  destroy,
  isAvailable,
  onSpeechStart,
  onSpeechEnd,
  onSpeechResult,
  onSpeechPartial,
  onSpeechError,
};