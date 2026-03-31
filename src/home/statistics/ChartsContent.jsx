import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Bar, BarChart } from 'recharts';
import { RechartsDevtools } from '@recharts/devtools';


import { ResponsiveContainer } from 'recharts';

const data2 = [
  { name: '1', uv: 1200, pv: 2400, amt: 800 },
  { name: '2', uv: 1800, pv: 2100, amt: 900 },
  { name: '3', uv: 900,  pv: 1700, amt: 700 },
  { name: '4', uv: 2200, pv: 2600, amt: 1000 },
  { name: '5', uv: 3000, pv: 3200, amt: 1200 },
  { name: '6', uv: 2500, pv: 2800, amt: 1100 },
  { name: '7', uv: 2700, pv: 3000, amt: 1300 },
  { name: '8', uv: 1500, pv: 2000, amt: 1900 },
  { name: '9', uv: 1700, pv: 2100, amt: 1950 },
  { name: '10', uv: 3200, pv: 3500, amt: 1400 },
  { name: '11', uv: 2900, pv: 3300, amt: 1200 },
  { name: '12', uv: 2100, pv: 2600, amt: 1000 },
  { name: '13', uv: 1800, pv: 2400, amt: 900 },
  { name: '14', uv: 2600, pv: 3000, amt: 1300 },
  { name: '15', uv: 3400, pv: 3700, amt: 1500 },
  { name: '16', uv: 3100, pv: 3500, amt: 1400 },
  { name: '17', uv: 2800, pv: 3200, amt: 1300 },
  { name: '18', uv: 2300, pv: 22700, amt: 112100 },
  { name: '19', uv: 2000, pv: 2500, amt: 1000 },
  { name: '20', uv: 2700, pv: 3100, amt: 1200 },
  { name: '21', uv: 3500, pv: 3800, amt: 1500 },
  { name: '22', uv: 3300, pv: 3600, amt: 1400 },
  { name: '23', uv: 3000, pv: 3400, amt: 1300 },
  { name: '24', uv: 2600, pv: 3000, amt: 1200 },
  { name: '25', uv: 2200, pv: 2700, amt: 1100 },
  { name: '26', uv: 2400, pv: 2900, amt: 1150 },
  { name: '27', uv: 2800, pv: 3200, amt: 1300 },
  { name: '28', uv: 3100, pv: 3500, amt: 1400 },
  { name: '29', uv: 2900, pv: 3300, amt: 1350 },
  { name: '30', uv: 2700, pv: 3100, amt: 1250 },
  { name: '31', uv: 2600, pv: 3000, amt: 1200 },
];

const data = [
  { name: 'Пн', uv: 4000,  pv: 2400,  amt: 2400 },
  { name: 'Вт', uv: 3000,  pv: 1398,  amt: 2210 },
  { name: 'Ср', uv: 79000, pv: 79800, amt: 2290 },
  { name: 'Чт', uv: 2780,  pv: 3908,  amt: 2000 },
  { name: 'Пт', uv: 0,     pv: 4800,  amt: 2181 },
  { name: 'Сб', uv: 2390,  pv: 3800,  amt: 2500 },
  { name: 'Вс', uv: 3490,  pv: 4300,  amt: 2100 },
];
// #endregion

function BarChartEdited() {
  return (
    <div style={{ width: '100%' }}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 5,
          }}
        >
           <CartesianGrid strokeDasharray="3 3" />
      {/* <XAxis dataKey="name" niceTicks="snap125" />
      <YAxis width="auto" niceTicks="snap125" />
      <Tooltip />
      <Legend /> */}

      <XAxis 
          dataKey="name"
          tick={{ fontSize: 10 }} 
          />
          
           <YAxis 
            tick={{ fontSize: 10 }} 
          />

          <Tooltip 
            contentStyle={{ fontSize: '10px' }}
            labelStyle={{ fontSize: '10px' }}
          />

          <Legend 
            wrapperStyle={{ fontSize: '10px' }}
          />
      <Bar dataKey="pv" stackId="a" fill="#0b4bedff" background />
      
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartLinearEdited() {
  return (
    <div style={{ width: '100%' }}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={data2}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
          dataKey="name"
          tick={{ fontSize: 10 }} 
          />
          
           <YAxis 
            tick={{ fontSize: 10 }} 
          />

          <Tooltip 
            contentStyle={{ fontSize: '10px' }}
            labelStyle={{ fontSize: '10px' }}
          />

          <Legend 
            wrapperStyle={{ fontSize: '10px' }}
          />

          <Line type="monotone" dataKey="uv" stroke="blue" />
          {/* <Line type="monotone" dataKey="uv" stroke="black" /> */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}




export  {BarChartEdited , ChartLinearEdited};