use rusqlite::Connection;
use tauri::Manager;

// Result<T,E> is Try-Catch
//  |err| err.to_string() === (err)=>err.to_string()

pub fn get_connection(app: &tauri::AppHandle) -> Result<Connection, String> {
    let app_data_dir = app.path().app_data_dir().map_err(|err| err.to_string())?;

    std::fs::create_dir_all(&app_data_dir).map_err(|err| err.to_string())?;
    let db_path = app_data_dir.join("todo.db");

    println!("{:?}", db_path);
    println!("{}", db_path.display());

    let conn = Connection::open(db_path).map_err(|err| err.to_string())?; // ? if Err, return early

    conn.execute(
        "
        CREATE TABLE IF NOT EXISTS tasks(
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'todo',
        position INTEGER NOT NULL DEFAULT 0,
        due_date DATE,
        priority INTEGER NOT NULL DEFAULT 4,
        description TEXT
        )",
        [],
    )
    .map_err(|err| err.to_string())?;

    Ok(conn)
}
