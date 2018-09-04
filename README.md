# ioadapters
Adapters for various data stores

### Usage

```
const { mysql, redis } = require('db');

let result1 = await mysql.master(query, [values]);

let result2 = await redis.get('default', { key: 'test' });

```