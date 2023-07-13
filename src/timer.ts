import * as vscode from 'vscode';
import {
  // createWebviewPanel,
  HealthyPanel } from './webview';

interface TimerProps {
  time?: number;
  imgUrl?: string;
}

export default class Timer {
  constructor(props: TimerProps) {
    if (props.time) {
      this.time = props.time * 60;
    }
    if(props.imgUrl) {
      this.imgUrl = props.imgUrl;
    }
  }

  private timer: any = null;
  private time: number = 30 * 60; // 半个小时
  private imgUrl: string | undefined = undefined;

  public start(extensionUri: vscode.Uri) {
      this.timer = setInterval(() => {
        this.time--;
        if (this.time === 0) {
          clearInterval(this.timer);
          console.log('create : ', this.imgUrl);
          HealthyPanel.createOrShow(extensionUri, this.imgUrl);
        }
      } , 1000);
  }
}