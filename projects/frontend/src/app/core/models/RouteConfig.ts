import {inject, Injectable, OnDestroy} from "@angular/core";
import {BehaviorSubject, filter, Observable, Subject, Subscription} from "rxjs";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {isEqual} from "lodash";

@Injectable()
export abstract class RouteConfig<C> implements OnDestroy {

  private readonly snapshotKey: string = 'header';
  private readonly routeSubscription: Subscription | null = null;
  private configSubject: Subject<C>;
  private currentConfig: C;

  private route = inject(ActivatedRoute);
  private router = inject(Router);


  protected constructor(snapshotKey: string, defaultConfig: C) {
    this.snapshotKey = snapshotKey;
    this.configSubject = new BehaviorSubject<C>(defaultConfig);
    this.currentConfig = defaultConfig;
    this.routeSubscription = this.setUpSubscription(defaultConfig);
  }

  ngOnDestroy(): void {
    this.configSubject.unsubscribe();

    if (!this.routeSubscription) return;
    this.routeSubscription.unsubscribe();
  }

  private setUpSubscription(defaultConf: C): Subscription {
    return this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        const routeConfig = this.getCurrentRouteConfig() || defaultConf;
        if (isEqual(routeConfig, this.getConfig())) return;

        this.currentConfig = routeConfig;
        this.configSubject.next(routeConfig);
      });
  }


  private getCurrentRouteConfig(): C | null {
    let currentRoute = this.route.root;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    return currentRoute.snapshot.data[this.snapshotKey] as C;
  }

  public getConfigObserver(): Observable<C> {
    return this.configSubject.asObservable();
  }

  public getConfig(): C {
    return this.currentConfig;
  }

}
