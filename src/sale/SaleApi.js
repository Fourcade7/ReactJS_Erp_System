import { API_BASE } from '../config/api'






async function getAllSaleListPaginationSearch(page,limit,search){

   

    try{
        let response = await fetch(`${API_BASE}/sale/allpagsearch?page=${page}&limit=${limit}&search=${encodeURIComponent(search ?? "")}`,{ 
            method:"GET"

        });

        const result = await response.json();
        console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}


async function getAllSaleDebtList(){

   

    try{
        let response = await fetch(`${API_BASE}/sale/alldebt`,{ 
            method:"GET"

        });

       const result = await response.json();
        //console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}


async function getAllProductPaginationSearch(page,limit,search,categoryId){

   

    try{
        let response = await fetch(`${API_BASE}/product/allpagsearch?page=${page}&limit=${limit}&search=${encodeURIComponent(search ?? "")}${categoryId ? `&categoryId=${categoryId}` : ""}`,{ 
            method:"GET"

        });

        const result = await response.json();
        console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}



async function getAllCustomersForSale(search) {


    try {
        const response = await fetch(
            `${API_BASE}/customer/allpagsearch?page=${1}&limit=${10}&search=${encodeURIComponent(search ?? "")}`,
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





async function addNewSale(orderList,finalCost,paymentType,discount,customerId,userId) {

   
    
    const items = orderList.map(item=>(
        {
        product_id: item.id,
        warehouse_id: item.stock?.[0]?.warehouse?.id,
        quantity: item.quantity,
        // Savatda qoʻlda oʻzgartirilgan narx (customPrice) — faqat shu savdo uchun.
        price: item.customPrice ?? (item.checkPrice ? item.bulkPrice :item.buyPrice),
        checkPrice:item.checkPrice
       }
    ))

    const payments =[{
        method:paymentType,
        amount:finalCost
    }];
    




    try {
        let response = await fetch(`${API_BASE}/sale/addfull`, {
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




async function addNewPayment(saleId,method,amount) {

   
    
    




    try {
        let response = await fetch(`${API_BASE}/payment/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sale_id:saleId,                
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










// Savdo tafsiloti: har bir qatordan qancha qaytarilgani (`returned`) bilan.
async function getSaleDetail(id) {

    const response = await fetch(`${API_BASE}/sale/detail/${id}`);

    if (!response.ok) throw new Error("Ошибка сервера");

    return response.json();
}


// Список продаж ichidan qaytarish. items — [{ sale_item_id, quantity }].
// `method` faqat mijozga pul qaytariladigan boʻlsa kerak (qarz boʻlsa — qarzdan ayiriladi).
async function returnFromSale(saleId, items, method, userId) {

    return fetch(`${API_BASE}/return/fromsale`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            sale_id: saleId,
            items,
            method,
            user_id: userId
        })
    });
}


export {getAllProductPaginationSearch,addNewSale,getAllSaleListPaginationSearch,getAllCustomersForSale,addNewPayment,getAllSaleDebtList,getSaleDetail,returnFromSale}