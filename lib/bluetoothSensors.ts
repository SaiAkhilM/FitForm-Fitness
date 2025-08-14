import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';

export interface SensorData {
  timestamp: number;
  sensorType: 'wrist' | 'elbow' | 'shoulder';
  acceleration: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  quaternion: { w: number; x: number; y: number; z: number };
  battery?: number;
}

export interface SensorDevice {
  id: string;
  name: string;
  type: 'wrist' | 'elbow' | 'shoulder';
  device: Device;
  isConnected: boolean;
  batteryLevel?: number;
}

export interface BluetoothSensorConfig {
  serviceUUID: string;
  dataCharacteristicUUID: string;
  batteryCharacteristicUUID: string;
  deviceNamePrefix: string;
}

export class BluetoothSensorService {
  private bleManager: BleManager;
  private isScanning = false;
  private connectedSensors: Map<string, SensorDevice> = new Map();
  private dataCallbacks: ((data: SensorData) => void)[] = [];
  private connectionCallbacks: ((sensors: SensorDevice[]) => void)[] = [];

  // FitForm sensor configuration
  private config: BluetoothSensorConfig = {
    serviceUUID: '12345678-1234-1234-1234-123456789abc', // Custom UUID for FitForm sensors
    dataCharacteristicUUID: '12345678-1234-1234-1234-123456789abd',
    batteryCharacteristicUUID: '12345678-1234-1234-1234-123456789abe',
    deviceNamePrefix: 'FitForm',
  };

  constructor() {
    this.bleManager = new BleManager();
  }

  async initialize(): Promise<void> {
    try {
      // Check Bluetooth permissions
      await this.requestPermissions();

      // Initialize BLE manager
      const state = await this.bleManager.state();
      if (state !== 'PoweredOn') {
        throw new Error(`Bluetooth is not enabled. Current state: ${state}`);
      }

      console.log('Bluetooth sensor service initialized');
    } catch (error) {
      console.error('Failed to initialize Bluetooth sensor service:', error);
      throw error;
    }
  }

