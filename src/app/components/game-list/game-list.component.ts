import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {BggService, BoardGame} from '../../bgg.service';
import {SettingsService} from '../../services/settings.service';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: [ './game-list.component.scss' ]
})
export class GameListComponent implements OnInit, OnDestroy {
  games: BoardGame[] = [];
  loading = false;
  error = '';
  showSuggester = false;
  hasUsername = false;
  private usernameSub?: Subscription;

  constructor(private bggService: BggService, private settingsService: SettingsService) { }

  ngOnInit(): void {
    this.usernameSub = this.settingsService.username$.subscribe(() => {
      this.checkUsernameAndLoad();
    });
  }

  ngOnDestroy(): void {
    this.usernameSub?.unsubscribe();
  }

  refreshGames(): void {
    this.loadGames(true);
  }

  private checkUsernameAndLoad(): void {
    this.hasUsername = !!this.settingsService.username;
    if (this.hasUsername) {
      this.loadGames();
    } else {
      this.games = [];
    }
  }

  private loadGames(forceRefresh = false): void {
    this.loading = true;
    this.error = '';

    this.bggService.getCollection(forceRefresh).subscribe({
      next: (data) => {
        this.games = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching collection:', err);
        this.error = 'Failed to load board games. See console for details.';
        this.loading = false;
      }
    });
  }
}
