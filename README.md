# Import From Google Tasks To Taskwarrior

🚨 Danger Zone: This software is battle tested. We here at Import Google
Tasks To Taskwarrior do hope it saves you some time and frustration, but please
don't blindly run it against your production database (of tasks). It has been
used successfully on macOS 10.13.5 (17F77) with `node` v10.4.0 and `task` 2.5.1.

## What It Does

Reads a JSON export from [Google Takeout] of [Google Tasks] and runs
[Taskwarrior] shell commands (`task`) on your system to import the tasks.

- Each "list" from Google Tasks is added verbatim as the `project:` for the task
  in the Taskwarrior command.
  
  **Protip:** If your task lists in Google Tasks contain Emojis and such, best
  sanitize those out of your JSON payload first.
- If a task contains notes (the text box below with extra details), they are
  added as a single [annotation][Taskwarrior Annotations]
- Subtasks for a Google Task are added as [dependencies][Taskwarrior
  Dependencies] of their parent task using `depends:`.
- All imported tasks are assigned a Taskwarrior tag "googleTasks"
  (`+googleTasks`) to keep track of what was imported.
  
  **Protip:** If you want to further [modify tasks][Taskwarrior Modify] after
  importing, run `task +googleTasks modify [[YOUR MODS]]` to do them all at
  once.
- Completed tasks from the Google export are still added, using the `task log`
  command to mark them as done on arrival.

## What It Might Do Later

- [ ] Support due dates
- [ ] Handle adding indented tasks from Google as blocking tasks in Taskwarrior
- [ ] Deal with tasks that are linked to Gmail messages
- [ ] Have an option to pull directly from the Google Tasks API

## Usage

    npm install -g google-tasks-taskwarrior-import
    google-tasks-taskwarrior-import ~/path/to/Tasks.json

## Troubleshooting

There isn't much error handling, due to budget concerns for the current fiscal.
If an import exits with errors, you can likely run `task +googleTasks delete` to
destroy all imported tasks and try again after debugging.

## Resources

[Google Takeout]: https://takeout.google.com/
[Google Tasks]: https://gsuite.google.com/learning-center/products/apps/keep-track-of-tasks/
[Taskwarrior]: https://taskwarrior.org/
[Taskwarrior Annotations]: https://taskwarrior.org/docs/terminology.html#annotation
[Taskwarrior Dependencies]: https://randomgeekery.org/2018/02/19/setting-task-dependencies-in-taskwarrior/
[Taskwarrior Modify]: https://taskwarrior.org/docs/commands/modify.html
