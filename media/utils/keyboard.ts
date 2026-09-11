export type KeyboardHandlers = {
    reset: () => void;
    fit: () => void;
    toggleGrid: () => void;
    toggleWireframe: () => void;
    toggleAutoRotate: () => void;
};

export function setupKeyboardShortcuts(
    handlers: KeyboardHandlers
): () => void {

    const listener =
        (event: KeyboardEvent): void => {

            const target =
                event.target as HTMLElement | null;

            if (
                target &&
                (
                    target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.isContentEditable
                )
            ) {
                return;
            }

            switch (
                event.key.toLowerCase()
            ) {

                case "r":
                    handlers.reset();
                    break;

                case "f":
                    handlers.fit();
                    break;

                case "g":
                    handlers.toggleGrid();
                    break;

                case "w":
                    handlers.toggleWireframe();
                    break;

                case "a":
                    handlers.toggleAutoRotate();
                    break;
            }
        };

    window.addEventListener(
        "keydown",
        listener
    );

    return () => {
        window.removeEventListener(
            "keydown",
            listener
        );
    };
}