export class FruitAnimator {
    static bounceIn(element: HTMLElement): Promise<void> {
        element.classList.add('bounce-in');
        return new Promise(resolve => {
            element.addEventListener('animationend', () => {
                element.classList.remove('bounce-in');
                resolve();
            }, { once: true });
        });
    }

    static popOut(element: HTMLElement): Promise<void> {
        element.classList.add('pop-out');
        return new Promise(resolve => {
            element.addEventListener('animationend', () => {
                element.classList.remove('pop-out');
                element.remove();
                resolve();
            }, { once: true });
        });
    }
}