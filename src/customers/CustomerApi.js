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


async function getAllCustomersPaginationSearch(page,limit,search){

   

    try{
        let response = await fetch(`${API_BASE}/customer/allpagsearch?page=${page}&limit=${limit}&search=${encodeURIComponent(search ?? "")}`,{ 
            method:"GET"

        });

        const result = await response.json();
        //console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}

export {getAllUsersPagination,deleteCustomer,updateCustomer,getAllCustomersPaginationSearch,addCustomer,importCustomers}