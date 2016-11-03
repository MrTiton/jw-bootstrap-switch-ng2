import {
    Component,
    ElementRef,
    Input,
    OnInit,
    HostListener,
    AfterViewInit,
    forwardRef,
    SimpleChanges,
    NgZone
} from '@angular/core';
import { ControlValueAccessor , NG_VALUE_ACCESSOR } from "@angular/forms";

const noop = () => {
};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => JWBootstrapSwitchDirective),
    multi: true
};

@Component({
    selector: 'bSwitch',
    outputs: ['value'],
    template: `<div class="{{ getWrapperClasses() }}" [style.width]=" (handleWidth  + (labelWidth + 9) ) +'px'"  >
                    <div class="{{ baseClass }}-container "
                        [style.width]=" ((handleWidth * 2) + labelWidth + 9) +'px'"
                        [style.margin-left]="getLabelMarginLeft()">
                        <span class="{{ (inverse) ? getOffClasses() : getOnClasses() }}" >{{ (inverse) ? offText : onText }}</span>
                        <span class="{{ baseClass }}-label">&nbsp;{{ labelText }}</span>
                        <span class="{{ (inverse) ? getOnClasses() : getOffClasses() }}" >{{ (inverse) ? onText : offText }}</span>
                        <input type="checkbox" [(ngModel)]="value" [disabled]="disabled" (focus)="onFocus()" (blur)="onBlur()" >
                    </div>
                </div>`,
    providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})

export class JWBootstrapSwitchDirective implements OnInit, AfterViewInit, ControlValueAccessor {

    private innerState: boolean = true;
    private focused: boolean = false;
    private size: any = 'normal';
    private animate: boolean = true;
    private innerAnimate: boolean = true;
    private disabled: boolean = false;
    private readonly: boolean = false;
    private indeterminate: boolean = false;
    private inverse: boolean = false;
    private onColor: string = "primary";
    private offColor: string = "default";
    private onText: string = "ON";
    private offText: string = "OFF";
    private labelText: string = "";
    private handleWidth: string|number = "auto";
    private innerHandleWidth: string|number = "auto";
    private labelWidth: string|number = "auto";
    private baseClass: string = "bootstrap-switch";
    private wrapperClass: string = "wrapper";

    private outerWidth: number = 0;
    private dragStart: number = null;
    private dragEnd: any = null;

    public getWrapperClasses() {
        let output: string = this.baseClass + " " + this.baseClass + "-" + this.wrapperClass;

        if (this.focused) {
            output += " " + this.baseClass + "-focused";
        }
        if (this.readonly) {
            output += " " + this.baseClass + "-readonly";
        }

        if (this.size != null) {
            output += " " + this.baseClass + "-" + this.size;
        }

        if (this.innerState) {
            output += " " + this.baseClass + "-on";
        } else {
            output += " " + this.baseClass + "-off";
        }

        if (this.animate) {
            output += " " + this.baseClass + "-animate";
        }

        if (this.disabled) {
            output += " " + this.baseClass + "-disabled";
        }

        if (this.indeterminate) {
            output += " " + this.baseClass + "-indeterminate";
        }

        if (this.inverse) {
            output += " " + this.baseClass + "-inverse";
        }

        return output
    }

    public getOnClasses(): string {
        let output: string = this.baseClass + "-handle-on";

        if (this.onColor) {
            output += " " + this.baseClass + "-" + this.onColor;
        }

        return output
    }

    public getOffClasses(): string {
        let output: string = this.baseClass + "-handle-off";

        if (this.offColor) {
            output += " " + this.baseClass + "-" + this.offColor;
        }

        return output
    }

    public getLabelMarginLeft(): string {
        let width = (this.inverse) ? -this.handleWidth : 0;
        if (this.dragEnd) {
            width = this.dragEnd;
        } else if (!this.innerState) {
            if (!this.inverse) {
                width = -this.handleWidth;
            } else {
                width = 0;
            }
        }
        return width + "px";
    }

