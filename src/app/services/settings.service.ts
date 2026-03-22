import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class SettingsService {
    private usernameSubject = new BehaviorSubject<string>(localStorage.getItem('bgg_username') || '');
    private passwordSubject = new BehaviorSubject<string>(localStorage.getItem('bgg_password') || '');
    username$ = this.usernameSubject.asObservable();
    password$ = this.passwordSubject.asObservable();

    get username(): string {
        return this.usernameSubject.value;
    }

    get password(): string {
        return this.passwordSubject.value;
    }

    setUsername(name: string) {
        localStorage.setItem('bgg_username', name);
        this.usernameSubject.next(name);
    }

    setPassword(pwd: string) {
        localStorage.setItem('bgg_password', pwd);
        this.passwordSubject.next(pwd);
    }
}
