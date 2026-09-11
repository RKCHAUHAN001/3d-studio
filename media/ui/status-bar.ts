export class StatusBar {

    private readonly element:
        HTMLElement | null;

    constructor() {

        this.element =
            document.getElementById(
                "status-bar"
            );
    }

    set(
        message: string
    ): void {

        if (!this.element) {
            return;
        }

        this.element.textContent =
            message;
    }
}