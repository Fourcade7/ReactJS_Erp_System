import { NavbarScreen } from "../navbar/NavbarContent";
import LeftTab from "../main/TabContent";
import {BarChartEdited, ChartLinearEdited} from "./statistics/ChartsContent";



function HomeScreen(){
    return(
        <div className="">
          <ChartLinearEdited></ChartLinearEdited>
          <BarChartEdited></BarChartEdited>
         
        </div>
    )

}



export default HomeScreen;

