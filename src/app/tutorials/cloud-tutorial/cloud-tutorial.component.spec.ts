import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudTutorialComponent } from './cloud-tutorial.component';

describe('CloudTutorialComponent', () => {
  let component: CloudTutorialComponent;
  let fixture: ComponentFixture<CloudTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloudTutorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloudTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
