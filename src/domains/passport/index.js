import express from "express"
import passport from "passport"
const router = express.Router()
router.get("/",(req,res) =>{
    res.render("index.ejs")
})

router.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

router.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/google/profile',
        failureRedirect: '/auth/google/error'
}));


router.get('/auth/facebook', passport.authenticate('facebook',{scope:['profile','email']}))

router.get('/auth/facebook/callback',
    passport.authenticate('facebook',{
        successRedirect:"/auth/facebook/profile",
        failureRedirect:'/auth/facebook/error'
    }))


router.get("/profile",function(req,res){
    console.log("profile",res,"send",req)
        res.render("/profile.ejs",{name:req.user.displayName,email:req.user.emails[0].value,pic:req.user.photos[0].value})
        
})

router.get("/error",isLoggedIn,function(req,res){
       res.render('error.ejs')
})

router.get("/",function (req,res){
       //res.send(req.user?req.user:`not logged in, login with facebook or google`)
       res.render('index.ejs')
})

function isLoggedIn(req,res,next){
       if(req.isAuthenticated())
       return next()
       res.rediect("/")
}

router.get("/logout",(req,res) =>{
       req.session = null,
       req.logout()
       req.redirect('/')
})
export {router}