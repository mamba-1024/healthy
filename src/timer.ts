import * as vscode from 'vscode';
import {
  // createWebviewPanel,
  HealthyPanel } from './webview';

interface TimerProps {
  time?: number;
}

export default class Timer {
  constructor(props: TimerProps) {
    if (props.time) {
      this.time = props.time * 60;
    }
  }

  private timer: any = null;
  private time: number = 30 * 60; // 半个小时

  public start(extensionUri: vscode.Uri) {
      this.timer = setInterval(() => {
        this.time--;
        if (this.time === 0) {
          clearInterval(this.timer);
          HealthyPanel.createOrShow(extensionUri);
        }
      } , 1000);
  }
}