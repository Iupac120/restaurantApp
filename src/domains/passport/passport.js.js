import dotenv from "dotenv"
dotenv.config()
import express from "express"
import passport from "passport"
import User from "../user/UserModel.js"
const router = express.Router()
import {Strategy as GoogleStrategy} from "passport-google-oauth2"
import {Strategy as FacebookStrategy} from "passport-facebook"

export const passportCredential = (passport) =>{
    passport.use(new GoogleStrategy({
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/auth/google/callback",
        passReqToCallback   : true
      },
      async function(request, accessToken, refreshToken, profile, done) {
        console.log("trying to console google account",profile)
        // User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //   return done(err, user);
        // });
        try {
            let user = await User.findOne({email:profile.email})
            if(user){
                return done(null,user)
            }else{
                const newUser = ({
                    username:profile.name,
                    email:profile.email
                })
            }
            user = await User.create(newUser)
            done(null,user)
        } catch (error) {
            console.log(error)
            res.status(500).json({data:"google authentication failed"})
        }
      }
    ));

    passport.use(new FacebookStrategy({
        clientID:'777986900470158',//process.env.FACEBOOK_CLIENT_ID,
        clientSecret:'bb54f44009ad2e63c5e46a5ddad364b2',//process.env.FACEBOOK_CLIENT_SECRET,
        callbackUrl:'http://localhost:5000/auth/facebook/callback',//'/login/facebook/callback',//process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['emails','displayName','name','picture']
    }, async function (accessToken,refreshToken,profile,done){
        console.log("it here",profile)
        process.nextTick(async function(){
            const user = await User.findOne({email: profile.email})
            if(user){
                return done(null,user)
            }else{
                const newUser = new User({
                    username:profile.name,
                    email:profile.email,
                    refreshToken:refreshToken
                })
                await newUser.save()
                return done(null,newUser)
            }
        })
    }))

    passport.serializeUser(function(user,done){
        //it takes the id of the user
        done(null,user.email)
        
    }
    )
    
    passport.deserializeUser(function(user,done){
        //use the id to select the user
        User.findOne(email,function(req,res){
            done(null,user)
        })
    })
    
}



// passport.use(new GoogleStrategy({
//     clientID:process.env.GOOGLE_CLIENT_ID,
//     clientSecret:process.env.GOOGLE_CLIENT_SECRET,
//     callbackUrl:'/google',//process.env.GOOGLE_CALLBACK_URL,
//     passReqToCallback: true
// }, function(accessToken,refreshToken,profile,done){
//     User.findOrCreate({googleId:profile.id}, function(err,user){
//         console.log(profile)
//         return done(err,user)
//     })

// })) 






// //routes
// router.get('/google', passport.authenticate('google',{scope:['profile','email']}))
// 
// router.get('/google/callback',passport.authenticate('google',{failureRedirect:"/error"}),function(req,res){
//     //successful redirect,redirect home
//     //res.redirect('/success')
//     res.redirect('/profile')
// })


//     }
//     )

// export { router }