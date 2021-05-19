import React from 'react';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import axios from 'axios';

const API_ROUTE = "http://10.6.129.191:8080"

class MapService extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            geocsvfile: null,
            maps: null,
            cmaps: null,
            mapItems: null,
            cmapItems: null,
            selectedCMap: null,
            selectedMap: null,
            geoColumns: null,
            selectedGeoHueItem: null,
            disp_image: null
        }
        this.handleChange = this.handleChange.bind(this)
        this.getMaps = this.getMaps.bind(this)
        this.setMap = this.setMap.bind(this)
        this.getCMaps = this.getCMaps.bind(this)
        this.setCMap = this.setCMap.bind(this)
        this.fillMaps = this.fillMaps.bind(this)
        this.fillCMaps = this.fillCMaps.bind(this)
        this.componentDidMount = this.componentDidMount.bind(this)
        this.getGeoColumns = this.getGeoColumns.bind(this)
        this.sendMapInfo = this.sendMapInfo.bind(this)
        this.setGeoHue = this.setGeoHue.bind(this)
        this.changeDispImage = this.changeDispImage.bind(this)
        this.generateMap = this.generateMap.bind(this)

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
        console.log(this.state.geocsvfile)
        let geocsv = this.state.geocsvfile
        return axios.post(API_ROUTE + "/geocsv", geocsv, {
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

    uploadMap() {
        return axios.post(API_ROUTE + '/uploadMap', {
            data: {
                map: this.state.selectedMap
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

    uploadCMap() {
        return axios.post(API_ROUTE + '/uploadColorMap', {
            data: {
                cmap: this.state.selectedCMap
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

    uploadGeoHue() {
        return axios.post(API_ROUTE + '/uploadGeoHue', {
            data: {
                geohue: this.state.selectedGeoHueItem
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

    getGeoColumns() {
        return axios.get(API_ROUTE + "/geocolumns")
            .then(response => {
                console.log(response.data)
                this.fillGeoColumns(response.data)
            })
    }

    getCMaps() {
        return axios.get(API_ROUTE + "/colormaps")
            .then(response => {
                console.log(typeof response.data.cmaps)
                console.log(response.data.str)
                this.setState({
                    cmaps: response.data.cmaps
                })
            })
    }

    getMaps() {
        return axios.get(API_ROUTE + "/maps")
            .then(response => {
                console.log(typeof response.data.maps)
                console.log(response.data.str)
                this.setState({
                    maps: response.data.maps
                })
            })
    }

    setMap(e) {
        console.log(e.target)
        this.setState({
            selectedMap: e.target.value
        })
    }

    setCMap(e) {
        console.log(e.target)
        this.setState({
            selectedCMap: e.target.value
        })
    }

    setGeoHue(e) {
        this.setState({
            selectedGeoHueItem: e.target.value
        })
    }

    async sendMapInfo() {
        await this.uploadMap()
        await this.uploadCMap()
        await this.uploadGeoHue()
        this.generateMap()
    }

    generateMap() {
        return axios.get(API_ROUTE + "/generateMap", { responseType: 'arraybuffer' })
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
    fillMaps() {
        let strats = this.state.maps;
        let menuItems = strats.map((strategy) =>
            <MenuItem value={strategy.id} key={strategy.name}>{strategy.name}</MenuItem>
        );
        this.setState({
            mapItems: menuItems
        })
    }

    fillCMaps() {
        let colors = this.state.cmaps;
        let menuItems = colors.map((strategy) =>
            <MenuItem value={strategy.id} key={strategy.name}>{strategy.name}</MenuItem>
        );
        this.setState({
            cmapItems: menuItems
        })
    }

    fillGeoColumns(geocolumns) {
        console.log(geocolumns)
        let menuItems = geocolumns.map((index, value) => (
            <MenuItem key={index} value={value}>{index}</MenuItem>
        ));
        this.setState({
            geoColumns: menuItems
        })
        console.log(this.state.geocolumns)
    }

    async handleChange(event) {
        await this.setState({
            geocsvfile: event.target.files[0],
            disp_image: URL.createObjectURL(event.target.files[0])
        })
        await this.uploadcsv()
        this.getGeoColumns()
    }

    async componentDidMount() {
        await this.getMaps()
        await this.getCMaps()
        this.fillMaps()
        this.fillCMaps()

    }

    render() {
        return (
            <div>
                <InputLabel>Map type</InputLabel>
                <Select
                    onChange={this.setMap}>
                    {this.state.mapItems}
                </Select>
                <InputLabel>Color maps</InputLabel>
                <Select
                    onChange={this.setCMap}>
                    {this.state.cmapItems}
                </Select>
                <InputLabel>Hue</InputLabel>
                <Select
                    onChange={this.setGeoHue}>
                    {this.state.geoColumns}
                </Select>
                <div class="file-field input-field">
                    <Box display="flex" alignSelf="flex-end" justifyContent="center" className="upl">
                        <span class="btn">Upload</span>
                        <input type="file" multiple class="btn" onChange={this.handleChange} />
                        <a class="waves-effect waves-light btn" onClick={this.sendMapInfo}>Create Map</a>
                    </Box>
                    <Box display="flex" justifyContent="center">
                        <img src={this.state.disp_image} onChange={this.changeDispImage} id="map-upload" className="ImageSize" />
                    </Box>
                </div>

            </div>
        );
    }
}


export default MapService;