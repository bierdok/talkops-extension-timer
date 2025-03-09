import { Alarm, Extension, Readme, Service } from "talkops";

const extension = new Extension("Timer");

extension.setDockerRepository("bierdok/talkops-timer");

extension.setDescription(`
This Extension allows to manage timers **by voice in real-time**.

## Features
* Create a timer
* Check timer states
* Cancel a timer
`);

extension.setInstructions(`
You can manage timers.
`);

extension.setFunctionSchemas([
  {
    name: "create_timer",
    description: "Create a timer",
    parameters: {
      type: "object",
      properties: {
        duration: {
          type: "integer",
          description: "The duration in milliseconds",
        },
      },
      required: ["duration"],
    },
  },
]);

extension.setFunctions([
  function create_timer(duration, clientId) {
    setTimeout(() => {
      service.send(
        new Alarm().setFrom(extension.name).addTo(clientId)
      );
    }, duration);
    return "Done.";
  },
]);

new Readme(process.env.README_TEMPLATE_URL, "/app/README.md", extension);
const service = new Service(process.env.AGENT_URLS.split(","), extension);
