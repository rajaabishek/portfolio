import { Component, effect, Inject, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/internal/operators/filter';

@Component({
    standalone: true,
    selector: 'app-root',
    imports: [RouterOutlet, MatSlideToggleModule, RouterLink],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    isLightTheme = signal(true);
    currentPath = '';
    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private router: Router
    ) {
        effect(() => {
            if (typeof this.isLightTheme() == 'boolean') {
                if (isPlatformBrowser(this.platformId)) {
                    document.body.className = `${this.isLightTheme() ? 'light-theme' : 'dark-theme'} section`;
                    localStorage.setItem('theme', JSON.stringify(this.isLightTheme()));
                }
            }
        })
    }
    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.isLightTheme.set(JSON.parse(localStorage.getItem('theme') || 'true'));
            localStorage.setItem('theme', JSON.stringify(this.isLightTheme()));
        }
       this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentPath = event.urlAfterRedirects.slice(1);
      });
    }
}
