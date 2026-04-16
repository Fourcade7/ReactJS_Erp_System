





async function getAllReturnsListPaginationSearch(page,limit,search){

   

    try{
        let response = await fetch(`http://109.196.103.18:3000/return/allpagsearch?page=${page}&limit=${limit}&search=${search}`,{ 
            method:"GET"

        });

        const result = await response.json();
        //console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}

async function getAllProductPaginationSearch(page,limit,search){

   

    try{
        let response = await fetch(`http://109.196.103.18:3000/product/allpagsearch?page=${page}&limit=${limit}&search=${search}`,{ 
            method:"GET"

        });

        const result = await response.json();
        //console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}



async function getAllCustomersForSale(search) {

    if (!search || search.trim() === "") {
        return []; // yoki null qaytarasan (UI ga qarab)
    }

    try {
        const response = await fetch(
            `http://109.196.103.18:3000/customer/allpagsearch?page=${1}&limit=${10}&search=${search}`,
            {
                method: "GET"
            }
        );

        const result = await response.json();
        return result;

    } catch (error) {
        console.log("Catch Error:", error);
    }
}





async function addNewReturn(orderList,finalCost,paymentType,discount,customerId,userId) {

   
    
    const items = orderList.map(item=>(
        {
        product_id: item.id,
        warehouse_id: item.stock?.[0]?.warehouse?.id,
        quantity: item.quantity,
        price: item.checkPrice ? item.bulkPrice :item.buyPrice,
        checkPrice:item.checkPrice 
       }
    ))

    const payments =[{
        method:paymentType,
        amount:finalCost
    }];
    




    try {
        let response = await fetch(`http://109.196.103.18:3000/return/addfull`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customer_id:customerId,
                user_id:userId,
                discount:discount,
                items,
                payments                               
            })
        });

        // const result = await response.json();
        // //console.log(result);
        // console.log(response.status);

        return response;

    } catch (error) {
        console.log("Catch Error:", error);
    }
}




async function addNewPayment(returnId,method,amount) {
    console.log(returnId);
    

    try {
        let response = await fetch(`http://109.196.103.18:3000/payment/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                return_id:returnId,                
                method,
                amount                               
            })
        });

        // const result = await response.json();
        // //console.log(result);
        // console.log(response.status);

        return response;

    } catch (error) {
        console.log("Catch Error:", error);
    }
}










export {getAllProductPaginationSearch,addNewReturn,getAllReturnsListPaginationSearch,getAllCustomersForSale,addNewPayment}