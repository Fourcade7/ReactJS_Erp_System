import { API_BASE } from '../config/api'
import { t } from '../i18n'



async function addCustomer(username,surname,phone) {
    try {
        let response = await fetch(`${API_BASE}/customer/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                surname,
                phone,
                type:"user" 
                
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



// Excel importi uchun ommaviy yozish. Boshqa funksiyalardan farqli oʻlaroq
// bu yerda javob oʻqib olinadi va xato boʻlsa otiladi — importda har bir
// paketning natijasi (nechta yozildi, qaysi qator xato) kerak boʻladi.
async function importCustomers(items) {

    const response = await fetch(`${API_BASE}/customer/import`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ items })
    });

    const result = await response.json();

    if (!response.ok) {
        // ValidationPipe `message` ni massiv qilib qaytaradi.
        const message = Array.isArray(result?.message)
            ? result.message.join(", ")
            : result?.message;

        throw new Error(message || t('Ошибка сервера'));
    }

    return result;
}



async function updateCustomer(
  id,
  username,
  surname,
  phone,

) {
  try {

    const body = {};

    if (username) body.username = username;
    if (surname) body.surname = surname;
    if (phone) body.phone = phone;
   

    const response = await fetch(`${API_BASE}/customer/update/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    //const data = await response.json();
    return response;
  } catch (error) {
    console.error(error);
  }
}


async function deleteCustomer(id){

   

    try{
        let response = await fetch(`${API_BASE}/customer/delete/${id}`,{ 
            method:"DELETE"

        });

        //const result = await response.json();
        //console.log(result);
        
        return response;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}

async function getAllUsersPagination(page,limit){

   

    try{
        let response = await fetch(`${API_BASE}/user/allpag?page=${page}&limit=10`,{ 
            method:"GET"

        });

        const result = await response.json();
        //console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}


/**
 * `type`: organization - faqat tashkilotlar, user - faqat odamlar, bo'sh - hammasi aralash.
 * `debt` — faqat qarzi borlar. Har bir qatorda `debt` (qarz jami) va `debtSales` (qarzli savdolar soni) bor.
 */
async function getAllCustomersPaginationSearch(page,limit,search,type,debt){



    try{
        let response = await fetch(`${API_BASE}/customer/allpagsearch?page=${page}&limit=${limit}&search=${encodeURIComponent(search ?? "")}${type ? `&type=${type}` : ""}${debt ? "&debt=true" : ""}`,{
            method:"GET"

        });

        const result = await response.json();
        //console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}

// Kontragent kartochkasi: xato bo'lsa istisno otadi (useRequest uchun).
async function getJson(url) {
    const response = await fetch(url);
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
        throw new Error(message || t('Ошибка сервера'));
    }
    return data;
}

/** Ma'lumot + savdo/qaytarish/xarid jamlanmasi + to'lov usullari + top tovarlar + 12 oy. */
const getCustomerProfile = (id) => getJson(`${API_BASE}/customer/profile/${id}`);

/**
 * Barcha operatsiyalar (savdo, qaytarish, xarid), qatorlar va to'lovlar bilan. `type`: sale | return | purchase;
 * `debt` — faqat qarzi qolgan savdolar. Javobda `totals` — filtrdagi hamma operatsiyalar bo'yicha jamlanma.
 */
const getCustomerOperations = (id, { page = 1, limit = 10, type = "", debt = false } = {}) =>
    getJson(`${API_BASE}/customer/operations/${id}?page=${page}&limit=${limit}${type ? `&type=${type}` : ""}${debt ? "&debt=true" : ""}`);

/**
 * Mijoz balansi: `balance`, `debt`, `totals` (kiritilgan / qaytarishdan / sarflangan / qaytarib berilgan)
 * va harakatlar tarixi (`data`, sahifalangan, yangilari tepada).
 */
const getCustomerBalance = (id, { page = 1, limit = 20 } = {}) =>
    getJson(`${API_BASE}/customer/balance/${id}?page=${page}&limit=${limit}`);

// Balans amallari: xato bo'lsa istisno (backend xabari bilan) otadi, muvaffaqiyatda javob qaytadi.
async function postJson(url, body) {
    let response
    try {
        response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
    } catch {
        throw new Error(t('Не удалось подключиться к серверу'));
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
        throw new Error(message || t('Ошибка сервера'));
    }
    return data;
}

const currentUserId = () => Number(localStorage.getItem('userid')) || undefined;

/** Mijoz pul olib keldi (savdosiz ham) — balansga yoziladi. `method`: «Наличные», «Click» … */
const depositBalance = (id, { amount, method, note }) =>
    postJson(`${API_BASE}/customer/balance/${id}/deposit`, { amount, method, note: note || undefined, user_id: currentUserId() });

/** Balansdagi pulni mijozga qaytarib berish (balansdan ortiq emas). */
const withdrawBalance = (id, { amount, method, note }) =>
    postJson(`${API_BASE}/customer/balance/${id}/withdraw`, { amount, method, note: note || undefined, user_id: currentUserId() });

/**
 * Mijoz qarz uchun pul berdi: qarz yopiladi (`saleId` — bitta savdo, bo'lmasa eng eski qarzdan boshlab), ortgani
 * (qaytim) `keepChange` bo'lsa (standart) — balansga, aks holda qaytim qo'lga berilgan.
 * Javob: { paid, sales: [{ saleId, amount }], deposited, change, balance }.
 */
const acceptPayment = (id, { amount, method, saleId, keepChange = true, note }) =>
    postJson(`${API_BASE}/customer/balance/${id}/accept`, {
        amount,
        method,
        sale_id: saleId || undefined,
        keep_change: keepChange,
        note: note || undefined,
        user_id: currentUserId()
    });

/**
 * Qarzni balansdan yopish: `saleId` — bitta savdo, bo'lmasa eng eski qarzdan boshlab. `amount` — ko'pi bilan shuncha.
 * Javob: { paid, sales: [{ saleId, amount }], balance }.
 */
const payFromBalance = (id, { saleId, amount } = {}) =>
    postJson(`${API_BASE}/customer/balance/${id}/pay`, { sale_id: saleId || undefined, amount: amount || undefined, user_id: currentUserId() });

/** Kontragent yaratish (odam yoki tashkilot): tayyor tana (`customerPayload`) bilan; javob `Response`. */
async function createCustomer(payload) {
    try {
        return await fetch(`${API_BASE}/customer/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.log("Catch Error:", error);
    }
}

/** Kontragentni to'liq yangilash (tashkilotda bo'sh maydon ham yuboriladi — tozalanadi). */
async function updateCustomerData(id, payload) {
    try {
        return await fetch(`${API_BASE}/customer/update/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.log("Catch Error:", error);
    }
}

export {getAllUsersPagination,deleteCustomer,updateCustomer,getAllCustomersPaginationSearch,addCustomer,importCustomers,getCustomerProfile,getCustomerOperations,createCustomer,updateCustomerData,getCustomerBalance,depositBalance,withdrawBalance,payFromBalance,acceptPayment}