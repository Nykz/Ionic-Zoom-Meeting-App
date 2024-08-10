import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonText, IonButton, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { ZoomService } from '../services/zoom/zoom.service';
import { DatePipe } from '@angular/common';
import { ZoomMtg } from '@zoom/meetingsdk';
import { environment } from 'src/environments/environment';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButtons, IonButton, 
    IonText,
    IonLabel,
    IonItem,
    IonList,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    DatePipe,
  ],
})
export class HomePage {
  
  meetings: any[] = [];
  meeting: any = {};
  
  private zoom = inject(ZoomService);

  constructor() {}

  ngOnInit() {
    // let myElement = document.getElementById('zmmtg-root')!;
    // myElement.style.display = 'none';
    this.getMeetings();
  }

  async getMeetings() {
    try {
      const data: any = await this.zoom.getMeetings();
      console.log('meetings data: ', data);
      this.meetings = data?.meetings;
    } catch (e) {
      console.log(e);
      this.getToken();
    }
  }

  async getToken() {
    await Browser.open({ url: environment.serverUrl + 'zoom-auth' });
  }

  async createMeeting() {
    try {
      const meetingData = {
        topic: 'Coding Technyks Shorts',
        type: 2, // Scheduled meeting
        startTime: new Date().toISOString(),
        duration: 10,
        timezone: 'UTC',
        settings: {
          host_video: true,
          participant_video: true,
        },
      };
      const role = 1; // 0 for attendee, 1 for host

      const data: any = await this.zoom.createMeeting(
        meetingData,
        role,
      );

      console.log('meeting data: ', data);
      this.meeting = {
        meeting_id: data?.id,
        passcode: data?.password,
      };

      this.getMeetings();
    } catch (e) {
      console.log(e);
    }
  }

  joinMeeting(meeting: any) {
    try {
      ZoomMtg.preLoadWasm();
      ZoomMtg.prepareWebSDK();

      const password = this.extractPwdFromZoomLink(meeting?.join_url);

      this.meeting = {
        meeting_id: meeting?.id,
        passcode: password,
      };

      this.genSignature('1');

    } catch(e) {
      console.log(e);
    }
  }

  extractPwdFromZoomLink(link: string): string | null {
    const url = new URL(link);
    const params = new URLSearchParams(url.search);
    return params.get('pwd');
  }

  genSignature(role: string = '0') {
    ZoomMtg.generateSDKSignature({
      meetingNumber: this.meeting.meeting_id,
      role: role, // 1 for hosting
      sdkKey: environment.zoom.client_id,
      sdkSecret: environment.zoom.client_secret,
      success: (signature: any) => {
        console.log(signature);
        this.startMeeting(signature);
      },
      error: (error: any) => {
        console.log('generateSDKSignature error', error);
      },
    });
  }

  startMeeting(signature: any) {
    // let myElement = document.getElementById('zmmtg-root')!;
    // myElement.style.display = 'block';

    ZoomMtg.init({
      leaveUrl: 'http://localhost:8100',
      patchJsMedia: true,
      success: (success: any) => {
        console.log(success);
        ZoomMtg.join({
          signature: signature,
          sdkKey: environment.zoom.client_id,
          meetingNumber: this.meeting.meeting_id,
          passWord: this.meeting.passcode,
          userName: 'Nikhil Agarwal',
          userEmail: environment.zoom.userId,
          tk: '',
          zak: '',
          success: (result: any) => {
            console.log(result);
          },
          error: (error: any) => {
            console.log(error);
          },
        });
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }


}
