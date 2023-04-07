const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const { parse } = require("date-fns");

const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db;

const startDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

startDBAndServer();

//Get Todos With Different Scenarios

app.get("/todos/", async (request, response) => {
  const { search_q, category, priority, status } = request.query;

  if (priority !== undefined && status !== undefined) {
    if (priority !== "HIGH" && priority !== "MEDIUM" && priority !== "LOW") {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else if (
      status !== "TO DO" &&
      status !== "IN PROGRESS" &&
      status !== "DONE"
    ) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      const getTodoQuery = `
          SELECT
          id,
          todo,
          priority,
          status,
          category,
          due_date AS dueDate
          FROM todo
          WHERE status='${status}' AND priority='${priority}';`;
      const todoList = await db.all(getTodoQuery);
      response.send(todoList);
    }
  } else if (category !== undefined && status !== undefined) {
    if (category !== "HOME" && category !== "WORK" && category !== "LEARNING") {
      response.status(400);
      response.send("Invalid Todo Category");
    } else if (
      status !== "TO DO" &&
      status !== "IN PROGRESS" &&
      status !== "DONE"
    ) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      const getTodoQuery = `
          SELECT
          id,
          todo,
          priority,
          status,
          category,
          due_date AS dueDate
          FROM todo
          WHERE category='${category}' AND status='${status}';`;
      const todoList = await db.all(getTodoQuery);
      response.send(todoList);
    }
  } else if (category !== undefined && priority !== undefined) {
    if (category !== "HOME" && category !== "WORK" && category !== "LEARNING") {
      response.status(400);
      response.send("Invalid Todo Category");
    } else if (
      priority !== "HIGH" &&
      priority !== "LOW" &&
      priority !== "MEDIUM"
    ) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      const getTodoQuery = `
          SELECT
          id,
          todo,
          priority,
          status,
          category,
          due_date AS dueDate
          FROM todo
          WHERE category='${category}' AND priority='${priority}';`;
      const todoList = await db.all(getTodoQuery);
      response.send(todoList);
    }
  } else if (status !== undefined) {
    if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      const getTodoQuery = `
          SELECT
          id,
          todo,
          priority,
          status,
          category,
          due_date AS dueDate
          FROM todo
          WHERE status= '${status}';`;
      const todoList = await db.all(getTodoQuery);
      response.send(todoList);
    }
  } else if (priority !== undefined) {
    if (priority !== "HIGH" && priority !== "MEDIUM" && priority !== "LOW") {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      const getTodoQuery = `
          SELECT
          id,
          todo,
          priority,
          status,
          category,
          due_date AS dueDate
          FROM todo
          WHERE priority= '${priority}';`;
      const todoList = await db.all(getTodoQuery);
      response.send(todoList);
    }
  } else if (search_q !== undefined) {
    const getTodoQuery = `
      SELECT
      id,
      todo,
      priority,
      status,
      category,
      due_date AS dueDate
      FROM todo
      WHERE todo LIKE '%${search_q}%';`;
    const todoList = await db.all(getTodoQuery);
    response.send(todoList);
  } else if (category !== undefined) {
    if (category !== "WORK" && category !== "HOME" && category !== "LEARNING") {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      const getTodoQuery = `
      SELECT
      id,
      todo,
      priority,
      status,
      category,
      due_date AS dueDate
      FROM todo
      WHERE category= '${category}';`;
      const todoList = await db.all(getTodoQuery);
      response.send(todoList);
    }
  }
});

//Get Specific Todo With Given Id API

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
    id,
    todo,
    priority,
    status,
    category,
    due_date AS dueDate
    FROM todo WHERE id=${todoId};`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

//Get Todo With Specific Date

app.get("/agenda/", async (request, response) => {
  let { date } = request.query;

  let dateArray = date.split("-");

  const year = parseInt(dateArray[0]);
  const month = parseInt(dateArray[1]) - 1;
  const day = parseInt(dateArray[2]);

  const checkDate = parse(date, "yyyy-MM-dd", new Date());
  const result = isValid(checkDate);

  if (isValid(checkDate) === true) {
    const formattedDate = format(new Date(year, month, day), "yyyy-MM-dd");
    const getTodoQuery = `
      SELECT
      id,
      todo,
      priority,
      status,
      category,
      due_date AS dueDate
      FROM todo
      WHERE due_date= '${formattedDate}';`;
    const todoList = await db.all(getTodoQuery);
    response.send(todoList);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//Creating A Todo API

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  let date = dueDate.split("-");
  let year = date[0];
  let month = date[1] - 1;
  let day = date[2];
  const checkDate = parse(dueDate, "yyyy-MM-dd", new Date());

  if (priority !== "HIGH" && priority !== "MEDIUM" && priority !== "LOW") {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (
    status !== "TO DO" &&
    status !== "IN PROGRESS" &&
    status !== "DONE"
  ) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (
    category !== "WORK" &&
    category !== "HOME" &&
    category !== "LEARNING"
  ) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (isValid(checkDate) === false) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    const formattedDate = format(new Date(year, month, day), "yyyy-MM-dd");
    const insertTodoQuery = `
      INSERT INTO todo (id,todo,priority,status,category,due_date)
      VALUES(${id},'${todo}','${priority}','${status}','${category}','${formattedDate}');`;
    await db.run(insertTodoQuery);
    response.send("Todo Successfully Added");
  }
});

//Update Details Of Specific Todo API

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const { status, priority, todo, category, dueDate } = request.body;
  if (status !== undefined) {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      updateTodoQuery = `
        UPDATE todo
        SET status='${status}'
        WHERE id= ${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Status Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (priority !== undefined) {
    if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
      updateTodoQuery = `
          UPDATE todo
          SET priority='${priority}'
          WHERE id= ${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Priority Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (todo !== undefined) {
    updateTodoQuery = `
        UPDATE todo
        SET todo='${todo}'
        WHERE id= ${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Todo Updated");
  } else if (category !== undefined) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      updateTodoQuery = `
        UPDATE todo
        SET category='${category}'
        WHERE id= ${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Category Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (dueDate !== undefined) {
    let date = dueDate.split("-");
    const year = parseInt(date[0]);
    const month = parseInt(date[1]) - 1;
    const day = parseInt(date[2]);

    const checkDate = parse(dueDate, "yyyy-MM-dd", new Date());

    if (isValid(checkDate) === true) {
      const formattedDate = format(new Date(year, month, day), "yyyy-MM-dd");
      updateTodoQuery = `
         UPDATE todo
         SET due_date= '${formattedDate}'
         WHERE id= ${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Due Date Updated");
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});

//Delete A Todo API

app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id= ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
