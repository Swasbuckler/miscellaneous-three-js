import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShaderTutorialComponent } from './shader-tutorial.component';

describe('ShaderTutorialComponent', () => {
  let component: ShaderTutorialComponent;
  let fixture: ComponentFixture<ShaderTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShaderTutorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShaderTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
