import { Component, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DragAndDropComponent } from './drag-and-drop/drag-and-drop.component';
import { FaceoffService } from 'src/app/faceoff.service';
import { take } from 'rxjs/operators';
import { ConfirmDialogModel, ConfirmDialogComponent } from 'src/app/common/confirm-dialog/confirm-dialog.component';

/**
 * Data Table
 */

@Component({
  selector: 'app-filedrop',
  templateUrl: './filedrop.component.html',
  styleUrls: ['./filedrop.component.scss'],
})
export class FiledropComponent implements AfterViewInit {
  @Input() matchId: string;
  @Input() stageId: string;

  // True if an entry with this match id is already in the database.
  @Input() dataExists: boolean;

  @Input() user: any;
  @Input() participants: any;

  @Output() deleteSuccess: EventEmitter<string> = new EventEmitter<string>();
  // Without this, expansion panels will start in the opened state in it doesn't look kosher
  animationsDisabled = true;
  tournamentId: string;

  // How many matches were there? Used for validation
  matchNumber = 0;
  expanded = false;
  dataSource = [];

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private _snackBar: MatSnackBar,
    private faceoffService: FaceoffService,
    private activatedRoute: ActivatedRoute
  ) {
    this.tournamentId = this.activatedRoute.params['_value']['id'];
    if (!this.stageId) {
      this.stageId = this.activatedRoute.params['_value']['stageId'];
    }
  }

  displayedColumns: string[] = ['name', 'delete'];
  public files: NgxFileDropEntry[] = [];

  // Fires whenever files are dropped to the dropzone. Accumulate dropped files to the datasource
  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    files.forEach(droppedFile => {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          const obj = {
            name: file.name,
            file: file,
            last_modified: this.getTime(file.lastModified),
          };
          this.dataSource = [...this.dataSource, obj];
        });
      }
    });

    this.participants.forEach(participant => {
      this.matchNumber += participant.score;
    });
  }

  goToFaceoff(matchId: string): void {
    const url = `/tournaments/${this.tournamentId}/stages/${this.stageId}/faceoff/`;
    this.router.navigate([url, matchId]);
  }

  canSeeDeleteButton(): boolean {
    return this.dataExists && this.user && (this.user.role === 'ADMIN' || this.user.role === 'MAINTAINER');
  }

  confirmDelete(): void {
    const message = `Are you sure?`;

    const dialogData = new ConfirmDialogModel('Delete faceoff data', message);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      minWidth: '300px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.deleteFaceoff();
      }
    });
  }

  openDialog(): void {
    // Replay file "validation"
    const allReplays = this.dataSource.every(file => file.name.split('.').pop() === 'replay');
    if (this.dataSource.length <= this.matchNumber && allReplays) {
      const dialogRef = this.dialog.open(DragAndDropComponent, {
        width: '500px',
        height: '150px',
        data: {
          files: this.dataSource,
          matchId: this.matchId,
          stageId: this.stageId,
          participants: this.participants,
          replays: this.files,
        },
        panelClass: 'custom-dialog-container-padding',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const url = `/tournaments/${this.tournamentId}/stages/${this.stageId}/faceoff/`;
          this.router.navigate([url, this.matchId]);
        }
      });
    } else {
      const message = allReplays
        ? 'Too many files! Maximum amount allowed: ' + this.matchNumber
        : 'Not all of the files were .replay-files';
      this._snackBar.open(message, 'close', { duration: 3000 });
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  onDeleteFile(index: number): void {
    const copy = this.dataSource;
    copy.splice(index, 1);
    this.dataSource = [...copy];
  }

  deleteFaceoff(): void {
    this.faceoffService
      .deleteFaceoff(this.matchId)
      .pipe(take(1))
      .subscribe(
        () => {
          this._snackBar.open('Deleted succesfully', 'close', { duration: 3000 });
          this.deleteSuccess.emit(this.matchId);
        },
        err => {
          console.error('Could not delete faceoff,', err);
          this._snackBar.open(err.message, 'close', { duration: 3000 });
        }
      );
  }

  ngAfterViewInit(): void {
    this.animationsDisabled = false;
  }

  getTime(time: number): string {
    return moment(time).format('DD.MM.YYYY, h:mm a');
  }

  public fileOver(event) {
    console.log(event);
  }

  public fileLeave(event) {
    console.log(event);
  }
}
