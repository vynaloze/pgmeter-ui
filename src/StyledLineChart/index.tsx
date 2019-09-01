import {Series, XySeries} from "../_store/stats/types";
import React from "react";
import {defaults, Line} from "react-chartjs-2";
// @ts-ignore
defaults.global.defaultFontColor = '#dee5ec';
// @ts-ignore
defaults.global.defaultFontFamily = 'Fira Mono';

interface Props {
    data?: XySeries
    title: string
    yAxis?: string
    shiftColors: boolean
    colorIndex: number

    datasetFilter(s: Series): boolean

    datasetMapper(s: Array<Series>): Array<Series>

    labelMapper(a: Array<any>): Array<any>
}

export default class StyledLineChart extends React.Component<Props, {}> {
    public static defaultProps: Props = {
        data: undefined,
        title: "",
        yAxis: undefined,
        shiftColors: false,
        colorIndex: 0,

        datasetFilter(s: Series): boolean {
            return true;
        },
        datasetMapper(s: Array<Series>): Array<Series> {
            return s;
        },
        labelMapper(a: Array<any>): Array<any> {
            return a;
        }
    };

    render() {
        if (typeof this.props.data === 'undefined') {
            return <div/>
        }

        const filteredDatasets = this.props.data.datasets.filter(this.props.datasetFilter);
        const mappedDatasets = this.props.datasetMapper(filteredDatasets);
        const mappedLabels = this.props.labelMapper(this.props.data.labels);

        const shiftFirstColorForSingleTable = (schemeColors: any[]) => {
            if (this.props.shiftColors) {
                for (let i = 0; i < this.props.colorIndex % schemeColors.length; i++) schemeColors.push(schemeColors.shift());
            }
            return schemeColors;
        };
        return (<Line data={{labels: mappedLabels, datasets: mappedDatasets}}
                      legend={{position: 'bottom'}}
                      options={{
                          title: {
                              display: true,
                              text: this.props.title,
                              fontStyle: 'normal'
                          },
                          scales: {
                              yAxes: [{
                                  scaleLabel: {
                                      display: this.props.yAxis !== undefined,
                                      labelString: this.props.yAxis
                                  }
                              }]
                          },
                          maintainAspectRatio: false,
                          plugins: {
                              colorschemes: {
                                  scheme: 'brewer.DarkTwo8',
                                  custom: shiftFirstColorForSingleTable,
                              }
                          },
                          // disable animations for major performance gain
                          animation: {
                              duration: 0 // general animation time
                          },
                          hover: {
                              animationDuration: 0 // duration of animations when hovering an item
                          },
                          responsiveAnimationDuration: 0 // animation duration after a resize
                      }}/>)
    }
}