import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoSoundSwapComponent } from './video-sound-swap.component';

describe('VideoSoundSwapComponent', () => {
  let component: VideoSoundSwapComponent;
  let fixture: ComponentFixture<VideoSoundSwapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoSoundSwapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoSoundSwapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
