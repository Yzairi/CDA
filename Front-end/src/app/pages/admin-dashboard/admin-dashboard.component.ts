import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, RawUser } from '../../services/user.service';
import { PropertyService, Property } from '../../services/property.service';
import { StatsService, StatsSummary } from '../../services/stats.service';
import { ChartsService, TimelineResponse, TimelinePoint } from '../../services/charts.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  activeTab: 'stats' | 'annonces' | 'users' = 'stats';
  users: UserRow[] = [];
  loadingUsers = false;
  userError = '';
  savingUserIds = new Set<string>();
  // properties (annonces) admin view
  properties: Property[] = [];
  loadingProperties = false;
  propertyError = '';
  savingPropIds = new Set<string>();
  private authSub?: Subscription;
  stats?: StatsSummary;
  loadingStats = false;
  statsError = '';
  timeline?: TimelineResponse;
  loadingTimeline = false;
  timelineError = '';
  usersChart?: ChartRenderable;
  propsChart?: ChartRenderable;
  publishedChart?: ChartRenderable;
  tooltip?: { x: number; y: number; value: number; date: string };

  chartWidth = 520; // enlarged charts
  chartHeight = 180;

  constructor(private userService: UserService,
              private propertyService: PropertyService,
              private statsService: StatsService,
              private charts: ChartsService,
              private auth: AuthService,
              private router: Router,
              private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
    // redirect immediately if not admin (in case of manual navigation)
    const u = this.auth.currentUserSubject.value;
    if (!u?.isAdmin) { this.router.navigate(['/']); return; }
    this.authSub = this.auth.currentUser$.subscribe(val => {
      if (!val?.isAdmin) {
        this.router.navigate(['/']);
      }
    });
  this.loadStats();
  this.loadTimeline();
    this.loadUsers();
  }

  ngOnDestroy(): void { this.authSub?.unsubscribe(); }

  setTab(tab: 'stats' | 'annonces' | 'users') {
    this.activeTab = tab;
    if (tab === 'users' && !this.users.length) this.loadUsers();
    if (tab === 'annonces' && !this.properties.length) this.loadProperties();
  }

  loadProperties() {
    this.loadingProperties = true; this.propertyError='';
    this.propertyService.getAll().subscribe({
      next: props => { this.properties = props; this.loadingProperties=false; },
      error: err => { this.propertyError = err.error || 'Erreur chargement annonces'; this.loadingProperties=false; }
    });
  }

  loadStats() {
    this.loadingStats = true; this.statsError='';
    this.statsService.getSummary().subscribe({
      next: s => { this.stats = s; this.loadingStats=false; },
      error: err => { this.statsError = err.error || 'Erreur stats'; this.loadingStats=false; }
    });
  }

  loadTimeline() {
    this.loadingTimeline = true; this.timelineError='';
    this.charts.getTimeline().subscribe({
  next: t => { this.timeline = t; this.loadingTimeline=false; this.finalizeTimeline(); },
      error: err => { this.timelineError = err.error || 'Erreur timeline'; this.loadingTimeline=false; }
    });
  }

  buildPath(points: TimelinePoint[]): string {
    if(!points || !points.length) return '';
    const width = this.chartWidth; const height = this.chartHeight; const max = Math.max(...points.map(p=>p.count));
    if(max === 0) return '';
    const pad = 30; // left axis space
    const step = points.length > 1 ? (width - pad - 10) / (points.length -1) : width/2;
    return points.map((p,i)=>{
      const x = pad + i*step;
      const y = this.yFor(p.count, max, height);
      return (i===0?`M ${x} ${y}`:` L ${x} ${y}`);
    }).join('');
  }

  private yFor(count: number, max: number, height: number) {
    const pad = 10; const innerH = height - pad*2; return height - pad - (max===0?0:(count/max)*innerH);
  }

  private prepareCharts() {
    if(!this.timeline) return;
    this.usersChart = this.toChart(this.timeline.users);
    this.propsChart = this.toChart(this.timeline.properties);
    this.publishedChart = this.toChart(this.timeline.publishedProperties);
  }

  private toChart(points: TimelinePoint[]): ChartRenderable | undefined {
    if(!points || !points.length) return undefined;
    const max = Math.max(...points.map(p=>p.count));
    const width = this.chartWidth; const height = this.chartHeight; const padLeft = 30; const padRight = 10; const padVert = 10;
    const step = points.length>1 ? (width - padLeft - padRight) / (points.length-1) : width/2;
    const pathParts: string[] = [];
    const circles: ChartPoint[] = [];
    points.forEach((p,i)=>{
      const x = padLeft + i*step;
      const y = this.yFor(p.count, max, height);
      pathParts.push(i===0?`M ${x} ${y}`:`L ${x} ${y}`);
      circles.push({ x, y, value: p.count, date: p.date });
    });
    const area = pathParts.join(' ') + ` L ${padLeft + (points.length-1)*step} ${height - padVert} L ${padLeft} ${height - padVert} Z`;
    // y-axis ticks (4 divisions)
    const ticks: AxisTick[] = [];
    for(let i=0;i<=4;i++){
      const v = Math.round((max/4)*i);
      const yTick = this.yFor(v, max, height);
      ticks.push({ value: v, y: yTick });
    }
    return { path: pathParts.join(' '), area, max, points: circles, firstDate: points[0].date, lastDate: points[points.length-1].date, yTicks: ticks };
  }

  // Hook into timeline loading completion
  ngOnChanges() { this.prepareCharts(); }

  // After timeline loaded
  private finalizeTimeline() { this.prepareCharts(); }

  statusLabel(p: Property): string {
    const map: any = { 0: 'DRAFT', 1: 'PUBLISHED', 2: 'ARCHIVED'};
    return (map[p.status] || p.status || '').toString();
  }

  async publish(p: Property) { 
    const confirmed = await this.confirmationService.confirmPublish(p.title);
    if (confirmed) {
      this.propAction(p, this.propertyService.publish.bind(this.propertyService));
    }
  }

  async archive(p: Property) { 
    const confirmed = await this.confirmationService.confirmArchive(p.title);
    if (confirmed) {
      this.propAction(p, this.propertyService.archive.bind(this.propertyService));
    }
  }

  async draft(p: Property) { 
    const confirmed = await this.confirmationService.confirmPropertyStatusChange(p.title, 'draft');
    if (confirmed) {
      this.propAction(p, this.propertyService.draft.bind(this.propertyService));
    }
  }

  async delete(p: Property) { 
    const confirmed = await this.confirmationService.confirmDelete(p.title);
    if (confirmed) {
      this.propAction(p, this.propertyService.delete.bind(this.propertyService), true);
    }
  }

  private propAction(p: Property, fn: (id: string)=>any, removeAfter=false) {
    this.savingPropIds.add(p.id);
    fn(p.id).subscribe({
      next: () => {
        if (removeAfter) {
          this.properties = this.properties.filter(x => x.id !== p.id);
        } else {
          // reload just this property? simplest reload all
          this.loadProperties();
        }
      },
      error: () => {},
      complete: () => { this.savingPropIds.delete(p.id); }
    });
  }

  loadUsers() {
    this.loadingUsers = true; this.userError='';
    let allProps: Property[] = [];
    this.propertyService.getAll().subscribe({
      next: props => { allProps = props; this.fetchUsers(allProps); },
      error: () => { this.fetchUsers([]); }
    });
  }

  private fetchUsers(allProps: Property[]) {
    this.userService.getAll().subscribe({
      next: raw => {
        this.users = raw.map(u => ({
          ...u,
          isAdmin: u.role === 'ADMIN',
          propertyCount: allProps.filter(p => p.userId === u.id).length
        }));
        this.loadingUsers = false;
      },
      error: err => { this.userError = err.error || 'Erreur chargement users'; this.loadingUsers=false; }
    });
  }

  async toggleAdmin(u: UserRow) {
    const target = !u.isAdmin;
    const newRole = target ? 'ADMIN' : 'ADVERTISER';
    const confirmed = await this.confirmationService.confirmUserRoleChange(u.email, newRole);
    
    if (!confirmed) return;

    this.savingUserIds.add(u.id);
    this.userService.updateRoleStatus(u.id, target, u.status).subscribe({
      next: () => { u.isAdmin = target; u.role = target ? 'ADMIN' : 'ADVERTISER'; this.savingUserIds.delete(u.id); },
      error: () => { this.savingUserIds.delete(u.id); }
    });
  }

  async deleteUser(u: UserRow) {
    const confirmed = await this.confirmationService.confirmUserDeletion(u.email, u.propertyCount);
    
    if (!confirmed) return;

    this.savingUserIds.add(u.id);
    this.userService.delete(u.id).subscribe({
      next: () => { this.users = this.users.filter(x => x.id !== u.id); },
      error: () => {},
      complete: () => { this.savingUserIds.delete(u.id); }
    });
  }
}

interface UserRow extends RawUser { propertyCount: number; isAdmin: boolean; }
interface ChartPoint { x: number; y: number; value: number; date: string; }
interface AxisTick { value: number; y: number; }
interface ChartRenderable { path: string; area: string; max: number; points: ChartPoint[]; firstDate: string; lastDate: string; yTicks: AxisTick[]; }
