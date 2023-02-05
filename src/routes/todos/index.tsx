import { component$ } from "@builder.io/qwik";
import { action$, DocumentHead, loader$, z, zod$ } from "@builder.io/qwik-city";
import { getProtectedRequestContext } from "~/server/context";
import {
  createTodo,
  deleteTodo,
  findTodos,
  toggleTodo,
  updateTodo,
} from "~/server/todos";
import { paths } from "~/utils/paths";
import { CreateInput } from "./CreateItem/CreateItem";
import { TodoList } from "./TodoList/TodoList";

export const todosLoader = loader$((event) => {
  const result = z
    .object({
      filter: z.union([z.literal("active"), z.literal("complete")]).optional(),
    })
    .safeParse(event.query);

  if (!result.success) {
    event.redirect(302, paths.todos);
    return;
  }

  const ctx = getProtectedRequestContext(event);
  return findTodos({ ctx, filter: result.data.filter });
});

export const createTodoAction = action$(
  async (data, event) => {
    const ctx = getProtectedRequestContext(event);

    await createTodo({ ctx, ...data });
  },
  zod$({
    title: z.string(),
  })
);

export const toggleTodoAction = action$(
  async (data, event) => {
    const ctx = getProtectedRequestContext(event);

    await toggleTodo({ ctx, ...data });
  },
  zod$({
    complete: z.boolean(),
    id: z.string(),
  })
);

export const updateTodoAction = action$(
  async (data, event) => {
    const ctx = getProtectedRequestContext(event);

    await updateTodo({ ctx, ...data });
  },
  zod$({
    id: z.string(),
    title: z.string(),
  })
);

export const deleteTodoAction = action$(
  async (data, event) => {
    const ctx = getProtectedRequestContext(event);

    await deleteTodo({ ctx, ...data });
  },
  zod$({
    id: z.string(),
  })
);

export default component$(() => {
  return (
    <div>
      <CreateInput />
      <TodoList />
    </div>
  );
});

export const head: DocumentHead = {
  title: "TODOS - Qwik TODO MVC",
};
