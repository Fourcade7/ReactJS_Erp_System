

import bdocs from "../assets/bootstrap-docs.png"
import { NavbarScreenFourAuth } from "../navbar/NavbarContent";


import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


function HeroScreen() {
  return (
    <div>
      <div className="px-4 pt-5 my-5 text-center border-bottom">
        <h1 className="display-4 fw-bold text-body-emphasis">
          Добро пожаловать в ERP-систему!
        </h1>

        <div className="col-lg-6 mx-auto">
          <p className="lead mb-4">
           ERP-система — это программное обеспечение, предназначенное для управления основными бизнес-процессами предприятия в единой системе.
            Она объединяет различные отделы компании, такие как склад, продажи, закупки, финансы и кадры.
            С помощью ERP можно автоматизировать учет товаров, денежных средств и работы сотрудников.
            Это позволяет сократить количество ошибок и повысить эффективность работы предприятия.
            Например, при продаже товара система автоматически обновляет остатки на складе и финансовые отчеты.
                    </p>

          <div className="d-grid gap-1 d-sm-flex justify-content-sm-center mb-5">
            <button type="button" className="btn btn-primary btn-lg px-4 ">
              Начать работу <i class="bi bi-arrow-right-short"></i>
            </button>

            <button type="button" className="btn btn-outline-secondary btn-lg px-4">
              Тарифы
            </button>
          </div>
        </div>

        <div className="overflow-hidden" style={{ maxHeight: "40vh" }}>
          <div className="container px-5">
            <img
              src="https://static.vecteezy.com/system/resources/previews/024/218/792/non_2x/erp-enterprise-resource-planning-system-illustration-with-business-integration-productivity-and-company-enhancement-in-hand-drawn-templates-vector.jpg"
              className="img-fluid border rounded-3 shadow-lg mb-4"
              alt="Example image"
              width="700"
              height="700"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}



function WelcomeScreen(){
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userid");

    if (!userId) {
      //navigate("/login");
    }else{
      navigate("/home");
    }
  }, [navigate]);
    return(
        <div>
            <NavbarScreenFourAuth></NavbarScreenFourAuth>
            <HeroScreen></HeroScreen>
            
        </div>
    )
}




export {WelcomeScreen}