import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrassTutorialComponent } from './grass-tutorial.component';

describe('GrassTutorialComponent', () => {
  let component: GrassTutorialComponent;
  let fixture: ComponentFixture<GrassTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrassTutorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrassTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
