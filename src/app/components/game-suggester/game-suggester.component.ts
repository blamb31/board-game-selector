import {Component, Input, Output, EventEmitter} from '@angular/core';
import {BoardGame} from '../../bgg.service';

@Component({
  selector: 'app-game-suggester',
  templateUrl: './game-suggester.component.html',
  styleUrls: [ './game-suggester.component.scss' ]
})
export class GameSuggesterComponent {
  @Input() games: BoardGame[] = [];
  @Output() close = new EventEmitter<void>();

  players = 4;
  timeRange = 'all'; // 'all', '30', '60', '999'
  frequency = 'all';

  suggestedGames: BoardGame[] = [];
  hasSuggested = false;

  suggestGames() {
    this.hasSuggested = true;
    let filtered = this.games.filter(g => {
      const minP = g.minPlayers || 1;
      const maxP = g.maxPlayers || 99;
      if (this.players < minP || this.players > maxP) return false;

      const gameTime = g.playingTime || 0;

      if (this.timeRange !== 'all') {
        if (this.timeRange === '30' && gameTime >= 30) return false;
        if (this.timeRange === '60' && (gameTime < 30 || gameTime > 60)) return false;
        if (this.timeRange === '999' && gameTime <= 60) return false;
      }

      return true;
    });

    filtered.sort((a, b) => b.totalPlays - a.totalPlays);

    const halfLength = Math.ceil(filtered.length / 2);

    const topHalf = filtered.slice(0, halfLength);
    const bottomHalf = filtered.slice(halfLength);

    let targetPool: BoardGame[] = [];

    if (this.frequency === 'all') {
      targetPool = [ ...filtered ];
    } else if (this.frequency === 'frequent') {
      // Top half, requiring at least one play
      targetPool = topHalf.filter(g => g.totalPlays > 0);
    } else {
      // Bottom half PLUS any from the top half that have 0 plays
      const zeroesInTop = topHalf.filter(g => g.totalPlays === 0);
      targetPool = [ ...bottomHalf, ...zeroesInTop ];
    }

    // Shuffle the target pool
    for (let i = targetPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ targetPool[ i ], targetPool[ j ] ] = [ targetPool[ j ], targetPool[ i ] ];
    }

    this.suggestedGames = targetPool.slice(0, 5);

    setTimeout(() => {
      const container = document.getElementById('suggestions-container');
      if (container) {
        container.scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    }, 0);
  }

  closeModal() {
    this.close.emit();
  }
}
