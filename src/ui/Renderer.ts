export class Renderer {
    constructor(private root: Document | HTMLElement = document) {}

    getElement<T extends HTMLElement>(selector: string): T {
        return this.root.querySelector(selector) as T;
    }

    setText(selector: string, text: string): void {
        const el = this.getElement(selector);
        if (el) el.textContent = text;
    }

    setHTML(selector: string, html: string): void {
        const el = this.getElement(selector);
        if (el) el.innerHTML = html;
    }

    addClass(selector: string, className: string): void {
        this.getElement(selector)?.classList.add(className);
    }

    removeClass(selector: string, className: string): void {
        this.getElement(selector)?.classList.remove(className);
    }

    toggleClass(selector: string, className: string, force?: boolean): void {
        this.getElement(selector)?.classList.toggle(className, force);
    }

    setStyle(selector: string, styles: Partial<CSSStyleDeclaration>): void {
        const el = this.getElement(selector);
        if (el) Object.assign(el.style, styles);
    }

    clearContainer(selector: string): void {
        const el = this.getElement(selector);
        if (el) el.innerHTML = '';
    }

    setInputValue(selector: string, value: string): void {
        const el = this.getElement<HTMLInputElement>(selector);
        if (el) el.value = value;
    }
}