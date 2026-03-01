import {Component, Input} from '@angular/core';
import {BoardGame} from '../../bgg.service';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: [ './game-card.component.scss' ]
})
export class GameCardComponent {
    @Input() game!: BoardGame;
}
