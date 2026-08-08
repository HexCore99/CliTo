use rusqlite::Connection;
use tauri::Manager;

pub fn get_connection(app: &tauri::AppHandle) -> Result<Connection, String> {
    let app_data_dir = app.path().app_data_dir().map_err(|err| err.to_string())?;

    std::fs::create_dir_all(&app_data_dir).map_err(|err| err.to_string())?;

    let db_path = app_data_dir.join("todo.db");

    println!("{}", db_path.display());

    let conn = Connection::open(db_path).map_err(|err| err.to_string())?;

    // Foreign-key enforcement must be enabled for every SQLite connection.
    conn.execute_batch("PRAGMA foreign_keys = ON;")
        .map_err(|err| err.to_string())?;

    /*
     * A project is the top-level folder:
     * Media, Gaming, Development, etc.
     */
    conn.execute(
        "
        CREATE TABLE IF NOT EXISTS projects (
            id          INTEGER PRIMARY KEY,
            name        TEXT NOT NULL COLLATE NOCASE UNIQUE,
            position    INTEGER NOT NULL DEFAULT 0,
            in_trash    INTEGER NOT NULL DEFAULT 0
        )
        ",
        [],
    )
    .map_err(|err| err.to_string())?;

    /*
     * A board is a task manager inside a project:
     * Media -> Movies
     * Media -> Anime
     */
    conn.execute(
        "
        CREATE TABLE IF NOT EXISTS boards (
            id          INTEGER PRIMARY KEY,
            project_id  INTEGER NOT NULL,
            name        TEXT NOT NULL COLLATE NOCASE,
            position    INTEGER NOT NULL DEFAULT 0,
            in_trash    INTEGER NOT NULL DEFAULT 0,

            FOREIGN KEY (project_id)
                REFERENCES projects(id)
                ON DELETE RESTRICT,

            UNIQUE(project_id, name)
        )
        ",
        [],
    )
    .map_err(|err| err.to_string())?;

    /*
     * board_id is nullable:
     * NULL       = General -> All
     * Some value = a particular project board
     */
    conn.execute(
        "
        CREATE TABLE IF NOT EXISTS tasks (
            id          INTEGER PRIMARY KEY,
            board_id    INTEGER,
            name        TEXT NOT NULL,
            status      TEXT NOT NULL DEFAULT 'todo',
            position    INTEGER NOT NULL DEFAULT 0,
            due_date    DATE,
            priority    INTEGER NOT NULL DEFAULT 4,
            description TEXT,
            creation_date TEXT NOT NULL,
            in_trash    INTEGER NOT NULL DEFAULT 0,

            FOREIGN KEY (board_id)
                REFERENCES boards(id)
                ON DELETE RESTRICT
        )
        ",
        [],
    )
    .map_err(|err| err.to_string())?;

    /*
     * CREATE TABLE NOTES if not exists
     */

    // flag
    conn.execute(
        "
        CREATE TABLE IF NOT EXISTS notes(
        id INTEGER PRIMARY KEY,
        task_id INTEGER NOT NULL,
        is_completed INTEGER DEFAULT 0,
        description TEXT NOT NULL,
        creation_date DATE,
        modified_date DATE,

        FOREIGN KEY(task_id)
        REFERENCES tasks(id)
        )
        ",
        [],
    )
    .map_err(|err| err.to_string())?;

    /*
     * CREATE TABLE IF NOT EXISTS does not add new columns to an
     * existing tasks table, so migrate older databases manually.
     */
    let board_id_exists: bool = conn
        .query_row(
            "
            SELECT EXISTS (
                SELECT 1
                FROM pragma_table_info('tasks')
                WHERE name = 'board_id'
            )
            ",
            [],
            |row| row.get(0),
        )
        .map_err(|err| err.to_string())?;

    if !board_id_exists {
        conn.execute(
            "
            ALTER TABLE tasks
            ADD COLUMN board_id INTEGER
            REFERENCES boards(id)
            ON DELETE RESTRICT
            ",
            [],
        )
        .map_err(|err| err.to_string())?;
    }

    let creation_date_exists: bool = conn
        .query_row(
            "
            SELECT EXISTS (
                SELECT 1
                FROM pragma_table_info('tasks')
                WHERE name = 'creation_date'
            )
            ",
            [],
            |row| row.get(0),
        )
        .map_err(|err| err.to_string())?;

    if !creation_date_exists {
        conn.execute("ALTER TABLE tasks ADD COLUMN creation_date TEXT", [])
            .map_err(|err| err.to_string())?;

        // SQLite cannot recover historical creation times, so preserve old
        // tasks with the timestamp at which this migration first runs.
        let migration_date = chrono::Utc::now().to_rfc3339();
        conn.execute(
            "UPDATE tasks SET creation_date = ? WHERE creation_date IS NULL",
            [migration_date],
        )
        .map_err(|err| err.to_string())?;
    }

    // Improve board-scoped task queries.
    conn.execute(
        "
        CREATE INDEX IF NOT EXISTS idx_tasks_board
        ON tasks(board_id)
        ",
        [],
    )
    .map_err(|err| err.to_string())?;

    conn.execute(
        "
        CREATE INDEX IF NOT EXISTS idx_tasks_board_status_position
        ON tasks(board_id, status, position)
        ",
        [],
    )
    .map_err(|err| err.to_string())?;

    conn.execute(
        "
        CREATE INDEX IF NOT EXISTS idx_boards_project_position
        ON boards(project_id, position)
        ",
        [],
    )
    .map_err(|err| err.to_string())?;

    Ok(conn)
}
