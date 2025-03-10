import { Alarm, Extension, Readme, Service } from "talkops";
import prettyMilliseconds from "pretty-ms";
import yaml from "js-yaml";

const extension = new Extension("Timer");
extension.setDockerRepository("bierdok/talkops-extension-timer");
extension.enableDockerVolumeData();

extension.setDescription(`
This Extension allows to manage timers **by voice in real-time**.

## Features
* Create a timer
* Check timer states
* Cancel a timer
`);

const baseInstructions = `
You can manage multiple timers.
It is possible to add another timer for the same duration.
`;

import timersModel from "./schemas/models/timers.json" with { type: "json" };

extension.setInstructions(() => {
  const instructions = [baseInstructions];
  instructions.push("``` yaml");
  instructions.push(yaml.dump({ timersModel }));
  instructions.push("```");
  return instructions;
});

import create_timer from "./schemas/functions/create_timer.json" with { type: "json" };
import get_timers from "./schemas/functions/get_timers.json" with { type: "json" };
import cancel_timer from "./schemas/functions/cancel_timer.json" with { type: "json" };

extension.setFunctionSchemas([create_timer, get_timers, cancel_timer]);

import { addTimer, removeTimer, getTimers } from "./db.js";

function getClientTimers(clientId) {
  return getTimers().filter((timer) => timer.clientId === clientId);
}

function getNextClientTimerNumber(clientId) {
  let number = 1;
  for (const timer of getClientTimers(clientId)) {
    if (timer.number < number) continue;
    number = timer.number + 1;
  }
  return number;
}

extension.setFunctions([
  function create_timer(duration, clientId) {
    duration = duration * 1000;
    const number = getNextClientTimerNumber(clientId);
    const createdAt = new Date().getTime();
    const completeAt = createdAt + duration;
    addTimer({ number, createdAt, completeAt, duration, clientId });
    return "Done.";
  },
  function get_timers(clientId) {
    return yaml.dump(
      getClientTimers(clientId).map((timer) => {
        return {
          number: timer.number,
          duration: prettyMilliseconds(timer.duration, {
            verbose: true,
          }),
          timeleft: prettyMilliseconds(
            timer.completeAt - new Date().getTime(),
            {
              verbose: true,
              separateMilliseconds: true,
            }
          ),
        };
      })
    );
  },
  function cancel_timer(number, clientId) {
    for (const timer of getClientTimers(clientId)) {
      if (timer.number !== number) continue;
      removeTimer(timer);
      return "Done.";
    }
    return "Not found.";
  },
]);

setInterval(() => {
  const now = new Date().getTime();
  for (const timer of getTimers()) {
    if (timer.completeAt > now) continue;
    removeTimer(timer);
    service.send(new Alarm().setFrom(extension.name).addTo(timer.clientId));
  }
}, 1000);

new Readme(process.env.README_TEMPLATE_URL, "/app/README.md", extension);
const service = new Service(process.env.AGENT_URLS.split(","), extension);
