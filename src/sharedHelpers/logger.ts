// Workaround for module.system.node.root_relative_dirname=./src
// in .flowconfig and babel-plugin-module-resolver. If you have a better
// solution, please do it!
import { log, logFileDirectory, logWithoutRemote } from "../../react-native-logs.config";

export { log, logFileDirectory, logWithoutRemote };
