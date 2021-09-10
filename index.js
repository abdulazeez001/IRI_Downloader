var axios = require('axios');
var express = require('express')
var qs = require('qs');
var cors = require('cors')
var que = require('query-string')
const fs = require('fs');
const path = require('path');

const app = express()
app.use(cors())
app.use(express.static('public'))
let port = process.env.PORT || 4000;
app.get('/',(req,res)=>{
    res.render('index.html')
})
app.get('/download',async (req,res)=>{
    try{
        const {nof,day,year,month,long,lat} = req.query
    let data_ = {
        'model': 'iri2016','year': year,'month': month,'day': day,'time_flag': '1','hour': '','geo_flag': '1.','latitude': lat,
        'longitude': long,'height': '1800','profile': '8','start': '0','stop': '23.59','step': '0.25','sun_n': '','ion_n': '','radio_f': '',
        'radio_f81': '','htec_max': '1500','ne_top': '0.','imap': '0.','ffof2': '0.','hhmf2': '0.','ib0': '2.','probab': '0.','fauroralb': '0.',
        'ffoE': '1.','dreg': '0.','tset': '2.','icomp': '0.','nmf2': '0.','hmf2': '0.','nme': '0.','user_hme': '0.','user_B0': '0.',
        'vars': ['00','03','04','29'],'format': '2','linestyle': 'solid','charsize': '','symbol': '2','symsize': '','yscale': 'Linear','xscale': 'Linear',
        'imagex': '640','imagey': '480' 
    } 
    let data = que.stringify(data_);
    var config = {
        method: 'post',
        url: 'https://ccmc.gsfc.nasa.gov/cgi-bin/modelweb/models/vitmo_model.cgi',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded', 
          // 'Authorization': 'Bearer eyJ0eXBlIjoidXNlciIsImRhdGEiOnsiX2lkIjoiNjEzMGRlZjBhNmNkNDgwZjY4MmJkNWUwIiwidXNlcm5hbWUiOiJBYmR1bCIsIm5hbWUiOiJPbHV3YXRvYmkiLCJlbWFpbCI6ImFiZHVsQGdtYWlsLmNvbSIsImNvbnRhY3QiOiIwODAifSwiaWF0IjoxNjMwNjAwNDU1LCJleHAiOjE2MzEyMDUyNTV9.Tupwutw4bu1jo09orP7u7LaqVEQ1LDkZIDS5TRwve04'
        },
        data : data
      };
    function daysIntoYear(date){
        return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
    }
    let d_ = parseInt(day)<10?`0${day}`:day
    let m_ = parseInt(month)<10?`0${month}`:month
    let doty = daysIntoYear(new Date(`${year}-${m_}-${d_}`))
    axios(config)
    .then(async function (response) {
      try{
        let _data = await response.data
        let results = JSON.stringify(_data)
        let result =results.match(/https:\/\/ccmc\.gsfc\.nasa\.gov\/idl_images\/MODELWEB_DATA\/\/[a-zA-z0-9\-]+\.lst/)[0]
        if (result){
            axios({method:'get',url:result})
            .then((data)=>{
            fs.writeFileSync(`${nof}-${data_['year']}-${doty}.txt`, data.data);
            res.download(`${nof}-${data_['year']}-${doty}.txt`,(err)=>{
                if (!err){
                    fs.unlinkSync(`${nof}-${data_['year']}-${doty}.txt`)
                }
            })
            })
        }
        
      }catch(err){
          console.log(err)
      }
      
        
    })
    .catch(function (error) {
      console.log(error);
    });
    }
    catch(e){
        console.log(e)
    }
    
})

app.listen(port,()=>{console.log(`Running on port ${port}`)})
