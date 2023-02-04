/*
IMPORTENT

code uu = username already used error
code eu = email already used error
code ue = username empty
code ee = email empty
code ew = email has wrong foramet
code pe = password empty
code ps = password length is less than 6 chars
code ce = country is empty
code eopw = email or password is wrong



IMPORTENT
*/

require("dotenv").config();
const { v4: uuidv4 } = require('uuid');
const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const formidable = require('formidable');
const bcrypt = require("bcrypt");
const fs = require("fs");
const mv = require("mv");

const saltRounds = 10;
const port = process.env.PORT || 3001

app.use(cors({
    origin: ["http://localhost:3000","https://nejmy.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json());

app.use(express.static(__dirname))




const db_config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}


var db;

function handleDisconnect() {
  db = mysql.createConnection(db_config); 
                                          

  db.connect(function(err) {              
    if(err) {                             
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); 
    }                                     
  });                                     
                                          
  db.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
      handleDisconnect();                         
    } else {                                      
      throw err;                                  
    }
  });
}

handleDisconnect()

app.listen(port,()=>{
    console.log(`I am listening to ${port}`);
})

app.post("/",(req,res)=>{
  res.send(JSON.stringify({res:false}))
})



app.post("/upload",(req,res)=>{
  const form = new formidable.IncomingForm()

  form.parse(req,(err,fields,files)=>{
    if(err){
      console.log(err);
      return
    }
    const celebrityId = fields.celebrityId
    const videosPath = "videos/"+celebrityId+"/"
    const oldPath = files.inputFile.filepath
    const newPath = videosPath+files.inputFile.originalFilename
   

 


    if(!fs.existsSync(videosPath)){
      fs.mkdir(videosPath,(err)=>{
        if(err){
          console.log(err);
          return

        }


 
      })
    }

    

    mv(oldPath,newPath,(err)=>{
      if(err){
        console.log(err);
        return
      }


      const server = process.env.SERVER

      const url = server+newPath
     
    
      const sql = "INSERT INTO videos(auther,url) VALUES (?,?)"

      db.query(sql,[celebrityId,url],(err,vids)=>{
        if(err){
          console.log(err);
          res.status(300).send(err)
        }
    
        if(vids){

          res.send(JSON.stringify({res:"ok"}))

        }
      })

    })

    


  })

})


app.post("/uploadPic",(req,res)=>{
  const form = new formidable.IncomingForm()

  form.parse(req,(err,fields,files)=>{
    if(err){
      console.log(err);
      return
    }
    const celebrityId = fields.celebrityId
    const videosPath = "imgs/"+celebrityId+"/"
    const oldPath = files.inputFile.filepath
    const newPath = videosPath+files.inputFile.originalFilename
   

 


    if(!fs.existsSync(videosPath)){
      fs.mkdir(videosPath,(err)=>{
        if(err){
          console.log(err);
          return

        }


 
      })
    }

    

    mv(oldPath,newPath,(err)=>{
      if(err){
        console.log(err);
        return
      }


      const server = process.env.SERVER

      const url = server+newPath
     
    
      const sql = "UPDATE celebrities SET photo = ? WHERE id = ?"

      db.query(sql,[url,celebrityId],(err,vids)=>{
        if(err){
          console.log(err);
          res.status(300).send(err)
        }
    
        if(vids){

          res.send(JSON.stringify({res:"ok"}))

        }
      })

    })

    


  })

})


app.post("/uploadNewPic",(req,res)=>{



  const form = new formidable.IncomingForm()

  form.parse(req,(err,fields,files)=>{
    if(err){
      console.log(err);
      return
    }

    const videosPath = "imgs/"+uuidv4()+"."
    const ext = files.inputFile.originalFilename.split(".")[1];
    const oldPath = files.inputFile.filepath
    const newPath = videosPath+ext

    

  


   

 


    if(!fs.existsSync(videosPath)){
      fs.mkdir(videosPath,(err)=>{
        if(err){
          console.log(err);
          return

        }


 
      })
    }

    

    mv(oldPath,newPath,(err)=>{
      if(err){
        console.log(err);
        return
      }


      const server = process.env.SERVER

      const url = server+newPath
     
    
 

      res.send(JSON.stringify({res:"ok",url:url}))



    })

    


  })

})



