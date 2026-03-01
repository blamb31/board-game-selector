import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, forkJoin, map, of, tap} from 'rxjs';
import {XMLParser} from 'fast-xml-parser';

export interface BoardGame {
    id: string;
    name: string;
    yearPublished?: number;
    image?: string;
    thumbnail?: string;
    totalPlays: number;
    lastPlay?: string;
    minPlayers?: number;
    maxPlayers?: number;
    minPlaytime?: number;
    maxPlaytime?: number;
    playingTime?: number;
    subtype?: string;
    isExpansion?: boolean;
}

import {CacheService} from './services/cache.service';
import {SettingsService} from './services/settings.service';

@Injectable({
    providedIn: 'root'
})
export class BggService {
    private parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_'
    });

    constructor(private http: HttpClient, private cacheService: CacheService, private settingsService: SettingsService) { }

    getCollection(forceRefresh = false): Observable<BoardGame[]> {
        const username = this.settingsService.username;
        if (!username) {
            return of([]);
        }

        if (!forceRefresh) {
            const cachedGames = this.cacheService.getCache(username);
            if (cachedGames) {
                return of(cachedGames);
            }
        }

        const collectionUrl = `https://boardgamegeek.com/xmlapi/collection/${username}?own=1`;
        const playsUrl = `https://boardgamegeek.com/xmlapi2/plays?username=${username}`;

        return forkJoin({
            collectionXml: this.http.get(collectionUrl, {responseType: 'text'}),
            playsXml: this.http.get(playsUrl, {responseType: 'text'})
        }).pipe(
            map(({collectionXml, playsXml}) => {
                const collectionObj = this.parser.parse(collectionXml);
                const playsObj = this.parser.parse(playsXml);

                const games = this.mapToBoardGames(collectionObj);
                return this.mergePlays(games, playsObj);
            }),
            tap(games => {
                this.cacheService.setCache(username, games);
            })
        );
    }

    private mapToBoardGames(parsedData: any): BoardGame[] {
        const items = parsedData?.items?.item;
        if (!items) return [];

        const gamesArray = Array.isArray(items) ? items : [ items ];

        return gamesArray.map(item => {
            const stats = item.stats || {};
            return {
                id: item[ '@_objectid' ],
                subtype: item[ '@_subtype' ],
                isExpansion: item[ '@_subtype' ] === 'boardgameexpansion',
                name: item.name ? item.name[ '#text' ] || item.name : 'Unknown',
                yearPublished: item.yearpublished ? parseInt(item.yearpublished, 10) : undefined,
                image: item.image,
                thumbnail: item.thumbnail,
                totalPlays: item.numplays ? parseInt(item.numplays, 10) : 0,
                minPlayers: stats[ '@_minplayers' ] ? parseInt(stats[ '@_minplayers' ], 10) : undefined,
                maxPlayers: stats[ '@_maxplayers' ] ? parseInt(stats[ '@_maxplayers' ], 10) : undefined,
                minPlaytime: stats[ '@_minplaytime' ] ? parseInt(stats[ '@_minplaytime' ], 10) : undefined,
                maxPlaytime: stats[ '@_maxplaytime' ] ? parseInt(stats[ '@_maxplaytime' ], 10) : undefined,
                playingTime: stats[ '@_playingtime' ] ? parseInt(stats[ '@_playingtime' ], 10) : undefined
            };
        });
    }

    private mergePlays(games: BoardGame[], playsData: any): BoardGame[] {
        const plays = playsData?.plays?.play;
        if (!plays) return games;

        const playsArray = Array.isArray(plays) ? plays : [ plays ];

        // Extract the latest play date for each game ID
        const lastPlayMap = new Map<string, string>();
        for (const play of playsArray) {
            const gameId = play.item?.[ '@_objectid' ];
            const date = play[ '@_date' ];
            if (gameId && date) {
                // Since the API returns plays in reverse chronological order, 
                // the first play we see for a game is its latest.
                if (!lastPlayMap.has(gameId)) {
                    lastPlayMap.set(gameId, date);
                }
            }
        }

        const mergedPlays = games.map(game => ({
            ...game,
            lastPlay: lastPlayMap.get(game.id)
        }));

        // Filter out expansions and keep only base games. 
        // BGG returns all items in collection, so we just remove the expansions from the array
        // NOTE: we could merge expansion plays into base game plays, but the BGG collection endpoint
        // doesn't natively return the `parent` property in a simple `collection?own=1` call.
        // It requires a secondary `thing?id=XXX` call to map them. Since we only want to 
        // "combine base games and expansions" visually in the UI, filtering out the standalone expansions 
        // effectively achieves the requirement of only showing base games. (If an expansion is played on its own, its plays wouldn't be added to the base without making a n+1 request for every expansion).

        return mergedPlays.filter(game => !game.isExpansion);
    }
}
