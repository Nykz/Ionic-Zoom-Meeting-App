import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ZoomService {
  private http = inject(HttpClient);

  constructor() {}

  async getMeetings() {
    try {
      const result = await lastValueFrom(
        this.http.get(environment.serverUrl + 'meetings')
      );
      return result;
    } catch (e) {
      throw e;
    }
  }

  async createMeeting(meetingData: any, role: number) {
    try {
      const result = await lastValueFrom(
        this.http.post(environment.serverUrl + 'create-meeting', {
          ...meetingData,
          role,
          userId: environment.zoom.userId,
        })
      );
      return result;
    } catch (e) {
      throw e;
    }
  }
}
