import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { MachineData, MachineAlert } from '../../features/iot/Models/iot.model';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection!: signalR.HubConnection;
  private apiUrl = 'https://localhost:7093/machineHub'; // ⚠️ تأكد من البورت

  // Signals لتخزين البيانات وعرضها في الكومبوننت
  machines = signal<MachineData[]>([]);
  currentAlert = signal<MachineAlert | null>(null);
  connectionStatus = signal<string>('Connecting...');

  constructor() {
    this.startConnection();
  }

  private startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.apiUrl, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => {
        console.log('✅ SignalR Connected');
        this.connectionStatus.set('✅ Live Connection Active');
      })
      .catch(err => {
        console.error('❌ SignalR Error:', err);
        this.connectionStatus.set('❌ Connection Failed');
      });

    this.addListeners();
  }

  private addListeners() {
    // استقبال بيانات الماكينات
    this.hubConnection.on('ReceiveMachineData', (data: MachineData[]) => {
      // ترتيب الماكينات بالـ ID عشان ميتنططوش في الشاشة
      const sorted = data.sort((a, b) => a.machineID - b.machineID);
      this.machines.set(sorted);
    });

    // استقبال التنبيهات
    this.hubConnection.on('ReceiveAlert', (alert: MachineAlert) => {
      this.currentAlert.set(alert);
      // إخفاء التنبيه بعد 5 ثواني
      setTimeout(() => this.currentAlert.set(null), 5000);
    });
  }
}