import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Bounds } from '../utilities/Bounds';
import { WindowInformationHolder } from '../utilities/WindowInformationHolder';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss'],
})
export class WindowComponent implements OnInit {
  @Input() public color: string;
  @Input() public windowInfo: WindowInformationHolder;

  @ViewChild('window') window!: ElementRef<HTMLInputElement>;
  @ViewChild('faviconContainer')
  faviconContainer!: ElementRef<HTMLInputElement>;

  public favicon: string;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.window.nativeElement.style.width =
      this.windowInfo.bounds.width.toString() + 'px';
    this.window.nativeElement.style.height =
      this.windowInfo.bounds.height.toString() + 'px';
    this.SetFaviconContainerPosition();
  }

  SetFaviconContainerPosition() {
    //20 is (width or height)/2 of favicon
    //32 dunno
    let left = this.windowInfo.bounds.width / 2 - 20;
    let top = this.windowInfo.bounds.height / 2 - 20 - 32;
    this.faviconContainer.nativeElement.style.top = top.toString() + 'px';
    this.faviconContainer.nativeElement.style.left = left.toString() + 'px';
  }
}
