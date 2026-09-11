export interface CollapsiblePanelConfig {
    panelId: string;
    headerId: string;
}

export class CollapsiblePanels {

    private readonly panels:
        HTMLElement[] = [];

    private readonly headers:
        HTMLElement[] = [];

    constructor(
        configs: CollapsiblePanelConfig[]
    ) {

        for (const config of configs) {

            const panel =
                document.getElementById(
                    config.panelId
                );

            const header =
                document.getElementById(
                    config.headerId
                );

            if (!panel || !header) {
                console.warn(
                    `Collapsible panel not found: ${config.panelId}`
                );

                continue;
            }

            this.panels.push(panel);
            this.headers.push(header);

            this.setupPanel(
                panel,
                header
            );
        }

        this.setupOutsideClick();
    }

    private setupPanel(
        panel: HTMLElement,
        header: HTMLElement
    ): void {

        header.addEventListener(
            "pointerdown",
            (event: PointerEvent) => {

                event.preventDefault();
                event.stopPropagation();

                const isExpanded =
                    panel.classList.contains(
                        "expanded"
                    );

                this.closeAll();

                if (!isExpanded) {

                    panel.classList.add(
                        "expanded"
                    );
                }
            }
        );

        panel.addEventListener(
            "pointerdown",
            (event: PointerEvent) => {

                event.stopPropagation();
            }
        );
    }

    private setupOutsideClick(): void {

        document.addEventListener(
            "pointerdown",
            (event: PointerEvent) => {

                const target =
                    event.target as Node | null;

                if (!target) {
                    return;
                }

                for (
                    const panel
                    of this.panels
                ) {

                    if (
                        panel.contains(target)
                    ) {
                        return;
                    }
                }

                this.closeAll();
            }
        );
    }

    closeAll(): void {

        for (
            const panel
            of this.panels
        ) {

            panel.classList.remove(
                "expanded"
            );
        }
    }

    open(
        panelId: string
    ): void {

        this.closeAll();

        const panel =
            document.getElementById(
                panelId
            );

        if (panel) {

            panel.classList.add(
                "expanded"
            );
        }
    }

    toggle(
        panelId: string
    ): void {

        const panel =
            document.getElementById(
                panelId
            );

        if (!panel) {
            return;
        }

        const expanded =
            panel.classList.contains(
                "expanded"
            );

        this.closeAll();

        if (!expanded) {

            panel.classList.add(
                "expanded"
            );
        }
    }

    isExpanded(
        panelId: string
    ): boolean {

        const panel =
            document.getElementById(
                panelId
            );

        return Boolean(
            panel?.classList.contains(
                "expanded"
            )
        );
    }
}