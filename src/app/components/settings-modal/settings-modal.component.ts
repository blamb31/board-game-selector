import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import {SettingsService} from '../../services/settings.service';

@Component({
  selector: 'app-settings-modal',
  templateUrl: './settings-modal.component.html',
  styleUrls: [ './settings-modal.component.scss' ]
})
export class SettingsModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  username: string = '';
  password: string = '';

  constructor(private settingsService: SettingsService) { }

  ngOnInit(): void {
    this.username = this.settingsService.username;
    this.password = this.settingsService.password;
  }

  saveSettings() {
    this.settingsService.setUsername(this.username);
    this.settingsService.setPassword(this.password);
    this.close.emit();
  }

  closeModal() {
    this.close.emit();
  }
}
