const core = require('@actions/core');
const main = require('./action')

if (core.getState("isPost")) {
  main()
} else {
  core.saveState("isPost", '1');
}