    constructor(private el: ElementRef, private ngZone: NgZone) {
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.checkChanges(changes['setLabelText']) ||
            this.checkChanges(changes['setOnText']) ||
            this.checkChanges(changes['setHandleWidth']) ||
            this.checkChanges(changes['setLabelWidth']) ||
            this.checkChanges(changes['setOffText']) ||
            this.checkChanges(changes['setSize'])) {
            this.calculateWith();
        }
    }

    checkChanges(object: any): boolean {
        return object && object.previousValue !== object.currentValue;
    }

    ngAfterViewInit() {
        this.calculateWith();
    }

    @HostListener('click') onClick(ev) {
        if (!this.disabled && !this.readonly && !this.dragEnd) {
            this.setStateValue(!this.innerState);
        } else if (this.dragEnd) {
            this.dragEnd = null;
        }
    }

    private onDragStart(e): void {
        if (e.target === this.$label()) {
            if (this.dragStart || this.disabled || this.readonly) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            this.dragStart = (e.pageX || e.touches[0].pageX) - parseInt(this.$container().style.marginLeft, 10);
            if (this.animate) {
                this.animate = !this.animate;
            }
        }
    }

    private onDragMove(e): void {
        if (this.dragStart) {
            e.preventDefault();
            let difference = (e.pageX || e.touches[0].pageX) - this.dragStart;
            if (difference < -Number(this.handleWidth) || difference > 0) {
                return;
            }
            this.dragEnd = difference;
        }
    }

    private onDragEnd(e: Event, removeDragEnd: boolean = false) {
        if (this.dragStart) {
            e.preventDefault();
            e.stopPropagation();
            if (this.dragEnd) {
                let state = this.dragEnd > -(Number(this.handleWidth) / 2);
                this.setStateValue((this.inverse) ? !state : state);
            }
            this.dragStart = null;
            if (removeDragEnd) {
                this.dragEnd = null;
            }
            if (this.innerAnimate) {
                this.animate = true;
            }
        }
    }

    @HostListener('touchstart', ['$event']) onTouchStart(e) {
        this.onDragStart(e);
    }

    @HostListener('mousedown', ['$event']) onMouseDown(e) {
        this.onDragStart(e);
    }

    @HostListener('touchmove', ['$event']) onTouchMove(e) {
        this.onDragMove(e);
    }

    @HostListener('mousemove', ['$event']) onMouseMove(e) {
        this.onDragMove(e);
    }

    @HostListener('mouseup', ['$event']) onMouseUp(e: Event) {
        this.onDragEnd(e);
    }

    @HostListener('touchend', ['$event']) onTouchEnd(e: Event) {
        this.onDragEnd(e, true);
    }

    @HostListener('mouseleave', ['$event']) onMouseLeave(e: Event) {
        this.onDragEnd(e, true);
    }

    private getNativeElement() {
        return this.el.nativeElement;
    }

    private $on(): any {
        return this.getNativeElement().querySelector("span:first-child")
    }

    private $off(): any {
        return this.getNativeElement().querySelector("span:nth-child(3)");
    }

    private $label(): any {
        return this.getNativeElement().querySelector('span:nth-child(2)');
    }

    private $container(): any {
        return this.getNativeElement().querySelector("." + this.baseClass + "-container");
    }

    private calculateWith(): void {

        var self = this;

        setTimeout(_ => {
            self.$on().style.width = "auto";
            self.$off().style.width = "auto";
            self.$label().style.width = "auto";
            let width = (this.innerHandleWidth === "auto") ? Math.max(self.$on().offsetWidth, self.$off().offsetWidth) : this.innerHandleWidth;

            if (this.labelWidth === "auto" &&
                self.$label().offsetWidth < width &&
                this.labelWidth < width) {

                self.labelWidth = Number(width) - 13;

            } else if (this.labelWidth === "auto" || this.labelWidth > self.$label().offsetWidth) {
                self.labelWidth = self.$label().offsetWidth;
            }
            self.outerWidth = self.$label().offsetWidth;
            self.handleWidth = width;

            self.ngZone.run(() => {
                self.$label().style.width = self.labelWidth + "px";
                self.$on().style.width = self.handleWidth + "px";
                self.$off().style.width = self.handleWidth + "px";
            })
        });
    }

    @Input('switch-off-text') set setOffText(value: string) {
        if (value)
            this.offText = value;
        else
            this.offText = "OFF";
    }

    @Input('switch-label-text') set setLabelText(value: string) {
        this.labelText = value;
    }

    @Input('switch-on-text') set setOnText(value: string) {
        if (value)
            this.onText = value;
        else
            this.onText = "ON";
    }

    @Input('switch-size') set setSize(value: string) {
        if (value) this.size = value;
    }

    @Input('switch-animate') set setAnimate(value: boolean) {
        this.animate = value;
        this.innerAnimate = value;
    }

    @Input('switch-on-color') set setOnColor(value: string) {
        if (value) this.onColor = value;
    }

    @Input('switch-off-color') set setOffColor(value: string) {
        if (value) this.offColor = value;
    }

    @Input('switch-disabled') set setDisabled(value: boolean) {
        if (value) this.disabled = value;
    }

    @Input('switch-readonly') set setReadOnly(value: boolean) {
        if (value) this.readonly = value;
    }

    @Input('switch-indeterminate') set setIndeterminate(value: boolean) {
        if (value) this.indeterminate = value;
    }

    @Input('switch-inverse') set setInverse(value: boolean) {
        if (value) this.inverse = value;
    }

    @Input('switch-handle-width') set setHandleWidth(value: number) {
        if (value)
            this.innerHandleWidth = value;
        else
            this.innerHandleWidth = "auto";
    }

    @Input('switch-label-width') set setLabelWidth(value: number) {
        if (value) this.labelWidth = value;
    }

    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;

    get value(): boolean {
        return this.innerState;
    };

    set value(v: boolean) {
        this.setStateValue(v);
    }

    private setStateValue(v: boolean): void {
        if (v !== this.innerState) {
            this.innerState = v;
            this.onChangeCallback(v);
        }
    }

    onFocus() {
        this.focused = true;
    }

    onBlur() {
        this.focused = false;
        this.onTouchedCallback();
    }

    writeValue(value: boolean) {
        if (value !== this.innerState) {
            this.innerState = value;
        }
    }

    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

}