import {
  createSignal,
  type Component,
  Show,
  For,
  createMemo,
  onCleanup,
} from "solid-js";
import { createStore } from "solid-js/store";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

type Mode = "all" | "completed" | "active";
let counter = 0;

const App: Component = () => {
  const [todos, setTodos] = createStore<Todo[]>([]);
  const [showMode, setShowMode] = createSignal<Mode>("all");
  const remainingCount = createMemo(
    () => todos.length - todos.filter((todo) => todo.completed).length,
  );

  const addTodo = (
    event: KeyboardEvent & {
      currentTarget: Element;
      target: Element;
    },
  ) => {
    const title = event.target.value?.trim();
    console.log({ code: event.code, title });
    if (event.code === "Enter" && title) {
      setTodos((todos) => [
        ...todos,
        { id: counter++, title, completed: false },
      ]);
      event.target.value = "";
    }
  };

  const toggleTodo = (todoId: number) => {
    setTodos(
      (todo) => todo.id == todoId,
      "completed",
      (completed) => !completed,
    );
  };

  const remove = (todoId: number) => {
    setTodos((todos) => todos.filter((todo) => todo.id !== todoId));
  };

  const toggleAll = (
    event: InputEvent & {
      currentTarget: HTMLInputElement;
      target: HTMLInputElement;
    },
  ) => {
    const completed = event.target.checked;
    setTodos((todos) => todos.map((todo) => ({ ...todo, completed })));
  };

  const filterTodos = (todos: Todo[]) => {
    if (showMode() === "active") {
      return todos.filter((todo) => !todo.completed);
    } else if (showMode() === "completed") {
      return todos.filter((todo) => todo.completed);
    }

    return todos;
  };

  const clearCompleted = () => {
    setTodos((todos) => todos.filter((todo) => !todo.completed));
  };

  const locationHandler = () => {
    const urlMode = location.hash.slice(2) as Mode | undefined;
    setShowMode(urlMode || "all");
  };

  window.addEventListener("hashchange", locationHandler);

  onCleanup(() => {
    window.removeEventListener("hashchange", locationHandler);
  });

  return (
    <section class="todoapp">
      <header class="header">
        <h1>Todos</h1>
        <input
          class="new-todo"
          onKeyDown={addTodo}
          placeholder="What needs to be done?"
        />
      </header>

      <Show when={todos.length > 0}>
        <section class="main">
          <input
            id="toggle-all"
            class="toggle-all"
            type="checkbox"
            checked={!remainingCount()}
            onInput={toggleAll}
          />
          <label for="toggle-all" />
          <ul class="todo-list">
            <For each={filterTodos(todos)}>
              {(todo) => {
                console.log("creating", todo.title);
                return (
                  <li class="todo" classList={{ completed: todo.completed }}>
                    <div class="view">
                      <input
                        type="checkbox"
                        class="toggle"
                        checked={todo.completed}
                        onInput={() => toggleTodo(todo.id)}
                      />
                      <label>{todo.title}</label>
                      <button class="destroy" onClick={() => remove(todo.id)} />
                    </div>
                  </li>
                );
              }}
            </For>
          </ul>
        </section>
        <footer class="footer">
          <span class="todo-count">
            <strong>{remainingCount()}</strong>
            {remainingCount() === 1 ? " item " : " items "} left
          </span>
          <ul class="filters">
            <li>
              <a href="#/" classList={{ selected: showMode() === "all" }}>
                All
              </a>
            </li>
            <li>
              <a
                href="#/active"
                classList={{ selected: showMode() === "active" }}
              >
                Active
              </a>
            </li>
            <li>
              <a
                href="#/completed"
                classList={{ selected: showMode() === "completed" }}
              >
                Completed
              </a>
            </li>
          </ul>
          <Show when={remainingCount() !== todos.length}>
            <button class="clear-completed" onClick={clearCompleted}>
              Clear Completed
            </button>
          </Show>
        </footer>
      </Show>
    </section>
  );
};

export default App;
