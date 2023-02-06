import { component$, useSignal, useStylesScoped$ } from "@builder.io/qwik";
import { action$, DocumentHead, loader$, z, zod$ } from "@builder.io/qwik-city";
import { getProtectedRequestContext } from "~/server/context";
import {
  completeAllTodos,
  countTodos,
  createTodo,
  deleteCompletedTodos,
  deleteTodo,
  findTodos,
  toggleTodo,
  updateTodo,
} from "~/server/todos";
import { paths } from "~/utils/paths";
import { CheckAll } from "./CheckAll/CheckAll";
import { CreateItem } from "./CreateItem/CreateItem";
import { Filters } from "./Filters/Filters";
import styles from "./index.css?inline";
import { TodoItem } from "./TodoItem/TodoItem";

export const todosLoader = loader$((event) => {
  const result = z
    .object({
      filter: z.union([
        z.literal("active"),
        z.literal("complete"),
        z.literal("all"),
      ]),
    })
    .safeParse(event.params);

  if (!result.success) {
    event.redirect(302, paths.all);
    return;
  }

  const ctx = getProtectedRequestContext(event);

  return findTodos({ ctx, filter: result.data.filter });
});

export const countsLoader = loader$((event) => {
  const ctx = getProtectedRequestContext(event);

  return countTodos({ ctx });
});

export const createAction = action$(
  async (data, event) => {
    const ctx = getProtectedRequestContext(event);

    await createTodo({ ctx, ...data });
  },
  zod$({
    title: z.string(),
  })
);

export const completeAllAction = action$(
  async (data, event) => {
    const ctx = getProtectedRequestContext(event);

    await completeAllTodos({ ctx, ...data });
  },
  zod$({
    complete: z.coerce.boolean(),
  })
);

export const deleteCompletedAction = action$(async (_data, event) => {
  const ctx = getProtectedRequestContext(event);

  await deleteCompletedTodos({ ctx });
});

export const toggleAction = action$(
  async (data, event) => {
    const ctx = getProtectedRequestContext(event);

    await toggleTodo({ ctx, ...data });
  },
  zod$({
    complete: z.coerce.boolean(),
    id: z.string(),
  })
);

export const updateAction = action$(
  async (data, event) => {
    const ctx = getProtectedRequestContext(event);

    await updateTodo({ ctx, ...data });
  },
  zod$({
    id: z.string(),
    title: z.string().min(1),
  })
);

export const deleteAction = action$(
  async (data, event) => {
    const ctx = getProtectedRequestContext(event);

    await deleteTodo({ ctx, ...data });
  },
  zod$({
    id: z.string(),
  })
);

export default component$(() => {
  useStylesScoped$(styles);

  const todos = todosLoader.use();
  const workaround = useSignal(0);

  const create = createAction.use();
  const completeAll = completeAllAction.use();
  const deleteCompleted = deleteCompletedAction.use();

  return (
    <section class="main">
      <CreateItem action={create} />
      <CheckAll completeAll={completeAll} />
      {/* This hidden button is required for reloading loader somehow */}
      <button
        class="hidden"
        // eslint-disable-next-line qwik/valid-lexical-scope
        onClick$={() => (workaround.value = todos.value?.length || 0)}
      />
      <ul class="todo-list">
        {create.isRunning ? (
          <TodoItem
            completeAll={completeAll}
            deleteCompleted={deleteCompleted}
            isNew
            todo={{
              complete: false,
              id: "new",
              title: create.formData?.get("title") as string,
            }}
          />
        ) : null}
        {todos.value?.map((todo) => (
          <TodoItem
            completeAll={completeAll}
            deleteCompleted={deleteCompleted}
            isNew={false}
            key={todo.id}
            todo={todo}
          />
        ))}
      </ul>
      <Filters deleteCompleted={deleteCompleted} />
    </section>
  );
});

export const head: DocumentHead = {
  title: "TODOS - Qwik TODO MVC",
};
