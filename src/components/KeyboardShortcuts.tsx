import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShortcutSection {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const shortcutSections: ShortcutSection[] = [
  {
    title: "General Shortcuts",
    shortcuts: [
      { keys: ["ctrl", "?"], description: "Show/hide this dialog" },
      { keys: ["esc"], description: "Close dialog" }
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["ctrl", "←"], description: "Previous tab" },
      { keys: ["ctrl", "→"], description: "Next tab" },
      { keys: ["ctrl", "h"], description: "Go to welcome tab" }
    ],
  },
  {
    title: "Search",
    shortcuts: [
      { keys: ["enter"], description: "Perform search in new tab" }
    ],
  },
  {
    title: "Widget Shortcuts",
    shortcuts: [
      { keys: ["ctrl", "y"], description: "Toggle Calendar Calculator" },
      { keys: ["ctrl", "m"], description: "Toggle Media Player" },
      { keys: ["alt", "c"], description: "Toggle Calculator" }
    ],
  }
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcuts({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
          {shortcutSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded border"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 