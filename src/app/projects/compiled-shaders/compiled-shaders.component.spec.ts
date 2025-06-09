import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompiledShadersComponent } from './compiled-shaders.component';

describe('CompiledShadersComponent', () => {
  let component: CompiledShadersComponent;
  let fixture: ComponentFixture<CompiledShadersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompiledShadersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompiledShadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
