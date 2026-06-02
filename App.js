import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MQTTService from './src/services/mqttService';
import StatusModal from './src/components/StatusModal';
import LightControl from './src/components/LightControl';
import Gauges from './src/components/Gauges';
import { MQTT_HOST, MQTT_PORT, MQTT_USER, MQTT_PASS } from '@env';

const mqtt = new MQTTService();

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [temp, setTemp] = useState(0);
  const [hum, setHum] = useState(0);

  const mqttConfig = {
    host: MQTT_HOST,
    port: parseInt(MQTT_PORT),
    user: MQTT_USER,
    pass: MQTT_PASS,
    clientId: 'RN_App_' + Math.random(),
  };

  const startConnection = () => {
    setShowError(false);
    mqtt.connect(
      mqttConfig,
      (topic, message) => {
        if (topic === 'casa/temp') setTemp(parseFloat(message));
        if (topic === 'casa/umid') setHum(parseFloat(message));
        if (topic === 'casa/luz') setIsLightOn(message === "1");
      },
      () => {
        setIsConnected(true);
        mqtt.subscribe('casa/temp');
        mqtt.subscribe('casa/umid');
        mqtt.subscribe('casa/luz');
      },
      () => {
        setIsConnected(false);
        setShowError(true);
      }
    );
  };

  const toggleLight = () => {
    const newState = isLightOn ? "0" : "1";
    mqtt.publish('casa/luz', newState);
  };

  useEffect(() => {
    startConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Smart Home IoT</Text>
      <LightControl isLightOn={isLightOn} onToggle={toggleLight} />
      <Gauges temp={temp} hum={hum} />
      <StatusModal
        visible={showError}
        onRetry={startConnection}
        onLater={() => setShowError(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, alignItems: 'center' },
  header: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 20 },
});