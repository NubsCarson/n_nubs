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
    title: "Site wide shortcuts",
    shortcuts: [
      { keys: ["s"], description: "Focus search" },
      { keys: ["g", "h"], description: "Go to Home" },
      { keys: ["?"], description: "Show/hide this dialog" },
      { keys: ["esc"], description: "Close dialog" },
    ],
  },
  {
    title: "Windows",
    shortcuts: [
      { keys: ["alt", "c"], description: "Toggle Calculator" },
      { keys: ["alt", "m"], description: "Toggle Media Player" },
      { keys: ["alt", "d"], description: "Toggle Calendar" },
      { keys: ["esc"], description: "Close active window" },
    ],
  },
  {
    title: "Chat",
    shortcuts: [
      { keys: ["ctrl", "enter"], description: "Send message" },
      { keys: ["↑"], description: "Edit last message" },
      { keys: ["alt", "n"], description: "New chat" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["g", "s"], description: "Go to Social" },
      { keys: ["g", "c"], description: "Go to Chat" },
      { keys: ["g", "m"], description: "Go to Media Player" },
    ],
  },
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