app.post("/getLatestVideos",(req,res)=>{


  const sql = "SELECT celebrities.id,celebrities.username,celebrities.category,videos.auther,videos.url,celebrities.username FROM videos INNER JOIN celebrities ON celebrities.id = videos.auther ORDER BY videos.id DESC LIMIT 10 "

  db.query(sql,(err,data)=>{
    if(err){
      console.log(err);
      res.status(300).send(err)
    }

    if(data){
      res.send(data);
    }


  })

})




app.post("/getAllOrders",(req,res)=>{


  const sql = "SELECT orders.from,orders.to,orders.id,orders.occasion,orders.date,celebrities.username FROM orders INNER JOIN celebrities ON celebrities.id = orders.celebrity_id   "

  db.query(sql,(err,data)=>{
    if(err){
      console.log(err);
      res.status(300).send(err);
    }


 

    if(data){

     

      res.send(JSON.stringify({res:"ok",data:data}))
      
    }else{
      res.send(JSON.stringify({res:"bad"}))
    }

  })

})


app.post("/getAllOrderByID",(req,res)=>{

  const id = req.body.id;


  const sql = "SELECT orders.from,orders.to,orders.message,orders.email,orders.id,orders.occasion,orders.date,celebrities.username,celebrities.photo FROM orders INNER JOIN celebrities ON celebrities.id = orders.celebrity_id  WHERE orders.id = ?"


  db.query(sql,[id],(err,data)=>{
    if(err){
      console.log(err);
      res.status(300).send(err);
    }


 

    if(data){

     

      res.send(JSON.stringify({res:"ok",data:data}))
      
    }else{
      res.send(JSON.stringify({res:"bad"}))
    }

  })

})



app.post("/getAllCategories",(req,res)=>{


  const sql = "SELECT * FROM category"

  db.query(sql,(err,data)=>{
    if(err){
      console.log(err);
      res.status(300).send(err);
    }


    if(data){
      res.send(data)
    }

  })

})

app.post("/getAllCategoryByURL",(req,res)=>{

  const url = req.body.url;


  const sql = "SELECT * FROM category WHERE url = ?"

  db.query(sql,[url],(err,data)=>{
    if(err){
      console.log(err);
      res.status(300).send(err);
    }


    if(data){
      res.send(data)
    }

  })

})



app.post("/getAllCelebrities",(req,res)=>{

  const sql = "SELECT * FROM celebrities" 

  db.query(sql,(err,data)=>{
    if(err){
      console.log(err);
      res.status(300).send(err);
    }

    if(data){

        res.send(data)
      
    }

  })

})


app.post("/searchOnCelebrity",(req,res)=>{

  const search = req.body.search;



  db.query("SELECT * FROM celebrities WHERE username LIKE '%"+search+"%'" ,(err,data)=>{
    if(err){
      console.log(err);
      res.status(300).send(err);
    }

    if(data){


        res.send(data)
      
    }

  })

})




// app.post("/getCelebritiesByCategory",(req,res)=>{

//   const category = req.body.category;

//   const sql = "SELECT * FROM celebrities" 

//   let results = [];

//   db.query(sql,(err,data)=>{
//     if(err){
//       console.log(err);
//       res.status(300).send(err);
//     }


//     if(data){

//       for (let i = 0; i < data.length; i++) {
//         const cates = data[i].category

//         const cate_array = cates.split(",");

//         for (let i = 0; i < cate_array.length; i++) {
//           const cate_name = cate_array[i];

//           if(cate_name === category){
//               results.push(data[i])
             
//           }
          
//         }
        
//       }

//       if(results.length > 0){
//         res.send(results)
//       }
      
//     }

//   })

// })


