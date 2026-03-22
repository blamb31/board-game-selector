import {Component, Input} from '@angular/core';
import {BoardGame, BggService} from '../../bgg.service';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: [ './game-card.component.scss' ]
})
export class GameCardComponent {
    @Input() game!: BoardGame;
    
    isLogging = false;
    logMessage = '';
    logError = '';

    constructor(private bggService: BggService) {}

    logPlayToday() {
        this.isLogging = true;
        this.logMessage = '';
        this.logError = '';

        const today = new Date();
        const yy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yy}-${mm}-${dd}`;

        this.bggService.logPlay(this.game.id, dateStr).subscribe({
            next: () => {
                this.isLogging = false;
                this.logMessage = 'Play logged!';
                
                // Optimistically increment plays
                if (this.game.totalPlays !== undefined) {
                    this.game.totalPlays += 1;
                }
                setTimeout(() => this.logMessage = '', 3000);
            },
            error: (err) => {
                this.isLogging = false;
                console.error(err);
                this.logError = err.message || 'Failed to log play. Check your credentials.';
                setTimeout(() => this.logError = '', 5000);
            }
        });
    }
}
