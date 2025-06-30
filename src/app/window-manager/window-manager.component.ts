import {
  Component,
  OnInit,
  AfterViewInit,
  QueryList,
  ViewChildren,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { ControllerSocket } from '../socket';
import { WindowComponent } from './window/window.component';
import { Bounds } from './utilities/Bounds';
import { WindowInformationHolder } from './utilities/WindowInformationHolder';

@Component({
  selector: 'app-window-manager',
  templateUrl: './window-manager.component.html',
  styleUrls: ['./window-manager.component.scss'],
})
export class WindowManagerComponent implements OnInit {
  public windows: Array<WindowInformationHolder>;
  public colors: Array<string>;
  public selectedID: string;
  public selectPageOpen: boolean;
  public shortcuts: Array<any>;
  private translateVertical: number;
  private translateHorizontal: number;
  private mode = Mode.ManageWindows;
  private unfinishedNewWindow: WindowInformationHolder;

  @ViewChild('allContainer') allContainer!: ElementRef<HTMLInputElement>;
  @ViewChildren('windowsElementRefContainer')
  windowsElementRefContainer: QueryList<ElementRef<HTMLInputElement>>;

  constructor(private cd: ChangeDetectorRef) {
    this.colors = [
      'light-green',
      'red',
      'turquoise',
      'pink',
      'light-blue',
      'orange',
      'black',
      'yellow',
    ];

    this.windows = [];
  }

  ngAfterViewInit() { }

  ngOnInit(): void {
    ControllerSocket.socket.on('Server_SendShortcuts', (shortcutsJSON: any) => {
      this.shortcuts = shortcutsJSON.shortcuts;
      this.shortcuts.forEach((shortcut) => {
        let text = new URL(shortcut.path);
        shortcut.text = text.hostname;
        shortcut.text = shortcut.text.replace('www.', '');
        shortcut.text = shortcut.text.substring(
          0,
          shortcut.text.lastIndexOf('.')
        );
      });
    });

    ControllerSocket.socket.on('Server_SendZorderedWindows', (zorderedWindows: any[]) => {
      const containerRect = this.allContainer.nativeElement.getBoundingClientRect();
      this.translateHorizontal = containerRect.width / 3840;
      this.translateVertical = containerRect.height / 1200;

      this.windows = zorderedWindows.map((win) => {
        win.bounds.x *= this.translateHorizontal;
        win.bounds.width *= this.translateHorizontal;
        win.bounds.y *= this.translateVertical;
        win.bounds.height *= this.translateVertical;

        return new WindowInformationHolder(
          new Bounds(win.bounds.x, win.bounds.y, win.bounds.width, win.bounds.height),
          win.url,
          win.id
        );
      });

      this.cd.detectChanges();
      this.PositionWindowsOnInit();
    });

    ControllerSocket.socket.on('Server_SendNewChildId', (id) => {
      this.unfinishedNewWindow.id = id;
      this.unfinishedNewWindow.bounds.x = Math.floor(Math.floor(this.unfinishedNewWindow.bounds.x) * this.translateHorizontal);
      this.unfinishedNewWindow.bounds.width *= this.translateHorizontal;
      this.unfinishedNewWindow.bounds.y *= this.translateVertical;
      this.unfinishedNewWindow.bounds.height *= this.translateVertical;
      this.windows.push(this.unfinishedNewWindow);
      this.cd.detectChanges();

      let winHTML = this.windowsElementRefContainer.last;
      winHTML.nativeElement.style.zIndex = (
        this.windows.length * 10
      ).toString();
      winHTML.nativeElement.style.position = 'absolute';
      winHTML.nativeElement.style.top =
        this.unfinishedNewWindow.bounds.y.toString() + 'px';
      winHTML.nativeElement.style.left =
        this.unfinishedNewWindow.bounds.x.toString() + 'px';

      this.cd.detectChanges();

      console.log(this.unfinishedNewWindow)
    });

    this.GetWindowsZorderedInBoard();
    this.GetShortcuts();
  }


  PositionWindowsOnInit() {
    let i = 0;
    this.windowsElementRefContainer.forEach(
      (win: ElementRef<HTMLInputElement>) => {
        win.nativeElement.style.zIndex = (i * 10).toString();
        win.nativeElement.style.position = 'absolute';
        win.nativeElement.style.top =
          this.windows[i].bounds.y.toString() + 'px';
        win.nativeElement.style.left =
          this.windows[i].bounds.x.toString() + 'px';
        i++;
      }
    );
  }

  SelectWindow(elem: HTMLDivElement, window: WindowInformationHolder) {
    //Unselect
    if (this.selectedID == elem.id) {
      this.UnselectAll();
    }
    //Select
    else {
      this.selectPageOpen = false;
      this.selectedID = elem.id;
      this.windowsElementRefContainer.forEach(
        (win: ElementRef<HTMLInputElement>) => {
          if (elem.id != win.nativeElement.id)
            win.nativeElement.classList.add('disabled');
          else win.nativeElement.classList.remove('disabled');
        }
      );
    }
    this.cd.detectChanges();
  }

  UnselectAll() {
    this.selectedID = '';
    this.selectPageOpen = false;
    this.windowsElementRefContainer.forEach(
      (win: ElementRef<HTMLInputElement>) => {
        win.nativeElement.classList.remove('disabled');
      }
    );
    this.cd.detectChanges();
  }

  SelectOpenPage() {
    this.selectPageOpen = true;
    this.cd.detectChanges();
  }

  BoundsConstructor(x: number, y: number, w: number, h: number) {
    return new Bounds(x, y, w, h);
  }

  // COMMUNICATION WITH ELECTRON APP
  SendCreateWindowEvent() {
    ControllerSocket.socket.emit('Controller_OpenNewWindow', { x: 450, y: 350 });

    this.unfinishedNewWindow = new WindowInformationHolder(
      new Bounds(450, 350, 600, 400),
      'https://google.com/',
      -1
    );
  }

  SendCloseWindowEvent() {
    let id = this.windows[Number(this.selectedID)].id;
    this.windowsElementRefContainer.get(
      Number(this.selectedID)
    )!.nativeElement.style.display = 'none';
    this.UnselectAll();
    ControllerSocket.socket.emit('Controller_CloseWindow', id);
  }

  SendMoveWindowEvent(windowMovedHTMLId: number) {
    let x = this.windowsElementRefContainer
      .get(windowMovedHTMLId)
      ?.nativeElement.getBoundingClientRect().x;

    x = Math.floor(Number(x) / this.translateHorizontal);

    let y = this.windowsElementRefContainer
      .get(windowMovedHTMLId)
      ?.nativeElement.getBoundingClientRect().y;

    y = Math.floor(Number(y) / this.translateVertical);

    let id = this.windows[windowMovedHTMLId].id;
    let toSend = {
      id: id,
      position: { x: x, y: y },
    };
    ControllerSocket.socket.emit('Controller_MoveWindow', toSend);
    console.log('Controller_MoveWindow', toSend)
  }

  SendChangeWindowPageEvent(url: string) {
    let id = this.windows[Number(this.selectedID)].id;
    this.windows[Number(this.selectedID)].url = url;
    this.windows[Number(this.selectedID)].favicon =
      'https://www.google.com/s2/favicons?sz=64&domain_url=' + url;
    ControllerSocket.socket.emit('Controller_ChangeWindowPage', id, url);
    this.cd.detectChanges();
  }

  GetShortcuts() {
    console.log('Get Shortcuts');
    ControllerSocket.socket.emit('Controller_GetShortcuts', 'Get Shortcuts');
  }

  GetWindowsZorderedInBoard() {
    console.log('Get Windows Zordered');
    ControllerSocket.socket.emit(
      'Controller_GetZorderedWindows',
      'Get Windows'
    );
  }
}

enum Mode {
  ManageWindows,
  TakeScreenshot,
}
