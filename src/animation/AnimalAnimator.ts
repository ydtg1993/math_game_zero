export class AnimalAnimator {
    static walkIn(element: HTMLElement): Promise<void> {
        element.classList.add('walk-in');
        return new Promise(resolve => {
            element.addEventListener('animationend', () => {
                element.classList.remove('walk-in');
                resolve();
            }, { once: true });
        });
    }

    static walkOut(element: HTMLElement): Promise<void> {
        element.classList.add('walk-out');
        return new Promise(resolve => {
            element.addEventListener('animationend', () => {
                element.classList.remove('walk-out');
                element.remove();
                resolve();
            }, { once: true });
        });
    }
}