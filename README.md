# CliTo

CliTo is a local-first personal task manager for organizing work through a
simple Kanban workflow. It is built as a lightweight desktop application with
Tauri, React, Rust, and SQLite.

## Features

- Organize tasks across **Todo**, **In Progress**, and **Completed** columns
- Create and delete tasks
- Move tasks between columns with drag and drop
- Reorder tasks within the board
- Mark tasks as complete with a checkbox
- Assign one of four priority levels
- Set due dates with Today and Tomorrow shortcuts or a calendar
- Prevent selection of past due dates
- Persist tasks, status, order, priority, and due dates locally
- Preserve sidebar preferences between sessions

## Technology

- **Desktop:** Tauri 2 and Rust
- **Frontend:** React 19 and Vite
- **State management:** Zustand
- **Database:** SQLite with Rusqlite
- **Drag and drop:** dnd-kit
- **Styling:** Tailwind CSS, Radix UI, and shadcn-style components
- **Package manager:** Bun

## Download

Desktop packages are published through
[GitHub Releases](https://github.com/HexCore99/CliTo/releases).

For Windows, download the latest `.exe` or `.msi` installer. Linux packages are
also produced by the release workflow when available.

## Development

### Prerequisites

- [Bun](https://bun.sh/)
- [Rust](https://www.rust-lang.org/tools/install)
- Platform dependencies required by Tauri

### Install dependencies

```bash
bun install
```

### Run the desktop application

```bash
bun run tauri dev
```

CliTo uses Tauri commands for database access, so it should be run through the
Tauri development command rather than as a standalone browser application.

### Build the frontend

```bash
bun run build
```

### Build desktop packages

```bash
bun run tauri build
```

Generated desktop packages are written under:

```text
src-tauri/target/release/bundle/
```

## Architecture

```text
React components
    |
    v
Zustand task store
    |
    v
Tauri commands
    |
    v
Rust backend
    |
    v
SQLite database
```

The React interface manages presentation and interaction state. Zustand keeps
the task list synchronized across components, while Rust commands handle
database reads and writes.

## Project Structure

```text
src/
  components/             Task board and reusable UI components
  stores/useTaskStore.js  Shared task state and backend actions

src-tauri/
  src/db.rs               SQLite connection and schema setup
  src/tasks.rs            Task commands and persistence logic
  src/ui_config.rs        Persistent interface preferences
  tauri.conf.json         Desktop application configuration

.github/workflows/
  release.yaml            Windows and Linux release builds
  rust.yml                Rust checks and tests
```

## Local Data

CliTo stores task data in `todo.db` inside the operating system's application
data directory. On Windows, the default location is:

```text
%APPDATA%\com.hexcr.clito\todo.db
```

Interface preferences are stored separately in `ui_config.yaml` in the same
application data directory.
