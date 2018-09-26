const { mysql, redis } = require('./db');

mysql.master('select ?', [1]).then(console.log);

redis.get('default', { key: 'test' }).then(console.log);

redis.set('default', { key: 'test', value: 'text data', expiry: 3600 });

redis.del('default', 'test');
