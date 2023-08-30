import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { decode } from 'jsonwebtoken'

import { JwtPayload } from '../auth/JwtPayload'

// TODO: Implement businessLogic
const logger = createLogger('TodosAcess');
const attachmentUtils = new AttachmentUtils();
const todosAcess = new TodosAccess();

// write create todo function

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken)
    return todosAcess.getAllTodos(userId)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {
    const todoId = uuid.v4()
    const userId = parseUserId(jwtToken)

    return todosAcess.createTodoItem({
        todoId: todoId,
        userId: userId,
        name: createTodoRequest.name,
        done: false,
        dueDate: createTodoRequest.dueDate,
        createdAt: new Date().toISOString()
    })
}

export async function getTodoItem(todoId: string, jwtToken: string): Promise<TodoItem> {
    const userId = parseUserId(jwtToken)
    return await todosAcess.getTodoItem(todoId, userId)
}

export async function setItemUrl(todoId: string, itemUrl: string, jwtToken: string): Promise<void> {
    console.log("Setting Item URL")
    console.log(itemUrl)
    console.log(todoId)
    const userId = parseUserId(jwtToken)
    const todoItem = await todosAcess.getTodoItem(todoId, userId)

    todosAcess.setItemUrl(todoItem.todoId, todoItem.createdAt, itemUrl);
}

export async function updateTodo(
    todoId: string,
    updateTodoRequest: UpdateTodoRequest,
    jwtToken: string
): Promise<void> {
    console.log("Updating Item")
    console.log(updateTodoRequest)
    console.log(todoId)
    const userId = parseUserId(jwtToken)

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
    jwtToken: string
): Promise<void> {

    const userId = parseUserId(jwtToken)
    const todoItem = await todosAcess.getTodoItem(itemId, userId)
    await todosAcess.deleteTodo(todoItem.todoId, todoItem.createdAt)
}

function parseUserId(jwtToken: string): string {
    const decodedJwt = decode(jwtToken) as JwtPayload
    return decodedJwt.sub
}

