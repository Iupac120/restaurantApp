import bcrypt from "bcrypt"

export const hashData = async(data, saltRound = 10) => {
    try {
        const salt = await bcrypt.genSalt(saltRound)
        const hashedData = await bcrypt.hash(data, salt)
        return hashedData
    } catch (err) {
        throw (err)
    }
}