app.post("/getPrice",(req,res)=>{
  const celebrity_id = req.body.id
  const isbusiness = req.body.isbusiness
  let sql;
  let price;
  if(isbusiness){
    sql = "SELECT book_business_price FROM celebrities WHERE id = ?"
  }else{
    sql = "SELECT book_price FROM celebrities WHERE id = ?"
  }

  db.query(sql,[celebrity_id],(err,data)=>{
    if(err){
      console.log(err);
      res.status(300).send(err)
    }


    if(data){
      if(isbusiness){
        price = data[0].book_business_price
      }else{
        price = data[0].book_price
   
      }
     
      res.send(JSON.stringify({price:price}));
    }

  })


})

app.post("/getCelebrity",(req,res)=>{


  const celebrity_id = req.body.id


  const sql = "SELECT * FROM celebrities WHERE id = ?"


  db.query(sql,[celebrity_id],(err,data)=>{
    if(err){
      console.log(err);
      res.status(300).send(err)
    }

    if(data.length === 1){

      const celebrity_name = data[0].username
      const celebrity_cates = data[0].category

      const sql = "SELECT * FROM videos WHERE auther = ?"

      db.query(sql,[celebrity_id],(err,vids)=>{
        if(err){
          console.log(err);
          res.status(300).send(err)
        }
    
        if(vids){

          res.send(JSON.stringify({res:"ok",celebrity_data:data,celebrity_vids:vids}))

        }
      })


    }else{
      res.status(300).send(JSON.stringify({res:"bad",msg:"This ID not available"}))
    }


  })

})


app.post("/getCelebrityByID",(req,res)=>{


  const celebrity_id = req.body.id


  const sql = "SELECT * FROM celebrities WHERE id = ?"


  db.query(sql,[celebrity_id],(err,data)=>{
    if(err){
      console.log(err);
      res.status(300).send(err)
    }

    if(data.length === 1){

      res.send(JSON.stringify({res:"ok",data:data}))


    }else{
      res.status(300).send(JSON.stringify({res:"bad",msg:"This ID not available"}))
    }


  })

})


app.post("/updateCelebrity",(req,res)=>{

  const celebrity_id = req.body.id

  const email = req.body.email
  const username = req.body.username

  const country = req.body.country
  const categories = req.body.categories
  const bookPrice = req.body.bookPrice
  const bookBusinessPrice = req.body.bookBusinessPrice

  const sql = "UPDATE celebrities SET username = ?,email = ?,country = ?,category = ?,book_price = ?,book_business_price = ? WHERE id = ?"

  db.query(sql,[username,email,country,categories,bookPrice,bookBusinessPrice,celebrity_id],(err,data)=>{
    if(err){
      console.log(err);
      res.send(err);
    }

    if(data){
      
      res.send(JSON.stringify({res:"ok"}))
    }

  })



})


app.post("/addCelebrity",(req,res)=>{



  const email = req.body.email
  const username = req.body.username
  const photo = req.body.photo
  const country = req.body.country
  const categories = req.body.categories
  const bookPrice = req.body.bookPrice
  const bookBusinessPrice = req.body.bookBusinessPrice

  const sql = "INSERT INTO celebrities(username,email,country,category,photo,book_price,book_business_price) VALUES (?,?,?,?,?,?,?)"

  db.query(sql,[username,email,country,categories,photo,bookPrice,bookBusinessPrice],(err,data)=>{
    if(err){
      console.log(err);
      res.send(err);
    }


    if(data){
      
      res.send(JSON.stringify({res:"ok"}))
    }

  })



})


app.post("/deleteCelebrity",(req,res)=>{



  const id = req.body.id


  const sql = "DELETE FROM celebrities WHERE id=?"

  db.query(sql,[id],(err,data)=>{
    if(err){
      console.log(err);
      res.send(err);
    }


    if(data){
      
      res.send(JSON.stringify({res:"ok"}))
    }

  })



})





