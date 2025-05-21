chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create("checkTasks", { periodInMinutes: 60 }); // cada hora
  });
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "checkTasks") {
      chrome.storage.local.get("tasks", (data) => {
        const tasks = data.tasks || [];
        const todayStr = new Date().toISOString().slice(0, 10);
        tasks.forEach((task) => {
          if (task.deadline === todayStr) {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "icon.png",
              title: "Recordatori de tasca!",
              message: `Avui acaba la tasca: "${task.text}"`,
              priority: 2,
            });
          }
        });
      });
    }
  });
  