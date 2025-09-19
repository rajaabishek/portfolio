import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
    { path: "", redirectTo: "home",pathMatch:"full" },
    { path: "home", title: "Home",  loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
    { path: "skills", title: "Skills",  loadComponent: () => import('./components/skills/skills.component').then(m => m.SkillsComponent) }
];
