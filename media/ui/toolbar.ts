export type ViewMode =
    | "solid"
    | "wireframe"
    | "xray";

export interface ToolbarCallbacks {

    reset: () => void;

    fit: () => void;

    grid: () => void;

    axes: () => void;

    box: () => void;

    wireframe: () => void;

    viewMode: (
        mode: ViewMode
    ) => void;

    rotate: () => void;

    screenshot: () => void;
}

export class Toolbar {

    private readonly viewModeSelect:
        HTMLSelectElement | null;

    constructor(
        private readonly callbacks:
            ToolbarCallbacks
    ) {

        this.viewModeSelect =
            document.getElementById(
                "view-mode-select"
            ) as HTMLSelectElement | null;

        this.bind(
            "reset-btn",
            callbacks.reset
        );

        this.bind(
            "fit-btn",
            callbacks.fit
        );

        this.bind(
            "grid-btn",
            callbacks.grid
        );

        this.bind(
            "axes-btn",
            callbacks.axes
        );

        this.bind(
            "box-btn",
            callbacks.box
        );

        this.bind(
            "wireframe-btn",
            callbacks.wireframe
        );

        this.bind(
            "rotate-btn",
            callbacks.rotate
        );

        this.bind(
            "screenshot-btn",
            callbacks.screenshot
        );

        this.setupViewMode();
    }

    setActive(
        id: string,
        active: boolean
    ): void {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        element.classList.toggle(
            "active",
            active
        );
    }

    setViewMode(
        mode: ViewMode
    ): void {

        if (!this.viewModeSelect) {
            return;
        }

        this.viewModeSelect.value =
            mode;
    }

    getViewMode(): ViewMode {

        if (!this.viewModeSelect) {
            return "solid";
        }

        const value =
            this.viewModeSelect.value;

        if (
            value === "wireframe" ||
            value === "xray"
        ) {
            return value;
        }

        return "solid";
    }

    private setupViewMode(): void {

        if (!this.viewModeSelect) {

            console.warn(
                "View mode dropdown not found."
            );

            return;
        }

        this.viewModeSelect.addEventListener(
            "change",
            () => {

                const value =
                    this.viewModeSelect?.value;

                let mode: ViewMode =
                    "solid";

                if (
                    value === "wireframe"
                ) {

                    mode =
                        "wireframe";

                } else if (
                    value === "xray"
                ) {

                    mode =
                        "xray";
                }

                this.callbacks.viewMode(
                    mode
                );
            }
        );
    }

    private bind(
        id: string,
        callback: () => void
    ): void {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        element.addEventListener(
            "click",
            callback
        );
    }
}