  private async requestPermissions(): Promise<void> {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      
      for (const permission of permissions) {
        if (granted[permission] !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error(`Permission ${permission} not granted`);
        }
      }
    }
  }

  async startScanning(): Promise<void> {
    if (this.isScanning) return;

    try {
      this.isScanning = true;
      
      this.bleManager.startDeviceScan(
        [this.config.serviceUUID],
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error('Scanning error:', error);
            return;
          }

          if (device && device.name?.startsWith(this.config.deviceNamePrefix)) {
            this.handleDeviceDiscovered(device);
          }
        }
      );

      // Stop scanning after 30 seconds
      setTimeout(() => {
        this.stopScanning();
      }, 30000);

    } catch (error) {
      console.error('Failed to start scanning:', error);
      this.isScanning = false;
      throw error;
    }
  }

  stopScanning(): void {
    if (this.isScanning) {
      this.bleManager.stopDeviceScan();
      this.isScanning = false;
    }
  }

  private async handleDeviceDiscovered(device: Device): Promise<void> {
    try {
      // Determine sensor type from device name
      const sensorType = this.getSensorTypeFromName(device.name || '');
      
      console.log(`Discovered FitForm sensor: ${device.name} (${sensorType})`);

      // Don't connect if we already have this sensor type
      if (this.getSensorByType(sensorType)) {
        return;
      }

      // Connect to the device
      await this.connectToSensor(device, sensorType);
      
    } catch (error) {
      console.error(`Failed to handle discovered device ${device.id}:`, error);
    }
  }

  private getSensorTypeFromName(name: string): 'wrist' | 'elbow' | 'shoulder' {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('wrist')) return 'wrist';
    if (lowerName.includes('elbow')) return 'elbow';
    if (lowerName.includes('shoulder')) return 'shoulder';
    
    // Default assignment based on order of discovery
    const connectedCount = this.connectedSensors.size;
    return connectedCount === 0 ? 'wrist' : connectedCount === 1 ? 'elbow' : 'shoulder';
  }

  private async connectToSensor(device: Device, sensorType: 'wrist' | 'elbow' | 'shoulder'): Promise<void> {
    try {
      console.log(`Connecting to ${sensorType} sensor: ${device.name}`);

      // Connect to device
      const connectedDevice = await device.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();

      const sensorDevice: SensorDevice = {
        id: device.id,
        name: device.name || 'Unknown',
        type: sensorType,
        device: connectedDevice,
        isConnected: true,
      };

      this.connectedSensors.set(device.id, sensorDevice);

      // Start data notifications
      await this.startDataNotifications(sensorDevice);

      // Get initial battery level
      await this.updateBatteryLevel(sensorDevice);

      // Notify connection callbacks
      this.notifyConnectionCallbacks();

      console.log(`Successfully connected to ${sensorType} sensor`);
      
    } catch (error) {
      console.error(`Failed to connect to sensor ${device.id}:`, error);
      throw error;
    }
  }

  private async startDataNotifications(sensor: SensorDevice): Promise<void> {
    try {
      // Note: Using correct BLE PLX API method
      await sensor.device.monitorCharacteristicForService(
        this.config.serviceUUID,
        this.config.dataCharacteristicUUID,
        (error, characteristic) => {
          if (error) {
            console.error(`Data notification error for ${sensor.type}:`, error);
            return;
          }

          if (characteristic?.value) {
            const sensorData = this.parseIncomingSensorData(characteristic.value, sensor.type);
            this.notifyDataCallbacks(sensorData);
          }
        }
      );

    } catch (error) {
      console.error(`Failed to start data notifications for ${sensor.type}:`, error);
    }
  }

  private parseIncomingSensorData(base64Data: string, sensorType: 'wrist' | 'elbow' | 'shoulder'): SensorData {
    // Mock data parsing - in production, this would parse the actual sensor protocol
    const timestamp = Date.now();
    
    // Generate realistic mock sensor data
    const mockData: SensorData = {
      timestamp,
      sensorType,
      acceleration: {
        x: (Math.random() - 0.5) * 4, // ±2g
        y: (Math.random() - 0.5) * 4,
        z: 9.8 + (Math.random() - 0.5) * 2, // ~1g with noise
      },
      gyroscope: {
        x: (Math.random() - 0.5) * 250, // ±125 deg/s
        y: (Math.random() - 0.5) * 250,
        z: (Math.random() - 0.5) * 250,
      },
      quaternion: {
        w: Math.random(),
        x: Math.random() - 0.5,
        y: Math.random() - 0.5,
        z: Math.random() - 0.5,
      },
      battery: 75 + Math.random() * 25, // 75-100%
    };

    // Normalize quaternion
    const qMag = Math.sqrt(mockData.quaternion.w ** 2 + mockData.quaternion.x ** 2 + 
                          mockData.quaternion.y ** 2 + mockData.quaternion.z ** 2);
    mockData.quaternion.w /= qMag;
    mockData.quaternion.x /= qMag;
    mockData.quaternion.y /= qMag;
    mockData.quaternion.z /= qMag;

    return mockData;
  }

  private async updateBatteryLevel(sensor: SensorDevice): Promise<void> {
    try {
      const batteryCharacteristic = await sensor.device.readCharacteristicForService(
        this.config.serviceUUID,
        this.config.batteryCharacteristicUUID
      );

      if (batteryCharacteristic.value) {
        // Mock battery level - in production, parse actual battery data
        sensor.batteryLevel = 80 + Math.random() * 20; // 80-100%
      }
    } catch (error) {
      console.warn(`Failed to read battery level for ${sensor.type}:`, error);
    }
  }

  async disconnectAllSensors(): Promise<void> {
    const disconnectPromises: Promise<void>[] = [];

    for (const sensor of this.connectedSensors.values()) {
      if (sensor.isConnected) {
        disconnectPromises.push(
          sensor.device.cancelConnection().then(() => {}).catch(error => {
            console.error(`Failed to disconnect sensor ${sensor.id}:`, error);
          })
        );
      }
    }

    await Promise.allSettled(disconnectPromises);
    this.connectedSensors.clear();
    this.notifyConnectionCallbacks();
  }

  getConnectedSensors(): SensorDevice[] {
    return Array.from(this.connectedSensors.values());
  }

  getSensorByType(type: 'wrist' | 'elbow' | 'shoulder'): SensorDevice | undefined {
    return Array.from(this.connectedSensors.values()).find(sensor => sensor.type === type);
  }

  onSensorData(callback: (data: SensorData) => void): void {
    this.dataCallbacks.push(callback);
  }

  onConnectionChange(callback: (sensors: SensorDevice[]) => void): void {
    this.connectionCallbacks.push(callback);
  }

  private notifyDataCallbacks(data: SensorData): void {
    this.dataCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in sensor data callback:', error);
      }
    });
  }

  private notifyConnectionCallbacks(): void {
    const sensors = this.getConnectedSensors();
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(sensors);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  // Start mock data generation for development/testing
  startMockDataGeneration(): void {
    const sensorTypes: ('wrist' | 'elbow' | 'shoulder')[] = ['wrist', 'elbow', 'shoulder'];
    
    sensorTypes.forEach(type => {
      setInterval(() => {
        const mockData = this.parseIncomingSensorData('', type);
        this.notifyDataCallbacks(mockData);
      }, 10); // 100Hz
    });

    // Mock connected sensors
    sensorTypes.forEach((type, index) => {
      const mockSensor: SensorDevice = {
        id: `mock_${type}`,
        name: `FitForm ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        type,
        device: {} as Device, // Mock device
        isConnected: true,
        batteryLevel: 85 + Math.random() * 15,
      };
      this.connectedSensors.set(mockSensor.id, mockSensor);
    });

    this.notifyConnectionCallbacks();
  }

  destroy(): void {
    this.stopScanning();
    this.disconnectAllSensors();
    this.dataCallbacks = [];
    this.connectionCallbacks = [];
    this.bleManager.destroy();
  }
}

export default BluetoothSensorService;