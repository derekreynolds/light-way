import app from "./app";

import * as minimist from 'minimist';
import * as config from 'config';
import * as l from "@derekreynolds/logger";

var args = minimist(process.argv.slice(2), {
  string: [ 'port'],
  default: { port: 4000 }
});

const PORT = args['port'];

app.listen(PORT, () => {
    l.info('LightWay microservice listening on port ' + PORT);
});