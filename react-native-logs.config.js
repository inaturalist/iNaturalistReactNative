import {
  consoleTransport,
  logger
} from "react-native-logs";

const config = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  },
  transport: consoleTransport,
  transportOptions: {
    colors: {
      info: "blueBright",
      warn: "yellowBright",
      error: "redBright"
    },
    extensionColors: {
      // can use this to create different log colors for different workflows
      user: "blue"
    }
  }
};

const log = logger.createLogger( config );

export default log;
