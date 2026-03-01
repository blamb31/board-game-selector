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

  constructor(private settingsService: SettingsService) { }

  ngOnInit(): void {
    this.username = this.settingsService.username;
  }

  saveSettings() {
    this.settingsService.setUsername(this.username);
    this.close.emit();
  }

  closeModal() {
    this.close.emit();
  }
}
