const express = require("express");
const cors = require("cors");

const { v4: uuid } = require("uuid");
const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "Username not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  // Complete aqui
  const { name, username } = request.body;

  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const newUser = {
    id: uuid(),
    name,
    username,
    todos: [],
  };
  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const todoAlreadyExists = user.todos.find((todo) => todo.id === id);

  if (!todoAlreadyExists) {
    return response.status(404).json({ error: "Todo not found" });
  }

  const indexTodo = user.todos.indexOf(todoAlreadyExists);

  user.todos[indexTodo] = {
    ...todoAlreadyExists,
    title,
    deadline: new Date(deadline),
  };

  return response.status(201).json({
    ...todoAlreadyExists,
    title,
    deadline: new Date(deadline),
  });
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const selectedTodo = user.todos.find((todo) => todo.id === id);

  if (!selectedTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  const indexTodo = user.todos.indexOf(selectedTodo);

  user.todos[indexTodo] = {
    ...selectedTodo,
    done: true,
  };

  return response.json({
    ...selectedTodo,
    done: true,
  });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoExists = user.todos.find((todo) => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos.splice(todoExists, 1);

  return response.status(204).send();
});

module.exports = app;
