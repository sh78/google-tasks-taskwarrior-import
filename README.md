# Import Google Tasks To Taskwarrior

🚨 Danger Zone: This software is battle tested. We here at Import Google
Tasks To Taskwarrior do hope it saves you some time and frustration, but please
don't blindly run it against your production database (of tasks).

## What It Does

Reads a JSON export from [Google Takeout](https://takeout.google.com/) of
[Google Tasks](https://gsuite.google.com/learning-center/products/apps/keep-track-of-tasks/)
data and outputs a list of [Taskwarrior](https://taskwarrior.org/)
commands that can be run to import the tasks (the `task` cli command).

Each "list" from Google Tasks is added as the `project:` for the task in the
Taskwarrior command.

**Protip:** If your task lists in Google Tasks contain Emojis and such, best
sanitize those out of your JSON payload first.

## What It Might Do Later

- [ ] Actually run the `task add` command and do the magic
- [ ] Annotate each added task with a representation of a task's original JSON
- [ ] Support due dates
- [ ] Handle adding indented tasks from Google as blocking tasks in Taskwarrior
    https://randomgeekery.org/2018/02/19/setting-task-dependencies-in-taskwarrior/
- [ ] Deal with tasks that are linked to Gmail messages

## Usage

    node index.js sample_date/Tasks.json
