import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveBackgroundComponent } from './remove-background.component';

describe('RemoveBackgroundComponent', () => {
  let component: RemoveBackgroundComponent;
  let fixture: ComponentFixture<RemoveBackgroundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoveBackgroundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
