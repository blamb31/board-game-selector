import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class SettingsService {
    private usernameSubject = new BehaviorSubject<string>(localStorage.getItem('bgg_username') || '');
    username$ = this.usernameSubject.asObservable();

    get username(): string {
        return this.usernameSubject.value;
    }

    setUsername(name: string) {
        localStorage.setItem('bgg_username', name);
        this.usernameSubject.next(name);
    }
}
