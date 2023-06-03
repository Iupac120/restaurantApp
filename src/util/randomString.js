import {v4 as uuidv4} from "uuid";

export const randomString = () => {
     //unique string
    const ranString  = uuidv4() + Math.floor(1000 + Math.random() * 9000);
    return ranString
}

export const randomOtp = () => {
    //unique string
   const ranString  = `${Math.floor(Math.random()*9000)}`;
   return ranString
}