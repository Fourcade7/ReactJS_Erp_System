import { API_BASE } from '../config/api'



const urlGetALlProducts = `${API_BASE}/getallproducts`
//const accessToken = "0401c8f573fb9123965566e3da60e6dd2fda3c1d"


// Ochiq "Регистрация" sahifasi rol bermaydi — doim User. Rolni faqat "Сотрудники" bo'limi tanlaydi.
async function registerUser(username,surname,phone,email, password, role = "User") {
    try {
        let response = await fetch(`${API_BASE}/user/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                surname,
                phone,
                email,
                password: password,
                role
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


async function loginUser(email, password) {
    try {
        let response = await fetch(`${API_BASE}/user/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
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


async function getAllContragents(){

   

    try{
        let response = await fetch(`${API_BASE}/getallcontragents`,{ 
            method:"GET"

        });

        const result = await response.json();
        console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}

async function getAllProducts(offset,search){

   

    try{
        let response = await fetch(`${API_BASE}/getallproducts/${offset}/${search}`,{ 
            method:"GET"

        });

        const result = await response.json();
        console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}

export {getAllContragents,loginUser,registerUser}