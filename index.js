const fs = require('fs')
const { exec } = require('child_process')

const args = process.argv
const googleTasks = JSON.parse(fs.readFileSync(args[2], 'utf8'))

function runCommand (command) {
  let output = ''
  exec(command, (err, stdout, stderr) => {
    if (err) {
      throw err
    }
    console.log(`STDOUT: ${stdout}`)
    output += stdout
  })
  return output
}

/**
 * Flatten Google Tasks export object into an object with the
 * task list name as the key for an array of task objects.
 * @returns {Object}
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
 * @param {string} task
 * @param {string} project
 * @param {Array} tags
 * @returns {string}
 */
function makeTaskAdd (taskTitle, taskStatus, project, tags) {
  let taskCommand
  let taskAction
  if (taskStatus === 'needsAction') {
    taskAction = 'add'
  } else if (taskStatus === 'complete') {
    taskAction = 'log'
  }
  taskCommand = `task ${taskAction} "${taskTitle}" project:"${project}"`
  tags = tags || []
  tags.forEach(function (tag) {
    taskCommand += ` +"${tag}"`
  })
  return taskCommand
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
    console.log(`Skipping empty list ${list}`)
  } else {
    const listName = list
    const tasks = lists[list]
    console.log(listName, tasks.length)

    tasks.forEach(function (task) {
      const taskAddCommand = makeTaskAdd(
        task.title,
        task.status,
        list,
        ['googleTasks']
      )
      console.log(taskAddCommand)

      // TODO: run the task command and save the output
      // const taskshOutput = runCommand('echo "Created task 277."')

      // TODO: catch task id from stdout and use it to annotate
      // with a dump of the original object data
      // re = /(?<=Created\ task\ )[0-9]*/
      // const taskshID = taskshOutput.match(re)[0]
      // console.log(taskshID)
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
