use rusqlite::{params, OptionalExtension};
use serde::{Deserialize, Serialize};

// crate means current Rust Project/Module. crate = root
use crate::db::get_connection;

//pass extra info to compiler.
#[derive(Serialize, Deserialize)] //Tell the compiler that, task can be converted to JSON.
pub struct Task {
    id: i64,
    #[serde(default)]
    board_id: Option<i64>,
    name: String,
    status: String,
    position: i32,
    priority: i32,
    due_date: Option<String>,
    description: Option<String>,
}

#[tauri::command] // allow this function to be called from the frontend
pub fn get_tasks(app: tauri::AppHandle, board_id: Option<i64>) -> Result<Vec<Task>, String> {
    let conn = get_connection(&app)?; // why not map_err here?

    let mut stmt = conn
        .prepare(
            "SELECT id,board_id,name,status,position,priority,due_date,description
         FROM tasks
         WHERE in_trash = 0
         AND board_id IS ?
         ORDER BY position ASC",
        )
        .map_err(|e| e.to_string())?;

    let tasks = stmt
        .query_map(params![board_id], |row| {
            Ok(Task {
                id: row.get(0)?,
                board_id: row.get(1)?,
                name: row.get(2)?,
                status: row.get(3)?,
                position: row.get(4)?,
                priority: row.get(5)?,
                due_date: row.get(6)?,
                description: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(tasks)
}

#[tauri::command]
pub fn get_trash_tasks(app: tauri::AppHandle) -> Result<Vec<Task>, String> {
    let conn = get_connection(&app).map_err(|err| err.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id,board_id,name,status,position,priority,due_date,description
          FROM tasks
          WHERE in_trash = 1
          ORDER BY position ASC",
        )
        .map_err(|err| err.to_string())?;
    let tasks = stmt
        .query_map([], |row| {
            Ok(Task {
                id: row.get(0)?,
                board_id: row.get(1)?,
                name: row.get(2)?,
                status: row.get(3)?,
                position: row.get(4)?,
                priority: row.get(5)?,
                due_date: row.get(6)?,
                description: row.get(7)?,
            })
        })
        .map_err(|err| err.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|err| err.to_string())?;
    Ok(tasks)
}

#[tauri::command]
pub fn create_task(
    app: tauri::AppHandle,
    name: String,
    priority: i32,
    due_date: Option<String>,
    description: Option<String>,
    board_id: Option<i64>,
) -> Result<(), String> {
    let mut conn = get_connection(&app)?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    let id = chrono::Utc::now().timestamp_millis(); // chrono -> time library

    if let Some(selected_board_id) = board_id {
        let board_exists: bool = tx
            .query_row(
                "SELECT EXISTS(
                    SELECT 1
                    FROM boards
                    JOIN projects ON projects.id = boards.project_id
                    WHERE boards.id = ?
                    AND boards.in_trash = 0
                    AND projects.in_trash = 0
                )",
                params![selected_board_id],
                |row| row.get(0),
            )
            .map_err(|err| err.to_string())?;

        if !board_exists {
            return Err("The selected board does not exist".to_string());
        }
    }

    // Only shift Todo tasks that belong to the selected board.
    tx.execute(
        "UPDATE tasks
         SET position = position + 1
         WHERE board_id IS ?
         AND status = 'todo'
         AND in_trash = 0",
        params![board_id],
    )
        .map_err(|e| e.to_string())?;

    // insert with new pos
    tx.execute(
        "INSERT INTO tasks
                 (id,board_id,name,position,priority,due_date,description)
                 VALUES(?,?,?,?,?,?,?)",
        params![id, board_id, name, 0, priority, due_date, description],
    )
    .map_err(|err| err.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_position(
    app: tauri::AppHandle,
    tasks: Vec<Task>,
    board_id: Option<i64>,
) -> Result<(), String> {
    let mut conn = get_connection(&app)?;
    let tx = conn.transaction().map_err(|err| err.to_string())?;

    let mut todo_position: i32 = 0;
    let mut in_progress_position: i32 = 0;
    let mut complete_position: i32 = 0;

    for task in tasks {
        if task.board_id != board_id {
            return Err("Cannot reorder tasks from different boards".to_string());
        }

        let position = match task.status.as_str() {
            "todo" => {
                let current = todo_position;
                todo_position += 1;
                current
            }
            "in-progress" => {
                let current = in_progress_position;
                in_progress_position += 1;
                current
            }

            "completed" => {
                let current = complete_position;
                complete_position += 1;
                current
            }
            unknown => {
                return Err(format!("Unknown task status:{unknown}"));
            }
        };

        tx.execute(
            "UPDATE tasks
             SET position = ?
             WHERE id = ?
             AND board_id IS ?",
            params![position, task.id, board_id],
        )
        .map_err(|err| err.to_string())?;
    }
    tx.commit().map_err(|err| err.to_string())?;

    Ok(())
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
pub fn update_task_desc(
    app: tauri::AppHandle,
    id: i64,
    updated_task: String,
) -> Result<(), String> {
    let conn = get_connection(&app).map_err(|err| err.to_string())?;

    conn.execute(
        "UPDATE tasks
             SET name = ?
             WHERE id =?",
        params![updated_task, id],
    )
    .map_err(|err| err.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn move_to_trash(app: tauri::AppHandle, id: i64) -> Result<(), String> {
    let conn = get_connection(&app)?;

    conn.execute(
        " UPDATE tasks
          SET in_trash = 1
          WHERE id = ?",
        params![id],
    )
    .map_err(|err| err.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn restore_from_trash(app: tauri::AppHandle, id: i64) -> Result<(), String> {
    let mut conn = get_connection(&app)?;
    let tx = conn.transaction().map_err(|err| err.to_string())?;

    let board_id: Option<i64> = tx
        .query_row(
            "SELECT board_id
             FROM tasks
             WHERE id = ?
             AND in_trash = 1",
            params![id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|err| err.to_string())?
        .ok_or_else(|| "Trashed task does not exist".to_string())?;

    if let Some(board_id) = board_id {
        tx.execute(
            "UPDATE projects
             SET in_trash = 0
             WHERE id = (
                SELECT project_id FROM boards WHERE id = ?
             )",
            params![board_id],
        )
        .map_err(|err| err.to_string())?;

        tx.execute(
            "UPDATE boards SET in_trash = 0 WHERE id = ?",
            params![board_id],
        )
        .map_err(|err| err.to_string())?;
    }

    tx.execute(
        "UPDATE tasks SET in_trash = 0 WHERE id = ?",
        params![id],
    )
    .map_err(|err| err.to_string())?;

    tx.commit().map_err(|err| err.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_from_trash(app: tauri::AppHandle, id: i64) -> Result<(), String> {
    let mut conn = get_connection(&app)?;
    let tx = conn.transaction().map_err(|err| err.to_string())?;

    tx.execute(
        " DELETE FROM tasks
          WHERE id = ?
          AND in_trash = 1",
        params![id],
    )
    .map_err(|err| err.to_string())?;

    tx.execute(
        "DELETE FROM boards
         WHERE in_trash = 1
         AND NOT EXISTS (
            SELECT 1 FROM tasks WHERE tasks.board_id = boards.id
         )",
        [],
    )
    .map_err(|err| err.to_string())?;

    tx.execute(
        "DELETE FROM projects
         WHERE in_trash = 1
         AND NOT EXISTS (
            SELECT 1 FROM boards WHERE boards.project_id = projects.id
         )",
        [],
    )
    .map_err(|err| err.to_string())?;

    tx.commit().map_err(|err| err.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn empty_trash(app: tauri::AppHandle) -> Result<(), String> {
    let mut conn = get_connection(&app)?;
    let tx = conn.transaction().map_err(|err| err.to_string())?;

    tx.execute(
        " DELETE FROM tasks
          WHERE in_trash = 1",
        [],
    )
    .map_err(|err| err.to_string())?;

    tx.execute("DELETE FROM boards WHERE in_trash = 1", [])
        .map_err(|err| err.to_string())?;

    tx.execute(
        "DELETE FROM projects
         WHERE in_trash = 1
         AND NOT EXISTS (
            SELECT 1 FROM boards WHERE boards.project_id = projects.id
         )",
        [],
    )
    .map_err(|err| err.to_string())?;

    tx.commit().map_err(|err| err.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn set_due_date(
    app: tauri::AppHandle,
    id: i64,
    due_date: Option<String>,
) -> Result<(), String> {
    let conn = get_connection(&app).map_err(|err| err.to_string())?;

    conn.execute(
        "UPDATE tasks SET due_date = ? WHERE id = ?",
        params![due_date, id],
    )
    .map_err(|err| err.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn set_priority(app: tauri::AppHandle, id: i64, priority: i32) -> Result<(), String> {
    let conn = get_connection(&app).map_err(|err| err.to_string())?;

    conn.execute(
        "UPDATE tasks SET priority = ? WHERE id = ?",
        params![priority, id],
    )
    .map_err(|err| err.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn set_description(
    app: tauri::AppHandle,
    id: i64,
    description: Option<String>,
) -> Result<(), String> {
    let conn = get_connection(&app).map_err(|err| err.to_string())?;

    conn.execute(
        "UPDATE tasks SET description = ? WHERE id = ?",
        params![description, id],
    )
    .map_err(|err| err.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn sort_tasks(
    app: tauri::AppHandle,
    column_name: String,
    sort_option: String,
    board_id: Option<i64>,
) -> Result<Vec<Task>, String> {
    if !matches!(column_name.as_str(), "todo" | "in-progress" | "completed") {
        return Err(format!("Invalid column name: {}", column_name));
    };

    let conn = get_connection(&app).map_err(|err| err.to_string())?;

    let order_by_clause = match sort_option.as_str() {
        "default" => "position ASC",
        "date-asc" => "CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date ASC",
        "date-desc" => " CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date DESC",
        "priority-high" => "priority ASC",
        "priority-low" => "priority DESC",
        _ => return Err(format!("Unknown sort option: {}", sort_option)),
    };

    let query = format!(
        "SELECT id,board_id,name,status,position,priority,due_date,description
         FROM tasks
         WHERE status = ?
         AND board_id IS ?
         AND in_trash = 0
         ORDER BY {}",
        order_by_clause
    );

    let mut stmt = conn.prepare(&query).map_err(|err| err.to_string())?;

    let tasks = stmt
        .query_map(params![column_name, board_id], |row| {
            Ok(Task {
                id: row.get(0)?,
                board_id: row.get(1)?,
                name: row.get(2)?,
                status: row.get(3)?,
                position: row.get(4)?,
                priority: row.get(5)?,
                due_date: row.get(6)?,
                description: row.get(7)?,
            })
        })
        .map_err(|err| err.to_string())?
        .collect::<Result<Vec<Task>, _>>()
        .map_err(|err| err.to_string())?;

    Ok(tasks)
}
