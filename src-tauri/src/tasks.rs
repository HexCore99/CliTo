use rusqlite::{ params};
use serde::{Deserialize, Serialize};

// crate means current Rust Project/Module. crate = root
use crate::db::get_connection;

//pass extra info to compiler.
#[derive(Serialize,Deserialize)] //Tell the compiler that, task can be converted to JSON.
pub struct Task {
    id: i64,
    name: String,
    status: String,
    position: i32
}

#[tauri::command] // allow this function to be called from the frontend
pub fn get_tasks(app: tauri::AppHandle) -> Result<Vec<Task>, String> {
    let conn = get_connection(&app)?; // why not map_err here?

    let mut stmt = conn
        .prepare("SELECT id,name,status,position FROM tasks ORDER BY position ASC")
        .map_err(|e| e.to_string())?;

    let tasks = stmt
        .query_map([], |row| {
            Ok(Task {
                id: row.get(0)?,
                name: row.get(1)?,
                status: row.get(2)?,
                position:row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(tasks)
}

#[tauri::command]
pub fn create_task(app: tauri::AppHandle, name: String) -> Result<Task, String> {
    let mut  conn = get_connection(&app)?;
    let tx = conn.transaction().map_err(|e|e.to_string())?;

    let id = chrono::Utc::now().timestamp_millis(); // chrono -> time library

    // Update the position by 1
    tx.execute("UPDATE tasks SET position = position + 1", [],).map_err(|e|e.to_string())?;

    // insert with new pos
    tx.execute(
        "INSERT INTO tasks
                 (id,name,status,position)
                 VALUES(?,?,?,?)",
        params![id, name, "todo",0],
    )
    .map_err(|err| err.to_string())?;

    tx.commit().map_err(|e|e.to_string())?;

    Ok(Task {
        id,
        name,
        status: "todo".to_string(), //why ??
        position:0
    })
}


#[tauri::command]
pub fn update_position(app:tauri::AppHandle,tasks: Vec<Task>)-> Result<(),String>{
    let mut  conn = get_connection(&app)?;
    let tx = conn.transaction()
    .map_err(|err| err.to_string())?;
    
    let mut todo_position:i32 = 0;
    let mut in_progress_position:i32 = 0;
    let mut complete_position:i32 = 0;

    for task in tasks {

        let position = match task.status.as_str() {
           "todo" => {
            let current = todo_position;
            todo_position+=1;
            current
           } 
           "in-progress" => {

            let current = in_progress_position ;
            in_progress_position+=1;
            current
           }

           "completed" => {
            let current = complete_position;
            complete_position+=1;
            current
           }
           unknown =>{
            return Err(format!("Unknown task status:{unknown}"));
           }
        };

        tx.execute("UPDATE tasks SET position = ? WHERE id = ?",
        params![position,task.id])
        .map_err(|err| err.to_string())?;
    } 
    tx.commit()
    .map_err(|err| err.to_string())?;

    Ok(())
}


#[tauri::command]
pub fn update_task_status(app: tauri::AppHandle,id:i64,status: String) -> Result<(), String> {

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
