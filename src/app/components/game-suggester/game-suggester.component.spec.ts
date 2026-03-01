import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSuggesterComponent } from './game-suggester.component';

describe('GameSuggesterComponent', () => {
  let component: GameSuggesterComponent;
  let fixture: ComponentFixture<GameSuggesterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameSuggesterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameSuggesterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
