const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const app = express();

const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const adminuser=ADMIN_USER_NAME;
let localposts=[];
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(session({
  secret:"Our little secret.",
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
// const urldb="mongodb://localhost:27021/gleeDB";
const urldb=MONGODB_LINK;
mongoose.connect(urldb,{useNewUrlParser:true,useUnifiedTopology: true });
mongoose.set("useCreateIndex",true);

const postSchema={
  posttitle:String,
  postimage:String,
  postdate:String,
  postcontent:String,
  postreference:String
};

const userSchema=new mongoose.Schema({
  email:String,
  password:String,
  posts:[postSchema]
});

userSchema.plugin(passportLocalMongoose);
const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });


app.get("/",function(req,res){

  User.findOne({username:adminuser},function(err,foundUser){
    if(!err){
      if(!foundUser){
          res.send("No articles to show by admin");
        console.log("No articles to show by admin");
      }
      else{
        res.render("home",{
          posts:foundUser.posts
        });
        console.log("No of posts: "+foundUser.posts.length);
        localposts=foundUser.posts;
      }
    }
  });
});

app.get("/All",function(req,res){

  User.findOne({username:adminuser},function(err,foundUser){
    if(!err){
      if(!foundUser){
        res.send("No articles to show by admin");
        console.log("No articles to show by admin");
      }
      else{
        res.render("AllNews",{
          posts:foundUser.posts
        });
        console.log("No of posts: "+foundUser.posts.length);
        localposts=foundUser.posts;
      }
    }
  });
});

app.get("/posts/:posttitle",function(req,res){

  User.findOne({username:adminuser},function(err,foundUser){
    if(!err){
      if(!foundUser){
          res.send("No articles to show by admin");
          console.log("No articles to show by admin");
      }
    else{
    requestedtitle=req.params.posttitle.replace("-"," ");//will replace - in link to " "
    let b=0;
    var postnumber=-1;
    foundUser.posts.forEach(function(post){
      postnumber=postnumber+1;
      if(requestedtitle.toLowerCase()==post.posttitle.toLowerCase()){
      b=1;
      res.render("post",{
        posts:foundUser.posts,
        posttitle:post.posttitle,
        postimage:post.postimage,
        postdate:post.postdate,
        postcontent:post.postcontent,
        postreference:post.postreference,
        postnumber:postnumber
      });
      console.log("Page found");
      }
    });
    if(b==0){
      console.log("Page not found");
    }
    } 
  }
  });
});


app.post("/publish",(req,res)=>{
  var today = new Date();
  var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    post={
        posttitle:req.body.title,
        postimage:req.body.image,
        postdate:date,
        postcontent:req.body.content,
        postreference:req.body.reference
    };

    User.findOne({username:adminuser},function(err,foundUser){
      if(err){
        console.log(err);
      }
      else{
        if(foundUser){
          console.log("User authorised to Log in");
          foundUser.posts.push(post);
          foundUser.save(function(){
            res.redirect("/")
          })
          localposts=foundUser.posts;
        }
        else{
          // console.log("Not authorised user posting");
          // res.redirect("/")
          res.send("Sorry! You are not authorised to compose articles");
        }
      }
    })
});

app.post("/register",function(req,res){
  User.register({username:req.body.username},req.body.password,function(err,user){
      if(err){
          console.log(err);
          res.redirect("/register")
      }
      else{
          passport.authenticate("local")(req,res,function(){ 
              res.redirect("/")
          })
      }
  });
});

app.post("/login",function(req,res){
  const user=new User({
      username:req.body.username,
      password:req.body.password,
  });
  req.login(user,function(err){
      if(err){
          console.log(err)
      }else{
          passport.authenticate("local")(req,res,function(){
            if(user.username==adminuser){
              res.redirect("/compose");
            }
            else{
              // res.redirect("/");
              res.redirect("/");
            }
          });
      }
  });
});

app.post("/delete",function(req,res){
  deleteposttitle=req.body.dtitle;
  User.findOne({username:adminuser},function(err,foundUser){
    if(err){
      console.log(err);
    }
    else{
      if(foundUser){
        console.log("User authorised to Log in");
        var index=foundUser.posts.indexOf(foundUser.posts.find( ({ posttitle }) => posttitle === deleteposttitle ) );
        if(index!==-1){
        console.log("Post at position "+(index+1)+" deleted");  
        foundUser.posts.splice(index,1);
        foundUser.save(function(){
        res.redirect("/")
        })
        localposts=foundUser.posts;
        }
        else{
        console.log("Post to be deleted not found")
        }
      }
      else{
        console.log("Not authorised user posting");
        res.redirect("/")
      }
    }
  })
});

app.get("/compose",(req,res)=>{
  if(req.isAuthenticated()){
    res.render("compose")
}
else{
    res.render("login");
}
});

app.get("/about",(req,res)=>{
    res.render("about");
});
app.get("/contact",(req,res)=>{
    res.render("contact");
});

app.get("/login",function(req,res){
  res.render("login");
});
app.get("/register",function(req,res){
  res.render("register");
});
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

let port=process.env.PORT;
if(port==null||port==""){
  port=3000;
}

app.listen(port, function() {
  console.log('Server has started successfully');
});


