import React from 'react';
import Data from '../data/data.json';
import Chart from './Chart';
import { array2chart } from '../utils/array2chart';
import rawData from '../data/data.csv';
import Timeline from './Timeline';

import '../bootstrap/alert.scss';

const chartData = {
  type: "bar", //radar, bar, horizontalBar, line
  data: array2chart(rawData),
  options: {
    responsive: false,
    title: {
      display: true,
      text: "People that are in Charts!"
    },
    hover: {
      mode: 'label'
    },
    tooltips: {
      mode: 'label' //single
    }
  }
};

export default function Visualization() {
  let smartMessage = Data.smart ? "He is smart." : "He is not smart.";

  return (
    <div>
      <p className="alert alert-info">Data comes from json.file. Webpack@2.5.1 doesn't need json-loader any more</p>
      <p>{Data.name} is at least {Data.age} years old. {smartMessage}</p>

      <p className="alert alert-success">This part data comes from csv file. Webpack dsv-loader, chart.js, just.randomcolor, canvas.</p>
      <Chart width="800" height="350" {...chartData} style={{ margin: '0 auto' }} />

      <p className="alert alert-info" style={{ marginTop: '20px'}}>D3</p>
      <Timeline name="History of Skiing" />
    </div>
  );
}