app.post("/getDataCounts",(req,res)=>{



  const sql = "SELECT * FROM orders"

  db.query(sql,(err,order)=>{
    if(err){
      console.log(err);
      res.send(err);
    }

    const order_count = order.length;

    const sql = "SELECT * FROM videos"

    db.query(sql,(err,vids)=>{

      if(err){
        console.log(err);
        res.send(err);
      }


      const vids_count = vids.length;

      const sql = "SELECT * FROM celebrities"

      db.query(sql,(err,celebrities)=>{

        if(err){
          console.log(err);
          res.send(err);
        }
  
        const celebrities_count = celebrities.length;

        const sql = "SELECT * FROM users"

        db.query(sql,(err,users)=>{

          if(err){
            console.log(err);
            res.send(err);
          }

          const users_count = users.length;

          res.send(JSON.stringify({res:"ok",order_count:order_count,vids_count:vids_count,celebrities_count:celebrities_count,users_count:users_count}))

        })


      

      })





    })
    
      
     
    

  })



})

app.post("/deleteVideo",(req,res)=>{

  const video_id = req.body.id



  const sql = "DELETE FROM videos WHERE id=?"

  db.query(sql,[video_id],(err,data)=>{
    if(err){
      console.log(err);
      res.send(err);
    }

    if(data){
      
      res.send(JSON.stringify({res:"ok"}))
    }

  })



})


app.post("/getCelebrityVideos",(req,res)=>{


  const celebrity_id = req.body.id


  const sql = "SELECT * FROM celebrities WHERE id = ?"


  db.query(sql,[celebrity_id],(err,data)=>{
    if(err){
      console.log(err);
      res.status(300).send(err)
    }

    if(data.length === 1){

   
      const celebrity_name = data[0].username
      const sql = "SELECT * FROM videos WHERE auther = ?"

      db.query(sql,[celebrity_id],(err,vids)=>{
        if(err){
          console.log(err);
          res.status(300).send(err)
        }
    
        if(vids.length > 0){

          res.send(JSON.stringify({res:"ok",celebrity_vids:vids,celebrity_name:celebrity_name}))

        }
      })


    }else{
      res.status(300).send(JSON.stringify({res:"bad",msg:"This ID not available"}))
    }


  })

})


app.post("/islogin",(req,res)=>{

    const token = req.body.token;

    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(err){
            res.send(JSON.stringify({islogin:false}))
        }else{
            res.send(JSON.stringify({islogin:true,user:user}));
        }

    
    })
    
   
})


app.post("/isAdminLogin",(req,res)=>{

    const token = req.body.token;

    jwt.verify(token,process.env.ACCESS_TOKEN_ADMIN,(err,user)=>{
        if(err){
            res.send(JSON.stringify({islogin:false}))
        }else{
            res.send(JSON.stringify({islogin:true,user:user}));
        }

    
    })
    
   
})

app.post("/JoinAsCelebrity",(req,res)=>{

    const email = req.body.email
    const socialname = req.body.socialname
    const username = req.body.username
    const platform = req.body.platform
    const follwersCount = req.body.follwersCount
    const country = req.body.country


    const query = "SELECT * FROM requests WHERE socialname = ? "
  
      db.query(query,[socialname],(err,data)=>{
        if(err){
          console.log(err);
          res.send(err)
        }
  
        if(data.length > 0){
          res.send(JSON.stringify({res:"bad",code:"uu"}))
        }else{
          
          const query = "SELECT * FROM requests WHERE email = ? "
  
          db.query(query,[email],(err,data)=>{
            if(err){
              console.log(err);
              res.send(err);
            }
  
            if(data.length > 0){
              res.send(JSON.stringify({res:"bad",code:"eu"}))
            }else{
  
              
  
                const query = "INSERT INTO requests(username,email,country,platform,socialname,followers_count,date) VALUES (?,?,?,?,?,?,?)";
                        
                db.query(query,[username,email,country,platform,socialname,follwersCount,getFullDate()],(err,data)=>{
                  if(err){
                    console.log(err);
                    res.send(err);
                  }
  
                  if(data){
                 
  
                    res.send(JSON.stringify({res:"ok"}))
  
                  }
  
                })
  
  
  
              
  
  
  
            }
  
          })
  
        }
  
  
      })

  
    
   
})



