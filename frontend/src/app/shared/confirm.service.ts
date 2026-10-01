import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, map, Observable } from 'rxjs';

import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmService {

  private readonly dialog = inject(MatDialog);

  //emits once, only when the user confirms
  confirm(data: ConfirmDialogData): Observable<void> {
    return this.dialog.open(ConfirmDialogComponent, { data, width: '440px' })
      .afterClosed()
      .pipe(
        filter(confirmed => confirmed === true),
        map(() => undefined)
      );
  }
}
