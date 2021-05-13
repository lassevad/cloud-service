import React from 'react';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import axios from 'axios';

const API_ROUTE = "http://10.6.129.191:8080"

class GraphService extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            csvfile: null,
            strategies: null,
            strategyItems: null,
            selectedStrategy: null,
            colItems: null,
            selectedCol1Item: null,
            selectedCol2Item: null,
            selectedHueItem: null,
            disp_image: null
        }
        this.handleChange = this.handleChange.bind(this)
        this.getStrategies = this.getStrategies.bind(this)
        this.setStrategy = this.setStrategy.bind(this)
        this.fillStrategies = this.fillStrategies.bind(this)
        this.componentDidMount = this.componentDidMount.bind(this)
        this.getColumns = this.getColumns.bind(this)
        this.sendGraphInfo = this.sendGraphInfo.bind(this)
        this.setCol1 = this.setCol1.bind(this)
        this.setCol2 = this.setCol2.bind(this)
        this.setHue = this.setHue.bind(this)
        this.changeDispImage = this.changeDispImage.bind(this)
        this.generateGraph = this.generateGraph.bind(this)

    }

    makeId(length) {
        var result = [];
        var characters = '0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
        }
        return result.join('');
    }

    changeDispImage(newImage) {
        this.setState({
            disp_image: newImage
        });
    }

    uploadcsv() {
        console.log(this.state.csvfile)
        let csv = this.state.csvfile
        return axios.post(API_ROUTE + "/csv", csv, {
            headers: {
                "Content-Type": "text/csv",
            }
        }).then(function (response) {
            console.log(response);
        })
            .catch(function (error) {
                console.log(error);
            });
    };

    uploadStrategy() {
        return axios.post(API_ROUTE + '/uploadStrategy', {
            data: {
                strategy: this.state.selectedStrategy
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    uploadCol1() {
        return axios.post(API_ROUTE + '/uploadCol1', {
            data: {
                col1: this.state.selectedCol1Item
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    uploadCol2() {
        return axios.post(API_ROUTE + '/uploadCol2', {
            data: {
                col2: this.state.selectedCol2Item
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    uploadHue() {
        return axios.post(API_ROUTE + '/uploadHue', {
            data: {
                hue: this.state.selectedHueItem
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    getStrategies() {
        return axios.get(API_ROUTE + "/strategies")
            .then(response => {
                console.log(typeof response.data.strategies)
                console.log(response.data.str)
                this.setState({
                    strategies: response.data.strategies
                })
            })
    }

    getColumns() {
        return axios.get(API_ROUTE + "/columns")
            .then(response => {
                console.log(response.data)
                this.fillColumns(response.data)
            })
    }

    setStrategy(e) {
        console.log(e.target)
        this.setState({
            selectedStrategy: e.target.value
        })
    }

    setCol1(e) {
        this.setState({
            selectedCol1Item: e.target.value
        })
    }

    setCol2(e) {
        this.setState({
            selectedCol2Item: e.target.value
        })
    }

    setHue(e) {
        this.setState({
            selectedHueItem: e.target.value
        })
    }

    async sendGraphInfo() {
        await this.uploadStrategy()
        await this.uploadCol1()
        await this.uploadCol2()
        await this.uploadHue()
        this.generateGraph()
    }

    generateGraph() {
        return axios.get(API_ROUTE + "/generateGraph", { responseType: 'arraybuffer' })
            .then(response => {
                console.log(response)
                var blob = new Blob(
                    [response.data],
                    { type: response.headers['content-type'] }
                )

                var image = URL.createObjectURL(blob)
                console.log(image)

                this.changeDispImage(image)
                console.log(this.state.disp_image)
                return image
            });
    }
    fillStrategies() {
        let strats = this.state.strategies;
        let menuItems = strats.map((strategy) =>
            <MenuItem value={strategy.id} key={strategy.name}>{strategy.name}</MenuItem>
        );
        this.setState({
            strategyItems: menuItems
        })
    }

    fillColumns(columns) {
        console.log(columns)
        let menuItems = columns.map((index, value) => (
            <MenuItem key={index} value={value}>{index}</MenuItem>
        ));
        this.setState({
            columns: menuItems
        })
        console.log(this.state.columns)
    }

    async handleChange(event) {
        await this.setState({
            csvfile: event.target.files[0],
            disp_image: URL.createObjectURL(event.target.files[0])
        })
        await this.uploadcsv()
        this.getColumns()
    }

    async componentDidMount() {
        await this.getStrategies()
        this.fillStrategies()

    }

    render() {
        return (
            <div>
                <InputLabel>Plot strategy</InputLabel>
                <Select
                    onChange={this.setStrategy}>
                    {this.state.strategyItems}
                </Select>
                <InputLabel>Column 1</InputLabel>
                <Select
                    onChange={this.setCol1}>
                    {this.state.columns}
                </Select>
                <InputLabel>Column 2</InputLabel>
                <Select
                    onChange={this.setCol2}>
                    {this.state.columns}
                </Select>
                <InputLabel>Hue</InputLabel>
                <Select
                    onChange={this.setHue}>
                    {this.state.columns}
                </Select>
                <div class="file-field input-field">
                    <Box display="flex" alignSelf="flex-end" justifyContent="center" className="upl">
                        <span class="btn">Upload</span>
                        <input type="file" multiple class="btn" onChange={this.handleChange} />
                        <a class="waves-effect waves-light btn" onClick={this.sendGraphInfo}>Create Graph</a>
                    </Box>
                    <Box display="flex" justifyContent="center">
                        <img src={this.state.disp_image} onChange={this.changeDispImage} id="graph-upload" className="ImageSize" />
                    </Box>
                </div>

            </div>
        );
    }
}


export default GraphService;