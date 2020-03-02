import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  menuItems = [
    {
      name: 'Administrators',
      icon: 'face',
    },
    {
      name: 'Navigation',
      icon: 'navigate_next',
    },
    { name: 'Tournaments', icon: 'list' },
    { name: 'Statistics', icon: 'trending_up' },
  ];

  constructor() {}

  ngOnInit() {}
}
