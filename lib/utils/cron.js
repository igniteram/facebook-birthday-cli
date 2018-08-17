const cron = require('node-cron');

const task = cron.schedule("* * * * *", function() {
    console.log("running a task every minute");
  });

  task.destroy();