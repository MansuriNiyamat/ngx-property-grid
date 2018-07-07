import {
    AfterContentInit, AfterViewInit, ChangeDetectorRef,
    Component,
    ContentChildren, ElementRef,
    Input,
    QueryList,
    TemplateRef, ViewChildren
} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {NgxTemplate} from 'ngx-template';
import {PropertyItemMeta} from './property-item-meta';

@Component({
    selector: 'ngx-property-grid',
    template: `
        <div class="property-grid" [ngClass]="!isInternal && !cardStyle ? 'property-grid-border': null" [style.width]="width">
            <div [ngClass]="cardStyle ? 'card' : null">
                <table class="property-grid-table" [style.width]="width">
                    <tbody>
                    <ng-container *ngFor="let group of groups">
                        <tr *ngIf="group.name">
                            <td colspan="2" class="property-grid-group" (click)="groupCollapse && group.toggle()">{{group.name}}</td>
                        </tr>

                        <ng-container *ngFor="let item of group.items">
                            <tr *ngIf="group.state">
                                <td class="property-grid-label" [attr.colspan]="item.colSpan2 == true ? 2 : 1">
                                    {{item.name}}
                                    <span *ngIf="item.description" [title]="item.description">[?]</span>
                                </td>
                                <ng-container *ngTemplateOutlet="controlTemplate; context: {$implicit: item}"></ng-container>
                            </tr>
                            <tr *ngIf="group.state && item.colSpan2">
                                <ng-container *ngTemplateOutlet="controlTemplate; context: {$implicit: item}"></ng-container>
                            </tr>
                        </ng-container>
                    </ng-container>
                    </tbody>
                </table>
            </div>

            <div *ngFor="let item of subItems" class="internal-property-grid" [ngClass]="cardStyle ? 'card' : null">
                <div (click)="pg.toggle()" class="property-grid-header"
                     [ngClass]="cardStyle ? null : 'property-grid-header-margin'">
                    <b>{{item.name}}</b>
                </div>
                <ngx-property-grid
                    [state]="item.initState"
                    [@collapseAnimation]="pg.state"
                    [options]="options[item.key]"
                    [width]="width"
                    [labelWidth]="labelWidth"
                    [templateMap]="templateMap"
                    style="display: block;overflow: hidden"
                    #pg>
                </ngx-property-grid>
            </div>
        </div>


        <ng-template #controlTemplate let-item>
            <td [attr.colspan]="item.colSpan2 == true ? 2 : 1" class="property-grid-control">
                <ng-container *ngTemplateOutlet="templateLoaded && getTemplate(item.type); context: {$implicit: propertyValue(item)}">
                </ng-container>

                <custom-component *ngIf="templateLoaded && !getTemplate(item.type)"
                                  [componentType]="item.type"
                                  [componentOptions]="item.options"
                                  [value]="options[item.key]"
                                  (valueChange)="convertValue(item, $event)">
                </custom-component>
            </td>
        </ng-template>


        <ng-container *ngIf="!isInternal">

            <ng-template ngxTemplate="checkbox" let-p>
                <input type="checkbox" [checked]="p.value" (change)="p.value = $event.target.checked"/>
            </ng-template>

            <ng-template ngxTemplate="color" let-p>
                <input type="color" [value]="p.value" (change)="p.value = $event.target.value"/>
            </ng-template>

            <ng-template ngxTemplate="date" let-p>
                <input type="date" [value]="p.value" (change)="p.value = $event.target.value"/>
            </ng-template>

            <ng-template ngxTemplate="label" let-p>
                <label>{{p.value}}</label>
            </ng-template>

            <ng-template ngxTemplate="text" let-p>
                <input type="text" [value]="p.value" (change)="p.value = $event.target.value"/>
            </ng-template>

            <ng-template ngxTemplate="options" let-p>
                <select (change)="p.value = $event.target.value">
                    <option [value]="optionValue(option)" *ngFor="let option of p.meta.options">
                        {{optionLabel(option)}}
                    </option>
                </select>
            </ng-template>
        </ng-container>
    `,
    styles: [
            `
            .property-grid {
                /*border: solid 1px #95B8E7;*/
            }

            .property-grid-border {
                border: 1px solid #d6d6d678
            }

            .property-grid-table {
                border-spacing: 0;
                padding: 5px
            }

            .property-grid-group {
                background-color: white;
                font-weight: bold;
                color: #616161;
                padding-top: 8px;
                padding-bottom: 5px;
            }

            .property-grid-label, .property-grid-control {
                border: dotted 1px #ccc;
                padding: 2px 5px;
            }

            .internal-property-grid {
                margin-top: 12px;
            }

            .internal-property-grid .property-grid {
                border-width: 0;
            }

            .internal-property-grid .property-grid-header {
                margin-bottom: 5px;
                background-color: #f5f5f5;
                padding-bottom: 5px;
                padding-top: 5px;
                padding-left: 5px;
                box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
                -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
                width: 100%;
            }

            .internal-property-grid .property-grid-header-margin {
                margin-left: 5px;
                margin-right: 5px;
                width: unset;
            }

            .internal-property-grid .property-grid-table {
                border-width: 0;
                /*border-top: 1px solid #dbdbdb;*/
            }

            .card {
                background-color: #fff;
                box-shadow: 0 6px 10px 0 rgba(0, 0, 0, .14), 0 1px 18px 0 rgba(0, 0, 0, .12), 0 3px 5px -1px rgba(0, 0, 0, .2);
                display: flex;
                flex-flow: row wrap;
                /*margin: 5px 20px;*/
                padding: 0;
            }

            .internal-property-grid ngx-property-grid .card {
                background-color: unset;
                box-shadow: unset;
                display: unset;
                flex-flow: unset;
                /*margin: 5px 20px;*/
                padding: unset;
            }
        `
    ],
    animations: [
        trigger('collapseAnimation', [
            state('hidden', style({
                height: '0',
                // overflow: 'hidden',
            })),
            state('visible', style({
                height: '*'
            })),
            transition('visible <=> hidden', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
        ]),
        trigger('flyInOut', [
            state('in', style({transform: 'translateX(0)'})),
            transition('void => *', [
                style({transform: 'translateX(-100%)'}),
                animate(100)
            ]),
            transition('* => void', [
                animate(100, style({transform: 'translateX(100%)'}))
            ])
        ])
    ]
})
export class PropertyGridComponent implements AfterContentInit, AfterViewInit {
    private _options: any;
    private _meta: any;
    private _templateLoaded = false;
    public get templateLoaded(): boolean {
        return this._templateLoaded;
    }

    public readonly isInternal: boolean = false;

    @Input()
    public templateMap: { [key: string]: TemplateRef<any> };

    @Input()
    public state: 'hidden' | 'visible' = 'visible';

    @Input()
    width: string | number;


    @Input()
    labelWidth: string | number = '120px';

    @Input()
    cardStyle = true;

    @Input()
    groupCollapse = false;

    @Input()
    public set meta(v: any) {
        this._meta = v;
        this.initMeta();
    }

    public get meta(): any {
        return this._meta;
    }

    @Input()
    public set options(v: any) {
        this._options = v;
        if (v.__meta__) {
            this.meta = v.__meta__;
        }
    }

    public get options(): any {
        return this._options;
    }

    @ViewChildren(NgxTemplate) defaultTemplates: QueryList<NgxTemplate>;
    @ContentChildren(NgxTemplate) templates: QueryList<NgxTemplate>;

    public rows: Array<InternalGroup | PropertyItemMeta | any>;
    public groups: InternalGroup[];
    public subItems: PropertyItemMeta[];

    constructor(el: ElementRef<HTMLElement>, private cdr: ChangeDetectorRef) {
        this.isInternal = el.nativeElement.parentElement && el.nativeElement.parentElement.classList &&
            el.nativeElement.parentElement.classList.contains('internal-property-grid');
    }

    ngAfterViewInit(): void {
        if (this.isInternal) {
            this._templateLoaded = true;
        } else {
            if (this.defaultTemplates) {
                this.defaultTemplates.forEach((item) => {
                    if (!this.templateMap.hasOwnProperty(item.name)) {
                        this.templateMap[item.name] = item.template;
                    }
                });
                this._templateLoaded = true;
                this.cdr.detectChanges();
            }
        }
    }

    ngAfterContentInit(): void {
        if (!this.isInternal) {
            if (!this.templateMap) {
                this.templateMap = {};
            }
            this.templates.forEach((item) => {
                this.templateMap[item.name] = item.template;
            });
        }
    }

    public getTemplate(type: string | any): TemplateRef<any> {
        if (typeof type === 'string' && this.templateMap) {
            return type ? this.templateMap[type] : this.templateMap['default'];
        } else {
            return undefined;
        }
    }

    public propertyValue(meta: PropertyItemMeta): PropertyValue {
        return new PropertyValue(this.options, meta);
    }

    public toggle(): void {
        this.state = this.state === 'visible' ? 'hidden' : 'visible';
    }

    public convertValue(meta: PropertyItemMeta, val: any): void {
        this.options[meta.key] = meta.valueConvert ? meta.valueConvert(val) : val;
    }

    private initMeta(): void {
        const meta: object = this.meta;
        if (!meta) {
            this.rows = [];
            this.subItems = [];
            return;
        }

        const groups: InternalGroup[] = [new InternalGroup(undefined)];
        const subItems: PropertyItemMeta[] = [];
        for (const i in meta) {
            if (!meta.hasOwnProperty(i)) {
                continue;
            }
            const v: PropertyItemMeta = meta[i];
            if (v.hidden) {
                continue;
            }
            if (v.type === 'subItems') {
                subItems.push(v);
                continue;
            }

            let group = groups.find(o => o.name === v.group);
            if (!group) {
                group = new InternalGroup(v.group);
                groups.push(group);
            }
            group.items.push(v);
        }
        groups.forEach(o => o.items.sort((a, b) => a.order - b.order));
        const rows: Array<InternalGroup | PropertyItemMeta> = [];
        for (const g of groups) {
            if (g.name) {
                rows.push(g);
            }
            g.items.forEach(o => rows.push(o));
        }
        this.rows = rows;
        this.groups = groups;
        this.subItems = subItems;
    }

    optionLabel(v: any): string {
        if (typeof v === 'string') {
            return v;
        }
        if (v.text) {
            return v.text;
        }
        if (v.label) {
            return v.label;
        }
        return v;
    }

    optionValue(v: any): any {
        return v && v.value ? v.value : v;
    }
}

export class PropertyValue {
    public get value(): any {
        return this.o[this.meta.key];
    }

    public set value(val: any) {
        this.o[this.meta.key] = this.meta.valueConvert ? this.meta.valueConvert(val) : val;
    }

    constructor(private o: any, public meta: PropertyItemMeta) {
    }
}

export class InternalGroup {
    public readonly items: PropertyItemMeta[] = [];
    public type = 'group';

    public state = true;

    public toggle(): void {
        this.state = !this.state;
    }

    constructor(public name: string) {
    }
}
