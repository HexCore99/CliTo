import { CheckIcon, LaptopIcon, MoonIcon, PanelsTopLeftIcon, SunIcon } from "lucide-react";

const THEME_OPTIONS = [
  {
    value: "system",
    label: "System",
    description: "Match your operating system",
    icon: LaptopIcon,
  },
  {
    value: "light",
    label: "Light",
    description: "Always use the light theme",
    icon: SunIcon,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Always use the dark theme",
    icon: MoonIcon,
  },
];

const PRIORITY_OPTIONS = [
  { value: 1, label: "Priority 1", description: "Urgent" },
  { value: 2, label: "Priority 2", description: "High" },
  { value: 3, label: "Priority 3", description: "Medium" },
  { value: 4, label: "Priority 4", description: "Low" },
];

function SettingCard({ title, description, children }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Settings({ config, onConfigChange }) {
  const theme = config.appearance?.theme ?? "system";
  const defaultPriority = config.taskDefaults?.priority ?? 4;

  function updateConfig(changes) {
    onConfigChange({ ...config, ...changes });
  }

  function updateTheme(nextTheme) {
    updateConfig({
      appearance: {
        ...config.appearance,
        theme: nextTheme,
      },
    });
  }

  function updateSidebarStyle(openAndFloat) {
    updateConfig({
      sidebar: {
        ...config.sidebar,
        openAndFloat,
      },
    });
  }

  function updateDefaultPriority(priority) {
    updateConfig({
      taskDefaults: {
        ...config.taskDefaults,
        priority,
      },
    });
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Personalize how Taskora looks and how new tasks start.
        </p>
      </div>

      <div className="space-y-5">
        <SettingCard
          title="Appearance"
          description="Choose the color theme used throughout Taskora."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {THEME_OPTIONS.map(({ value, label, description, icon: Icon }) => {
              const selected = theme === value;

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  className={`relative flex min-h-28 flex-col items-start rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/60"
                  }`}
                  onClick={() => updateTheme(value)}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  <span className="mt-4 font-medium">{label}</span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {description}
                  </span>
                  {selected && (
                    <CheckIcon
                      className="absolute top-3 right-3 size-4 text-primary"
                      aria-label="Selected"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </SettingCard>

        <SettingCard
          title="Sidebar"
          description="Choose how the sidebar sits alongside your workspace."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[false, true].map((openAndFloat) => {
              const selected = config.sidebar.openAndFloat === openAndFloat;
              const label = openAndFloat ? "Floating" : "Standard";
              const description = openAndFloat
                ? "Show the sidebar as a floating panel"
                : "Keep the sidebar attached to the workspace";

              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={selected}
                  className={`relative flex items-center gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/60"
                  }`}
                  onClick={() => updateSidebarStyle(openAndFloat)}
                >
                  <PanelsTopLeftIcon className="size-5" aria-hidden="true" />
                  <span>
                    <span className="block font-medium">{label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {description}
                    </span>
                  </span>
                  {selected && (
                    <CheckIcon
                      className="ml-auto size-4 text-primary"
                      aria-label="Selected"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </SettingCard>

        <SettingCard
          title="New tasks"
          description="Set the priority preselected when you add a task."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {PRIORITY_OPTIONS.map(({ value, label, description }) => {
              const selected = defaultPriority === value;

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  className={`relative flex items-center justify-between rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/60"
                  }`}
                  onClick={() => updateDefaultPriority(value)}
                >
                  <span>
                    <span className="block font-medium">{label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {description}
                    </span>
                  </span>
                  {selected && (
                    <CheckIcon className="size-4 text-primary" aria-label="Selected" />
                  )}
                </button>
              );
            })}
          </div>
        </SettingCard>
      </div>
    </main>
  );
}
