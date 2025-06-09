import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShaderRaycastComponent } from './shader-raycast.component';

describe('ShaderRaycastComponent', () => {
  let component: ShaderRaycastComponent;
  let fixture: ComponentFixture<ShaderRaycastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShaderRaycastComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShaderRaycastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
