// Workaround for module.system.node.root_relative_dirname=./src
// in .flowconfig and babel-plugin-module-resolver. If you have a better
// solution, please do it!
import { legacyLogfilePath, log, logWithoutRemote } from "../../react-native-logs.config";

export { legacyLogfilePath, log, logWithoutRemote };