app.post("/signup",(req,res)=>{

    const username = req.body.username.toLowerCase();
    const email = req.body.email;
    const password = req.body.password;
    const country = req.body.country;
    const imgPath = "imgs/profile.png"
  
    const Vailidate = () =>{
      let isvalid = true;
  
      if(username.length < 1){
  
  
          res.send(JSON.stringify({res:"bad",code:"ue"}))
          isvalid = false;
          
      }
      if(email.length < 1){
  
          res.send(JSON.stringify({res:"bad",code:"ee"}))
          isvalid = false;
      }
      if(!email.includes("@") && !email.includes(".com")){
          res.send(JSON.stringify({res:"bad",code:"ew"}))
          
          isvalid = false;
      }
      if(password.length < 1){
          res.send(JSON.stringify({res:"bad",code:"pe"}))
  
          isvalid = false;
      }
      if(password.length < 6){
  
          res.send(JSON.stringify({res:"bad",code:"ps"}))
          isvalid = false;
      }
  
      if(country.length < 1){
  
          res.send(JSON.stringify({res:"bad",code:"ce"}))
          isvalid = false;
      }
  
      return isvalid;
      
  }
  
  
  
  if(Vailidate()){
  
      const query = "SELECT * FROM users WHERE username = ? "
  
      db.query(query,[username],(err,data)=>{
        if(err){
          console.log(err);
          res.send(err)
        }
  
        if(data.length > 0){
          res.send(JSON.stringify({res:"bad",code:"uu"}))
        }else{
          
          const query = "SELECT * FROM users WHERE email = ? "
  
          db.query(query,[email],(err,data)=>{
            if(err){
              console.log(err);
              res.send(err);
            }
  
            if(data.length > 0){
              res.send(JSON.stringify({res:"bad",code:"eu"}))
            }else{
  
              bcrypt.hash(password,saltRounds,(err,hash)=>{
                if(err){
                  console.log(err);
                  res.send(err);
                }
  
                const query = "INSERT INTO users(username,email,password,country,photo,date) VALUES (?,?,?,?,?,?)";
                        
                db.query(query,[username,email,hash,country,imgPath,getFullDate()],(err,data)=>{
                  if(err){
                    console.log(err);
                    res.send(err);
                  }
  
                  if(data){
                    const user = {username:username}
  
                    const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET);
  
                    res.send(JSON.stringify({res:"ok",token:accessToken}))
  
                  }
  
                })
  
  
  
              })
  
  
  
            }
  
          })
  
        }
  
  
      })
  }
  
  
  
  
})
  



app.post("/login",(req,res)=>{


    const email = req.body.email;
    const password = req.body.password;
  
    const Vailidate = () =>{
      let isvalid = true;
  
      if(email.length < 1){
  
          res.send(JSON.stringify({res:"bad",code:"ee"}))
          isvalid = false;
      }
      if(!email.includes("@") && !email.includes(".com")){
          res.send(JSON.stringify({res:"bad",code:"ew"}))
          
          isvalid = false;
      }
      if(password.length < 1){
          res.send(JSON.stringify({res:"bad",code:"pe"}))
  
          isvalid = false;
      }
     
  
      return isvalid;
      
  }
  
  
  
  if(Vailidate()){
  
  
      const query = "SELECT * FROM users WHERE email = ? "
  
      db.query(query,[email],(err,data)=>{
        if(err){
          console.log(err);
          res.send(err)
        }
  
        if(data.length === 1){
          
          const hashed_pass = data[0].password;
          const username = data[0].username;
          const img = data[0].img;
  
          if(bcrypt.compareSync(password,hashed_pass)){
            
            const user = {username:username}
  
            const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET);
  
            res.send(JSON.stringify({res:"ok",token:accessToken,username:username,img:img}))
          }else{
            res.send(JSON.stringify({res:"bad",code:"eopw"}))
          }
  
  
        }else{
          res.send(JSON.stringify({res:"bad",code:"eopw"}))
        }
  
  
      })
  }
  
  
  
  
  
  
  
  })
  



