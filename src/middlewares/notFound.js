export const notFound = (req,res, next) => {
    //res.status(404).send('Route does not exist')
    const error = new Error(`Not found-${req.originalUrl}`)
    res.status(404);
    next(error)
}


