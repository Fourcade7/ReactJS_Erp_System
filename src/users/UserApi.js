import { API_BASE } from '../config/api'



const urlGetALlProducts = `${API_BASE}/getallproducts`
//const accessToken = "0401c8f573fb9123965566e3da60e6dd2fda3c1d"


async function registerUser(username,surname,phone,email, password) {
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
                role:"user"
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


async function updateUser(
  id,
  username,
  surname,
  phone,
  email,
  role,
  password
) {
  try {

    const body = {};

    if (username) body.username = username;
    if (surname) body.surname = surname;
    if (phone) body.phone = phone;
    if (email) body.email = email;
    if (password) body.password = password;
    if (role) body.role = role;

    const response = await fetch(`${API_BASE}/user/update/${id}`, {
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


async function deleteUser(id){

   

    try{
        let response = await fetch(`${API_BASE}/user/delete/${id}`,{ 
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


async function getAllUsersPaginationSearch(page,limit,search){

   

    try{
        let response = await fetch(`${API_BASE}/user/allpagsearch?page=${page}&limit=${limit}&search=${encodeURIComponent(search ?? "")}`,{ 
            method:"GET"

        });

        const result = await response.json();
        //console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}

export {getAllUsersPagination,deleteUser,updateUser,getAllUsersPaginationSearch}