//price of food ordered
export const calculateOrderAmount = (orderItems) =>{
    const initialValue = 0;
    const itemsPrice = orderItems.reduce((previousValue, currentValue) =>{
        previousValue + currentValue.price*currentValue.amount, initialValue
    })
    return itemsPrice*100;
}