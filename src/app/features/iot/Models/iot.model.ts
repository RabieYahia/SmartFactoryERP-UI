export interface MachineData {
  machineID: number;
  status: number; // 0=Running, 1=Idle, 2=Stopped
  speed: number;
  temperature: number;
  productionCount: number;
  timestamp: string;
}

export interface MachineAlert {
  machineID: number;
  alertMessage: string;
  alertType: number;
  alertTime: string;
}