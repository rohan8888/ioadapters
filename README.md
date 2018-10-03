# ioadapters

[![Greenkeeper badge](https://badges.greenkeeper.io/rohan8888/ioadapters.svg)](https://greenkeeper.io/)

Adapters for various data stores

### Usage

```
const { mysql, redis } = require('db');

const query = 'select * from emp where id = ?';
const values = [8];

let result1 = await mysql.master(query, [values]);

let result2 = await redis.get('default', { key: 'test', zipped: true });

redis.set('default', { key: 'test', value: 'text data', zipped: true, expiry: 60 });

redis.del('default', 'test');

```