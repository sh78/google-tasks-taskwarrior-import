#!/usr/bin/env node

const fs = require('fs')
const execSync = require('child_process').execSync

const args = process.argv
const googleTasks = JSON.parse(fs.readFileSync(args[2], 'utf8'))

/**
 * Run a shell command synchronously
 *
 * @param {string} command - shell command to run
 * @returns {string} - stdio/err
 */
function runCommand (command) {
  return execSync(command).toString()
}

/**
 * Flatten Google Tasks export object into an object with the
 * task list name as the key for an array of task objects.
 * @returns {object}
 */
function flattenTaskLists (input) {
  let taskListsArray = []
  input.items.forEach((list, index) => {
    taskListsArray.push(list)
  })

  const tasksFlattened = {}
  taskListsArray.forEach(function (list) {
    tasksFlattened[list.title] = list.items
  })

  return tasksFlattened
}

/**
 * Make a `task add` command as a string.
 * @param {object} task - object with values for passing to `task`
 * @returns {string}
 */
function makeTaskAdd (task) {
  let taskCommand
  let taskAction
  if (task.status === 'needsAction') {
    taskAction = 'add'
  } else if (task.status === 'completed') {
    taskAction = 'log'
  }
  taskCommand = `task ${taskAction} "${task.title}" project:"${task.project}"`
  let tags = task.tags || []
  tags.forEach(function (tag) {
    taskCommand += ` +"${tag}"`
  })
  if (task.depends) taskCommand += ` depends:${task.depends}`
  console.log(`Running command: ${taskCommand}`)
  return runCommand(taskCommand)
}

/**
 * Add annotation to a task already in taskwarrior
 *
 * @param {string|interger} taskID
 * @param {string} annotation
 * @returns {undefined}
 */
function annotateTask (taskID, annotation) {
  if (taskID) {
    let taskCommand = `task ${taskID} annotate "${annotation}"`
    return runCommand(taskCommand)
  }
}

/**
 * extractTaskID
 *
 * @param {string} output - output of a `task add` command
 * @returns {string} - ID of the task referenced in @output
 */
function extractTaskID (output) {
  if (output) {
    let re = /(Created task )([0-9]*)/
    let match = output.match(re)
    let taskshID
    if (match && match.length > 2) {
      taskshID = match[match.length - 1]
    }
    return taskshID || null
  } else {
    return null
  }
}

/**
 * Loop through lists and make tasks
 */
const lists = flattenTaskLists(googleTasks)
for (let list in lists) {
  if (
    lists.hasOwnProperty(list) &&
    typeof lists[list] === 'undefined'
  ) {
    console.log(`Skipping empty list "${list}"\n`)
  } else {
    const listName = list
    const tasks = lists[list]
    console.log('Processing "' + listName + '" (' + tasks.length + ' tasks)...')

    tasks.forEach(function (task) {
      const uuid = task.id
      let subtasks = []
      tasks.find(obj => {
        if (obj.parent === uuid) subtasks.push(obj)
      })

      let subtaskIDs = []
      if (subtasks.length) {
        subtasks.forEach(subtask => {
          const taskAddCommand = makeTaskAdd({
            title: subtask.title,
            status: subtask.status,
            project: list,
            tags: ['googleTasks']
          })

          let taskID = extractTaskID(taskAddCommand)
          if (subtask.notes && taskID) {
            const taskAnnotateCommand = annotateTask(taskID, subtask.notes)
            console.log(taskAnnotateCommand)
          }

          if (taskID) subtaskIDs.push(taskID)
        })
      }

      if (!task.parent) {
        const taskAddCommand = makeTaskAdd({
          title: task.title,
          status: task.status,
          project: list,
          tags: ['googleTasks'],
          depends: subtaskIDs
        })
        console.log(taskAddCommand)
        let taskID = extractTaskID(taskAddCommand)

        if (task.notes) {
          const taskAnnotateCommand = annotateTask(taskID, task.notes)
          console.log(taskAnnotateCommand)
        }
      }
    })
  }
}

/**
 * Debug code
 */
// const outFile = 'debug.json'
// const tasksOutputString = JSON.stringify(lists, null, 4)
// fs.writeFile(outFile, tasksOutputString, function (err) {
//   if (err) {
//     return console.log(err)
//   }
// })
