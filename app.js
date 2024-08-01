const express = require('express')

const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const format = require('date-fns/format')

const isMatch = require('date-fns/isMatch')
const isValid = require('date-fns/isValid')
const app = express()
app.use(express.json())

let database

const initializeDbandServer = async () => {
  try {
    database = await open({
      filename: path.join(__dirname, 'todoApplication.db'),
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server  is running  on https://localhost:3000/')
    })
  } catch (error) {
    console.log(`Database error is ${error.message}`)
    process.exit(1)
  }
}
initializeDbandServer()
const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}
const hasCategoryandStatus = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  )
}

const hasCategoryandPriority = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  )
}
const hasSearchPropery = requestQuery => {
  return requestQuery.search_q !== undefined
}

const hasCategoryPropery = requestQuery => {
  return requestQuery.category !== undefined
}

const outPutResult = dbObject => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.dueDate,
  }
}

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = ' ', priority, status, category} = request.query
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          getTodosQuery = ` select * from todo where status ='${status}' and priority='${priority}';`
          data = await database.all(getTodosQuery)
          response.send(data.map(eachItem => outPutResult(eachItem)))
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case hasCategoryandStatus(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'Learning'
      ) {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          getTodosQuery = ` select * from todo where category='${category}' and status='${status}';`
          data = await database.all(getTodosQuery)
          response.send(data.map(eachItem => outPutResult(eachItem)))
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break

    case hasCategoryandPriority(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'Learning'
      ) {
        if (
          priority === 'HIGH' ||
          priority === 'MEDIUM' ||
          priority === 'LOW'
        ) {
          getTodosQuery = ` select * from todo where category='${category}' and priority='${priority}';`
          data = await database.all(getTodosQuery)
          response.send(data.map(eachItem => outPutResult(eachItem)))
        } else {
          response.status(400)
          response.send('Invalid Todo priority')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasPriorityProperty(request.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        getTodosQuery = ` select * from todo where priority='${priority}';`
        data = await database.all(getTodosQuery)
        response.send(data.map(eachItem => outPutResult(eachItem)))
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }

      break
    case hasStatusProperty(request.query):
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        getTodosQuery = ` select * from todo where  status='${status}';`
        data = await database.all(getTodosQuery)
        response.send(data.map(eachItem => outPutResult(eachItem)))
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case hasSearchPropery(request.query):
      getTodosQuery = `select * from todo where todo like '%${search_q}%';`
      data = await database.all(getTodosQuery)
      response.send(data.map(eachItem => outPutResult(eachItem)))
      break
    case hasCategoryPropery(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'Learning'
      ) {
        getTodosQuery = ` select * from todo where category='${category}';`
        data = await database.all(getTodosQuery)
        response.send(data.map(eachItem => outPutResult(eachItem)))
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    default:
      getTodosQuery = `select * from todo;`
      data = await database.all(getTodosQuery)
      response.send(data.map(eachItem => outPutResult(eachItem)))
  }
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodosQuery = `select * from todo where id=${todoId};`
  const responseResult = await database.get(getTodosQuery)
  response.send(outPutResult(responseResult))
})

app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  console.log(isMatch(date, 'yyyy-MM-dd'))
  if (isMatch(date, 'yyyy-MM-dd')) {
    const newDate = format(new Date(date), 'yyyy-MM-dd')
    console.log(newDate)
    const requestQuery = `select * from todo where due_date='${newDate}';`
    const responseResult = await database.all(requestQuery)
    response.send(responseResult.map(eachItem => outPutResult(eachItem)))
  } else {
    response.status(400)
    response.send('Invalid Due Date')
  }
})

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'Learning'
      ) {
        if (isMatch(dueDate, 'yyyy-MM-dd')) {
          const postNewDueDate = format(new Date(dueDate), 'yyyy-MM-dd')
          const postTodoQuery = `insert into todo(id,todo,category,priority,status,due_date) values(${id},'${todo}','${category}','${priority}','${status}','${postNewDueDate}')
        ;`
          await database.run(postTodoQuery)
          response.send('Todo Successfully Added')
        } else {
          response.status(400)
          response.send('Invalid Due Date')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
    } else {
      response.send(400)
      response.send('Invalid Todo Status')
    }
  } else {
    response.send(400)
    response.send('Invalid Todo Priority')
  }
})

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let updateColumn = ''
  const requestBody = request.body
  console.log(requestBody)
  const previousTodoQuery = ` select * from todo where id=${todoId};`
  const previousTodo = await database.get(previousTodoQuery)
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body
  let updateTodoQuery = ''
  switch (true) {
    case requestBody.status !== undefined:
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        updateTodoQuery = `
  update todo set todo='${todo}',priority='${priority}',status='${status}',category='${category}',dueDate='${dueDate}' where id='${todoId}';`
        await database.run(updateTodoQuery)
        response.sendStatus('Status Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case requestBody.priority !== undefined:
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        updateTodoQuery = `
  update todo set todo='${todo}',priority='${priority}',status='${status}',category='${category}',dueDate='${dueDate}' where id='${todoId}';`
        await database.run(updateTodoQuery)
        response.send('Priority Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case requestBody.todo !== undefined:
      updateTodoQuery = `
  update todo set todo='${todo}',priority='${priority}',status='${status}',category='${category}',dueDate='${dueDate}' where id='${todoId}';`
      await database.run(updateTodoQuery)
      response.send('Todo Updated')
      break
    case requestBody.category !== undefined:
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        updateTodoQuery = `
  update todo set todo='${todo}',priority='${priority}',status='${status}',category='${category}',dueDate='${dueDate}' where id='${todoId}';`
        await database.run(updateTodoQuery)
        response.send('Category Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case requestBody.dueDate !== undefined:
      if (isMatch(date, 'yyyy-MM-dd')) {
        const newDueDate = format(new Date(date), 'yyyy-MM-dd')
        updateTodoQuery = `
  update todo set todo='${todo}',priority='${priority}',status='${status}',category='${category}',dueDate='${newDueDate}' where id='${todoId}';`
        await database.run(updateTodoQuery)
        response.send('Due Date Updated')
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
      break
  }
})
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `delete from todo where id=${todoId};
  `
  await database.run(deleteTodoQuery)
  response.send('Todo Deleted')
})
module.exports = app
