import {connect} from 'mongoose'

export default function connectDB (url) {
    return connect(url, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
}