import NetInfo from '@react-native-community/netinfo';

class NetworkManager {
  constructor() {
    this.isConnected = true;
    this.listeners = [];
  }

  init() {
    this.unsubscribe = NetInfo.addEventListener(state => {
      const prev = this.isConnected;
      this.isConnected = state.isConnected;

      if (prev !== this.isConnected) {
        this.notifyListeners(this.isConnected);
      }
    });
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  unsubscribeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  notifyListeners(status) {
    this.listeners.forEach(cb => cb(status));
  }

  getStatus() {
    return this.isConnected;
  }
}

export default new NetworkManager();
