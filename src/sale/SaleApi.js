import { API_BASE } from '../config/api'
import { t } from '../i18n'






// `filters`: { debt, masterId, userId } — faqat qarzi borlar, usta va sotgan xodim bo'yicha (bo'sh qiymatlar yuborilmaydi).
// Qidiruv (`search`) kontragent, sotgan xodim, usta nomi va savdo raqami bo'yicha ishlaydi.
async function getAllSaleListPaginationSearch(page,limit,search,filters = {}){

    const extra = new URLSearchParams()
    if (filters.debt) extra.set('debt', 'true')
    if (filters.masterId) extra.set('master_id', filters.masterId)
    if (filters.userId) extra.set('user_id', filters.userId)
    const query = extra.toString()

    try{
        let response = await fetch(`${API_BASE}/sale/allpagsearch?page=${page}&limit=${limit}&search=${encodeURIComponent(search ?? "")}${query ? `&${query}` : ""}`,{
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





// `extra`: { openContract, masterFees } — shartnoma ochilsinmi (kassadagi tumbler) va usta xizmatlari.
async function addNewSale(orderList,finalCost,paymentType,discount,customerId,userId,extra = {}) {

   
    
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
                payments,
                open_contract: extra.openContract,
                master_fees: extra.masterFees?.length
                    ? extra.masterFees.map((fee) => ({
                        master_id: fee.master.id,
                        amount: fee.amount,
                        company_amount: fee.companyAmount ?? 0,
                        note: fee.note,
                    }))
                    : undefined                               
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

    if (!response.ok) throw new Error(t('Ошибка сервера'));

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


// Savdo qilingandan keyin kontragentni almashtirish (kassir adashib boshqasini tanlagan bo'lsa).
// Savdo bilan birga qaytarishlar va bog'langan shartnoma ham yangi kontragentga o'tadi.
// `byContract` — savdoni "По договору" ga o'tkazish: shartnoma va kuzatuv vazifasi avtomatik ochiladi.
// `customerId` bo'lmasa kontragent o'zgarmaydi (faqat shartnoma ochiladi).
async function changeSaleCustomer(saleId, customerId, userId, byContract = false) {

    return fetch(`${API_BASE}/sale/customer/${saleId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            customer_id: customerId,
            user_id: userId,
            by_contract: byContract || undefined
        })
    });
}


// Savdodan keyin usta xizmatini qo'shish (usta kech kelgan bo'lsa). `fee`: { masterId, amount, companyAmount, method }:
// `amount` — ustaning ulushi, `companyAmount` — savdo summasiga qo'shiladi, `method` — ulush qanday to'landi ("В долг" — qarzga).
async function addSaleMasterFee(saleId, fee, userId) {

    return fetch(`${API_BASE}/sale/master-fee/${saleId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: Number(userId),
            master_id: fee.masterId,
            amount: fee.amount,
            company_amount: fee.companyAmount,
            method: fee.method
        })
    });
}


// Usta xizmatini o'chirish — faqat admin.
async function removeSaleMasterFee(feeId, userId) {

    return fetch(`${API_BASE}/sale/master-fee/${feeId}?user_id=${encodeURIComponent(userId ?? "")}`, {
        method: "DELETE"
    });
}


export {getAllProductPaginationSearch,addNewSale,getAllSaleListPaginationSearch,getAllCustomersForSale,addNewPayment,getAllSaleDebtList,getSaleDetail,returnFromSale,changeSaleCustomer,addSaleMasterFee,removeSaleMasterFee}