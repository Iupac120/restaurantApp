import {faker} from "@faker-js/faker";
import mongoose from "mongoose";

async function main(){
    const url ='mongodb+srv://Iupac120:3196@cluster0.dqfoaxw.mongodb.net/Orita?retryWrites=true&w=majority'

    try{
        await mongoose.connect(url)
    }catch(err){
        console.log(err)
    }
}