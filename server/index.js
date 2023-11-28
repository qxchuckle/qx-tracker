const express = require('express');
const app = express();

app.use(express.urlencoded({
  extended: false,
}));

app.post('/tracker', function (req, res) {
  console.log(req.body);
  console.log(JSON.parse(Object.keys(req.body)[0]));
  res.send('ok');
});

app.listen(9000, () => {
  console.log('listening on')
})