use rusqlite::params;
use serde::Serialize;

// crate means current Rust Project/Module. crate = root
use crate::db::get_connection;

//pass extra info to compiler.
#[derive(Serialize)] //Tell the compiler that, task can be converted to JSON.
pub struct Task {
    id: i64,
    name: String,
    status: String,
}

#[tauri::command] // allow this function to be called from the frontend
pub fn get_tasks(app: tauri::AppHandle) -> Result<Vec<Task>, String> {
    let conn = get_connection(&app)?; // why not map_err here?

    let mut stmt = conn
        .prepare("SELECT id,name,status FROM tasks ORDER BY id DESC")
        .map_err(|e| e.to_string())?;

    let tasks = stmt
        .query_map([], |row| {
            Ok(Task {
                id: row.get(0)?,
                name: row.get(1)?,
                status: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(tasks)
}

#[tauri::command]
pub fn create_task(app: tauri::AppHandle, name: String) -> Result<Task, String> {
    let conn = get_connection(&app)?;

    let id = chrono::Utc::now().timestamp_millis(); // chrono -> time library
    conn.execute(
        "INSERT INTO tasks
                 (id,name,status)
                 VALUES(?,?,?)",
        params![id, name, "todo"],
    )
    .map_err(|err| err.to_string())?;
    Ok(Task {
        id,
        name,
        status: "todo".to_string(), //why ??
    })
}

#[tauri::command]
pub fn update_task_status(app: tauri::AppHandle, id: i64, status: String) -> Result<(), String> {
    let conn = get_connection(&app)?;
    let sql = "UPDATE tasks
                SET status = ?
                WHERE id = ?";
    conn.execute(sql, params![status, id])
        .map_err(|err| err.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_task(app: tauri::AppHandle, id: i64) -> Result<(), String> {
    let conn = get_connection(&app)?;

    conn.execute(
        "DELETE FROM tasks
                 WHERE id = ?",
        params![id],
    )
    .map_err(|err| err.to_string())?;

    Ok(())
}
