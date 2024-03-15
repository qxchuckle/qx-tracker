const express = require('express');
const app = express();

app.post('/tracker', express.text(), function (req, res) {
  console.log(JSON.parse(req.body));
  res.send('ok');
});

app.listen(9000, () => {
  console.log('listening on')
})

