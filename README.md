# CliTo

CliTo is a small desktop todo app built with Tauri, React, and SQLite. It gives you a simple local task list that runs as a native Windows app.

## Features

- Create tasks
- View saved tasks
- Delete tasks
- Local SQLite storage
- Native desktop build with Tauri
- Sidebar-based interface

## Download

Windows installers are available from the GitHub Releases page.

For most users, download one of these files from the latest release:

- `*.exe` - standard Windows installer
- `*.msi` - Windows MSI installer

## Development

### Requirements

- [Bun](https://bun.sh/)
- [Rust](https://www.rust-lang.org/tools/install)
- Tauri system dependencies for your platform

### Install Dependencies

```bash
bun install
```

### Run In Development

```bash
bun run tauri dev
```

The frontend dev server runs through Vite, and Tauri opens the desktop app window.

## Build

Create a production desktop build:

```bash
bun run tauri build
```

Windows installer outputs are generated under:

```text
src-tauri/target/release/bundle/
```

Common Windows outputs include:

```text
src-tauri/target/release/bundle/msi/
src-tauri/target/release/bundle/nsis/
```

## Tech Stack

- Tauri 2
- React 19
- Vite
- Rust
- SQLite
- Tailwind CSS
- shadcn-style UI components

## Project Structure

```text
src/                  React frontend
src/components/       UI and todo components
src-tauri/            Tauri and Rust backend
src-tauri/src/db.rs   SQLite database setup
src-tauri/src/tasks.rs
                      Todo CRUD commands
```

## Data Storage

CliTo stores tasks locally in a SQLite database named `todo.db` inside the app data directory managed by Tauri.

## Release

1. Build the app:

```bash
bun run tauri build
```
