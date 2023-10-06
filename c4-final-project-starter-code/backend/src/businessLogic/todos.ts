import { TodosAccess } from '../dataLayer/todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const todosAcess = new TodosAccess();

// write create todo function

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    return todosAcess.getAllTodos(userId)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {
    const todoId = uuid.v4()

    return todosAcess.createTodoItem({
        todoId: todoId,
        userId: userId,
        name: createTodoRequest.name,
        done: false,
        dueDate: createTodoRequest.dueDate,
        createdAt: new Date().toISOString()
    })
}

export async function getTodoItem(todoId: string, userId: string): Promise<TodoItem> {
    return await todosAcess.getTodoItem(todoId, userId)
}

export async function setItemUrl(todoId: string, itemUrl: string, userId: string): Promise<void> {
    console.log("Setting Item URL")
    console.log(itemUrl)
    console.log(todoId)
    const todoItem = await todosAcess.getTodoItem(todoId, userId)

    todosAcess.setItemUrl(todoItem.todoId, todoItem.userId, itemUrl);
}

export async function updateTodo(
    todoId: string,
    updateTodoRequest: UpdateTodoRequest,
    userId: string
): Promise<void> {
    console.log("Updating Item")
    console.log(updateTodoRequest)
    console.log(todoId)

    const todoItem = await todosAcess.getTodoItem(todoId, userId)

    // Using todoId here to make sure it's actually the users todoItem
    await todosAcess.updateTodoItem(todoItem.todoId, todoItem.createdAt, {
        name: updateTodoRequest.name,
        done: updateTodoRequest.done,
        dueDate: updateTodoRequest.dueDate,
    })
}

export async function deleteTodo(
    itemId: string,
    userId: string
): Promise<void> {

    const todoItem = await todosAcess.getTodoItem(itemId, userId)
    await todosAcess.deleteTodo(todoItem.todoId, todoItem.userId)
}


