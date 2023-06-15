//price of food ordered
export const calculateOrderAmount = (orderItems) =>{
    const initialValue = 0;
    console.log(orderItems)
    const itemsPrice = orderItems.reduce((previousValue, currentValue) =>{
        const {productId, quantity} = currentValue
        console.log("tota",productId)
        console.log("tota/",quantity)
        return previousValue + (productId.price*quantity)
        console.log("hardtwo",currentValue)
    }, 0)
    console.log("item",itemsPrice)
    return parseInt(itemsPrice)*100;
}