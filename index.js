var axios = require('axios');
var express = require('express');
var cors = require('cors');
var que = require('query-string');
const fs = require('fs');
const path = require('path');
const formData = require('./_data');

const app = express();
app.use(cors());
app.use(express.static('public'));
let port = process.env.PORT || 4000;
app.get('/', (req, res) => {
  res.render('index.html');
});
app.get('/download', async (req, res) => {
  try {
    const { nof, day, year, month } = req.query;
    let data_ = formData(req.query);
    let data = que.stringify(data_);
    var config = {
      method: 'post',
      url: 'https://ccmc.gsfc.nasa.gov/cgi-bin/modelweb/models/vitmo_model.cgi',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data,
    };
    function daysIntoYear(date) {
      return (
        (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
          Date.UTC(date.getFullYear(), 0, 0)) /
        24 /
        60 /
        60 /
        1000
      );
    }
    let d_ = parseInt(day) < 10 ? `0${day}` : day;
    let m_ = parseInt(month) < 10 ? `0${month}` : month;
    let doty = daysIntoYear(new Date(`${year}-${m_}-${d_}`));
    axios(config)
      .then(async function (response) {
        try {
          let _data = await response.data;
          let results = JSON.stringify(_data);
          let result = results.match(
            /https:\/\/ccmc\.gsfc\.nasa\.gov\/idl_images\/MODELWEB_DATA\/\/[a-zA-z0-9\-]+\.lst/
          )[0];
          if (result) {
            axios({ method: 'get', url: result }).then((data) => {
              fs.writeFileSync(
                `${nof}-${data_['year']}-${doty}.txt`,
                data.data
              );
              res.download(`${nof}-${data_['year']}-${doty}.txt`, (err) => {
                if (!err) {
                  fs.unlinkSync(`${nof}-${data_['year']}-${doty}.txt`);
                }
              });
            });
          }
        } catch (err) {
          console.log(err);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (e) {
    console.log(e);
  }
});

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
