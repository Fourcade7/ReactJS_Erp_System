


const urlGetALlProducts = "http://109.196.103.18:3000/getallproducts"
//const accessToken = "0401c8f573fb9123965566e3da60e6dd2fda3c1d"


async function registerUser(username,surname,phone,email, password) {
    try {
        let response = await fetch(`http://109.196.103.18:3000/user/add`, {
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
                role:"User"
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
        let response = await fetch(`http://109.196.103.18:3000/user/login`, {
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
        let response = await fetch(`http://109.196.103.18:3000/getallcontragents`,{ 
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
        let response = await fetch(`http://109.196.103.18:3000/getallproducts/${offset}/${search}`,{ 
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