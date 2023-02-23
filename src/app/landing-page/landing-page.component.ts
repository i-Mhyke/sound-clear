import { Component, OnInit, AfterViewInit } from '@angular/core';
import { WOW } from 'wowjs/dist/wow.min';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit, AfterViewInit {
  wow = new WOW({ live: false, mobile: false });

  panelOpenState = false;

  constructor() {}

  ngOnInit(): void {}

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  ngAfterViewInit() {
    this.wow.init();
  }
}
