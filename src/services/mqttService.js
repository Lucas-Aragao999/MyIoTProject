import init from 'react_native_mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  sync: {}
});

export default class MQTTService {
  constructor() {
    this.client = null;
  }

  connect(config, onMessage, onConnect, onFailure) {
    const { host, port, user, pass, clientId } = config;

    this.client = new Paho.MQTT.Client(host, port, clientId); // ← sem path

    this.client.onMessageArrived = (message) => {
      onMessage(message.destinationName, message.payloadString);
    };

    this.client.connect({
      userName: user,
      password: pass,
      onSuccess: onConnect,
      onFailure: onFailure,
      useSSL: true,
      timeout: 3,
      keepAliveInterval: 60,
    });
  }

  subscribe(topic) {
    this.client.subscribe(topic);
  }

  publish(topic, message) {
    const msg = new Paho.MQTT.Message(message);
    msg.destinationName = topic;
    this.client.send(msg);
  }
}