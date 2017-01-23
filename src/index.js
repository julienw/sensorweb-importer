const config = require('./config');

for (const { name, url } of config.get('modules')) {
  const module = require(`./${name}`)({ url });

  const data = module.fetch();
  data.then(data => console.log(name, data));
}
