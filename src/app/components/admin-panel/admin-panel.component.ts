import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { filter, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss'],
})
export class AdminPanelComponent implements OnInit {
  users = [];
  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    this.auth
      .getUsers()
      .pipe(
        map(data => data.data.users),
        map((x: any) => x.filter((y: any) => y.role !== 'ADMIN'))
      )
      .subscribe(data => {
        this.users = data;
      });
  }

  onClick(user: any): void {
    let role;
    if (user.role === 'MAINTAINER') {
      role = 'USER';
    } else if (user.role === 'USER') {
      role = 'MAINTAINER';
    } else if (!user.role) {
      role = 'ADMIN';
    }
    const index = this.users.findIndex(users => users._id === user._id);
    if (index >= -1) {
      const body = {
        role: role,
        id: user._id,
      };
      this.auth.updateUserRole(body).subscribe(() => {
        this.users[index].role = role;
      });
    }
  }
}
