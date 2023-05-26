import bcrypt from "bcrypt"

export const hashData = async(data, salt = 10) => {
    try {
        //const salt = await bcrypt.genSalt(saltRound)
        const hashedData = await bcrypt.hash(data, 10)
        return hashedData
    } catch (err) {
        throw (err)
    }
}