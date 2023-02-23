import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapBackgroundComponent } from './swap-background.component';

describe('SwapBackgroundComponent', () => {
  let component: SwapBackgroundComponent;
  let fixture: ComponentFixture<SwapBackgroundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwapBackgroundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwapBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
