import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)


// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME
    ) { }

    async getAllTodos(userID: string): Promise<TodoItem[]> {
        const result = await this.docClient
            .query({
                TableName: this.todosTable,
                IndexName: this.todosIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userID
                }
            })
            .promise()
        const items = result.Items
        return items as TodoItem[]
    }

    async getTodoItem(todoId: string, userId: string): Promise<TodoItem> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId and todoId = :todoId',
            ExpressionAttributeValues: {
                ':userId' : userId,
                ':todoId' : todoId
            }
        }).promise()

        const item = result.Items[0]
        return item as TodoItem
    }

    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        await this.docClient
            .put({
                TableName: this.todosTable,
                Item: todoItem
            })
            .promise()

        return todoItem as TodoItem
    }

    async updateTodoItem(
        todoId: string,
        userID: string,
        TodoUpdate: TodoUpdate
    ): Promise<void> {
        var result = {
            TableName: this.todosTable,
            Key: {
                "todoId": todoId,
                "userId": userID
            },
            UpdateExpression:
                'set #n = :name, done = :done, dueDate = :dueDate',
            ExpressionAttributeValues: {
                ':name': TodoUpdate.name,
                ':done': TodoUpdate.done,
                ':dueDate': TodoUpdate.dueDate,
            },
            ExpressionAttributeNames: {
                '#n': 'name'
            },
            ReturnValues: 'UPDATED_NEW'
        };
        this.docClient.update(result).promise()
    }
    async deleteTodo(todoId: string, userId: string): Promise<void> {

        var params = {
            TableName: this.todosTable,
            Key: {
                "todoId": todoId,
                "userId": userId
            },
            ConditionExpression:
                'todoId = :todoId and userId = :userId',
            ExpressionAttributeValues: {
                ':todoId': todoId,
                ':userId': userId
            }
        }

        await this.docClient.delete(params).promise()
    }

    async setItemUrl(todoId: string, userId: string, itemUrl: string): Promise<void> {
        var params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': itemUrl
            },
            ReturnValues: 'UPDATED_NEW'
        }

        await this.docClient.update(params).promise();
    }
}

// function createDynamoDBClient() {
//     if (process.env.IS_OFFLINE) {
//       console.log('Creating a local DynamoDB instance')
//       return new XAWS.DynamoDB.DocumentClient({
//         region: 'localhost',
//         endpoint: 'http://localhost:8005'
//       })
//     }
  
//     return new XAWS.DynamoDB.DocumentClient()
// }