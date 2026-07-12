# CliTo

> A local-first desktop task manager for turning everyday work into a calm, focused Kanban workflow.

[![Release](https://img.shields.io/github/v/release/HexCore99/CliTo?display_name=tag&sort=semver)](https://github.com/HexCore99/CliTo/releases)
[![CI](https://img.shields.io/github/actions/workflow/status/HexCore99/CliTo/rust.yml?label=CI)](https://github.com/HexCore99/CliTo/actions/workflows/rust.yml)
[![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri%202-24C8DB)](https://v2.tauri.app/)

CliTo is a lightweight desktop app for planning personal work without handing your task data to a third-party service. Create projects and boards, organize tasks visually, and keep the details that matter - priority, due date, description, and progress - stored locally on your device.

## Highlights

- **Project-based organization** - group work into projects, then create focused boards inside each project.
- **Flexible Kanban board** - move tasks between Todo, In Progress, and Completed; reorder tasks exactly where you want them.
- **Task details at a glance** - add descriptions, choose from four priority levels, and set due dates with quick Today and Tomorrow actions or a calendar.
- **Saved sorting preferences** - sort each board column independently and retain your preferred view between sessions.
- **Safe deletion** - deleted tasks, boards, and projects are moved to Trash first. Restore items when needed or permanently remove them later.
- **Local persistence** - tasks, projects, boards, ordering, and interface preferences are stored locally with SQLite and YAML.
- **Thoughtful desktop experience** - a responsive sidebar remembers its collapsed state and expanded project sections.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Desktop runtime | [Tauri 2](https://v2.tauri.app/) and Rust |
| User interface | React 19 and Vite |
| State management | Zustand |
| Storage | SQLite via Rusqlite |
| Drag and drop | dnd-kit |
| UI styling | Tailwind CSS, Radix UI, and shadcn-style components |
| Package manager | Bun |

## Download

Prebuilt desktop packages are available from [GitHub Releases](https://github.com/HexCore99/CliTo/releases). On Windows, download the latest `.exe` or `.msi` installer. Release builds may also include Linux packages.

## Run Locally

### Prerequisites

- [Bun](https://bun.sh/)
- [Rust](https://www.rust-lang.org/tools/install)
- The platform-specific dependencies required by [Tauri](https://v2.tauri.app/start/prerequisites/)

### Install and start

```bash
git clone https://github.com/HexCore99/CliTo.git
cd CliTo
bun install
bun run tauri dev
```

CliTo uses Tauri commands to access its local database, so run it through `bun run tauri dev` rather than a browser-only Vite preview.

### Production build

```bash
bun run tauri build
```

Generated installers and bundles are written to:

```text
src-tauri/target/release/bundle/
```

## How It Works

```text
React interface
      |
      v
Zustand stores
      |
      v
Tauri commands
      |
      v
Rust persistence layer
      |
      v
SQLite task database + YAML UI preferences
```

The React interface handles interaction and presentation. Zustand keeps the visible board in sync, while Rust owns local persistence through Tauri commands.

## Project Structure

```text
src/
  components/                 Board, task, project navigation, and reusable UI
  components/trash/           Trash list, empty state, and confirmation dialog
  stores/                     Zustand stores for tasks, boards, projects, sorting, and trash

src-tauri/
  src/db.rs                   SQLite connection, schema, and migrations
  src/tasks.rs                Task, sorting, due-date, priority, and Trash commands
  src/projects.rs             Project and board persistence commands
  src/ui_config.rs            Persisted sidebar and sorting preferences
  tauri.conf.json             Desktop application configuration

.github/workflows/
  rust.yml                    Rust checks and tests
  release.yaml                Desktop release builds
```

## Local Data

CliTo keeps its data in your operating system's application-data directory:

- `todo.db` - SQLite database containing projects, boards, and tasks.
- `ui_config.yaml` - sidebar and sorting preferences.

On Windows, the default location is:

```text
%APPDATA%\com.hexcr.clito\
```

## Contributing

Ideas, bug reports, and pull requests are welcome. Please open an [issue](https://github.com/HexCore99/CliTo/issues) to discuss substantial changes before starting work.
