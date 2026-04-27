

import bdocs from "../assets/bootstrap-docs.png"
import { NavbarScreenFourAuth } from "../navbar/NavbarContent";


import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function FooterScreen() {
    return (
        <div>
            <div className="container">
                <footer className="py-5">
                    <div className="row">

                        <div className="col-6 col-md-2 mb-3">
                            <h5>Section</h5>
                            <ul className="nav flex-column">
                                <li className="nav-item mb-2">
                                    <a href="#" className="nav-link p-0 text-body-secondary">
                                        Home
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div className="col-md-5 offset-md-1 mb-3">
                            <form>
                                <h5>Subscribe</h5>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Email address"
                                />
                                <button className="btn btn-primary mt-2">
                                    Subscribe
                                </button>
                            </form>
                        </div>

                    </div>
                </footer>
            </div>
        </div>
    );
}




function Features(){
    return(
        <div>
             <div class="container px-4 py-5">
        <h2 class="pb-2 border-bottom">Features with title</h2>
        <div
          class="row row-cols-1 row-cols-md-2 align-items-md-center g-5 py-5"
        >
          <div class="col d-flex flex-column align-items-start gap-2">
            <h2 class="fw-bold text-body-emphasis">
              Left-aligned title explaining these awesome features
            </h2>
            <p class="text-body-secondary">
              Paragraph of text beneath the heading to explain the heading.
              We'll add onto it with another sentence and probably just keep
              going until we run out of words.
            </p>
            <a href="#" class="btn btn-primary btn-lg">Primary button</a>
          </div>
          <div class="col">
            <div class="row row-cols-1 row-cols-sm-2 g-4">
              <div class="col d-flex flex-column gap-2">
                <i class="bi bi-gear-wide-connected fs-1"></i>
                <h4 class="fw-semibold mb-0 text-body-emphasis">
                  Featured title
                </h4>
                <p class="text-body-secondary">
                  Paragraph of text beneath the heading to explain the heading.
                </p>
              </div>
              <div class="col d-flex flex-column gap-2">
                <i class="bi bi-bag-check fs-1"></i>
                <h4 class="fw-semibold mb-0 text-body-emphasis">
                  Featured title
                </h4>
                <p class="text-body-secondary">
                  Paragraph of text beneath the heading to explain the heading.
                </p>
              </div>
              <div class="col d-flex flex-column gap-2">
                <i class="bi bi-people fs-1"></i>
                <h4 class="fw-semibold mb-0 text-body-emphasis">
                  Featured title
                </h4>
                <p class="text-body-secondary">
                  Paragraph of text beneath the heading to explain the heading.
                </p>
              </div>
              <div class="col d-flex flex-column gap-2">
                <i class="bi bi-cash-coin fs-1"></i>
                <h4 class="fw-semibold mb-0 text-body-emphasis">
                  Featured title
                </h4>
                <p class="text-body-secondary">
                  Paragraph of text beneath the heading to explain the heading.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
    )
}


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
      //navigate("/login");//
    }else{
      navigate("/home");
    }
  }, [navigate]);
    return(
        <div>
            <NavbarScreenFourAuth></NavbarScreenFourAuth>
            <HeroScreen></HeroScreen>
            <Features></Features>
            <FooterScreen></FooterScreen>
            
        </div>
    )
}




export {WelcomeScreen}