app.post("/AdminSignup",(req,res)=>{

    const username = req.body.username.toLowerCase();
    const email = req.body.email;
    const password = req.body.password;
  
    const Vailidate = () =>{
      let isvalid = true;
  
      if(username.length < 1){
  
  
          res.send(JSON.stringify({res:"bad",code:"ue"}))
          isvalid = false;
          
      }
      if(email.length < 1){
  
          res.send(JSON.stringify({res:"bad",code:"ee"}))
          isvalid = false;
      }
      if(!email.includes("@") && !email.includes(".com")){
          res.send(JSON.stringify({res:"bad",code:"ew"}))
          
          isvalid = false;
      }
      if(password.length < 1){
          res.send(JSON.stringify({res:"bad",code:"pe"}))
  
          isvalid = false;
      }
      if(password.length < 6){
  
          res.send(JSON.stringify({res:"bad",code:"ps"}))
          isvalid = false;
      }
  
      return isvalid;
      
  }
  
  
  
  if(Vailidate()){
  
      const query = "SELECT * FROM admins WHERE username = ? "
  
      db.query(query,[username],(err,data)=>{
        if(err){
          console.log(err);
          res.send(err)
        }
  
        if(data.length > 0){
          res.send(JSON.stringify({res:"bad",code:"uu"}))
        }else{
          
          const query = "SELECT * FROM admins WHERE email = ? "
  
          db.query(query,[email],(err,data)=>{
            if(err){
              console.log(err);
              res.send(err);
            }
  
            if(data.length > 0){
              res.send(JSON.stringify({res:"bad",code:"eu"}))
            }else{
  
              bcrypt.hash(password,saltRounds,(err,hash)=>{
                if(err){
                  console.log(err);
                  res.send(err);
                }
  
                const query = "INSERT INTO admins(username,email,password) VALUES (?,?,?)";
                        
                db.query(query,[username,email,hash],(err,data)=>{
                  if(err){
                    console.log(err);
                    res.send(err);
                  }
  
                  if(data){
                    const user = {username:username}
  
                    const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_ADMIN);
  
                    res.send(JSON.stringify({res:"ok",token:accessToken}))
  
                  }
  
                })
  
  
  
              })
  
  
  
            }
  
          })
  
        }
  
  
      })
  }
  
  
  
  
})
  



app.post("/AdminLogin",(req,res)=>{


    const email = req.body.email;
    const password = req.body.password;
  
    const Vailidate = () =>{
      let isvalid = true;
  
      if(email.length < 1){
  
          res.send(JSON.stringify({res:"bad",code:"ee"}))
          isvalid = false;
      }
      if(!email.includes("@") && !email.includes(".com")){
          res.send(JSON.stringify({res:"bad",code:"ew"}))
          
          isvalid = false;
      }
      if(password.length < 1){
          res.send(JSON.stringify({res:"bad",code:"pe"}))
  
          isvalid = false;
      }
     
  
      return isvalid;
      
  }
  
  
  
  if(Vailidate()){
  
  
      const query = "SELECT * FROM admins WHERE email = ? "
  
      db.query(query,[email],(err,data)=>{
        if(err){
          console.log(err);
          res.send(err)
        }
  
        if(data.length === 1){
          
          const hashed_pass = data[0].password;
          const username = data[0].username;

  
          if(bcrypt.compareSync(password,hashed_pass)){
            
            const user = {username:username}
  
            const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_ADMIN);
  
            res.send(JSON.stringify({res:"ok",token:accessToken}))
          }else{
            res.send(JSON.stringify({res:"bad",code:"eopw"}))
          }
  
  
        }else{
          res.send(JSON.stringify({res:"bad",code:"eopw"}))
        }
  
  
      })
  }
  
  
  
  
  
  
  
  })
  
  

























const getFullDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const fullDate = year + "-" + (month + 1) + "-" + day

    return fullDate;
}


