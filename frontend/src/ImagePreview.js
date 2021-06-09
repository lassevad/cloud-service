import React, { useState } from 'react';
import axios from 'axios';
//import 'materialize-css';
import Box from '@material-ui/core/Box';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

const API_ROUTE = "http://10.6.129.215:8080"

class UploadImgService extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      file: null,
      image: null,
      disp_image: null,
      disp_image_graph: null,
      image_id: 0,
      binaries: null,
      menuItems: null,
      selectedMenuItem: null,
      process_time: null,
      N: null,
      NItems: null,
      selectedNItem: null
    }
    this.handleChange = this.handleChange.bind(this)
    this.makeId = this.makeId.bind(this)
    this.sendFile = this.sendFile.bind(this)
    this.getFile = this.getFile.bind(this)
    this.fillMenu = this.fillMenu.bind(this)
    this.setBinary = this.setBinary.bind(this)
    this.uploadBinary = this.uploadBinary.bind(this)
    this.setN = this.setN.bind(this)
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

  setCurrentImageId(payload) {
    this.setState({
      image_id: payload
    });
  }

  changeDispImage(newImage) {
    this.setState({
      disp_image: newImage
    });
  }

  changeDispImageGraph(newImage) {
    this.setState({
      disp_image_graph: newImage
    });
  }

  async upload(img, id) {
    console.log(img)
    await axios.post(API_ROUTE + "/upload?id=" + id, img, {
      headers: {
        "Content-Type": "image/png",
      }
    })
  };

  uploadBinary() {
    return axios.post(API_ROUTE + '/uploadBinary', {
      data: {
        parallel: this.state.selectedMenuItem
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

  uploadN() {
    return axios.post(API_ROUTE + '/uploadN', {
      data: {
        n: this.state.selectedNItem
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

  sendFile() {
    var img = this.state.file
    let id = this.makeId(8);
    this.setCurrentImageId(id);
    this.upload(img, id);
  }

  download(id) {
    return axios.get(API_ROUTE + "/download?id=" + id, { responseType: 'arraybuffer' })
      .then(response => {
        let blob = new Blob(
          [response.data],
          { type: response.headers['content-type'] }
        )
        let image = URL.createObjectURL(blob)
        this.changeDispImage(image)
        return image
      });
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

        this.changeDispImageGraph(image)
        console.log(this.state.disp_image_graph)
        return image
      });
  }

  async getFile() {
    await this.uploadBinary()
    var id = this.state.image_id
    this.download(id)
    this.getProcessTime()
    this.generateGraph()
  }

  getBinaries() {
    return axios.get(API_ROUTE + "/binaries")
      .then(response => {
        console.log(typeof response.data.binaries)
        this.setState({
          binaries: response.data.binaries
        })
      })
  }

  getN() {
    return axios.get(API_ROUTE + "/n")
      .then(res => {
        console.log(res.data)
        console.log(res.data.processes)
        this.setState({
          N: res.data.processes
        })
      })
  }

  getProcessTime() {
    return axios.get(API_ROUTE + "/processtime")
      .then(response => {
        console.log(response.data)
        this.setState({
          process_time: response.data
        })
      })
  }

  async handleChange(event) {
    await this.setState({
      file: event.target.files[0],
      disp_image: URL.createObjectURL(event.target.files[0])
    })
    this.sendFile()
  }

  handleImageChange = (e) => {
    this.setState({
      image: e.target.files[0]
    })
  };

  async componentDidMount() {
    await this.getBinaries()
    await this.getN()
    this.fillMenu()
  }

  fillMenu() {
    let bins = this.state.binaries;
    let menuItems = bins.map((binary) =>
      <MenuItem value={binary.value} key={binary.name}>{binary.name}</MenuItem>
    );
    this.setState({
      menuItems: menuItems
    })

    let ns = this.state.N;
    let nItems = ns.map((n) =>
      <MenuItem value={n.value} key={n.id}>{n.value}</MenuItem>
    );
    this.setState({
      NItems: nItems
    })
  }

  async setBinary(e) {
    await this.setState({
      selectedMenuItem: e.target.value
    })
    this.uploadBinary()
  }

  async setN(e) {
    await this.setState({
      selectedNItem: e.target.value
    })
    this.uploadN()
  }

  render() {

    return (

      <div>

        <InputLabel id="demo-simple-select-label">Binary file</InputLabel>
        <Select
          onChange={this.setBinary}>
          {this.state.menuItems}
        </Select>



        <div class="file-field input-field">
          <Box display="flex" alignSelf="flex-end" justifyContent="center" className="upl">
            <span class="btn">Upload</span>
            <input type="file" multiple class="btn" onChange={this.handleChange} />
          </Box>
          <Box display="flex" justifyContent="center">
            <img src={this.state.disp_image} onChange={this.handleImageChange} id="image-upload" className="ImageSize" />
            {console.log(this.state.file)}
          </Box>
          <Box display="flex" justifyContent="center">
            Computation time: {this.state.process_time}
          </Box>
          <Box display="flex" justifyContent="center">
            <img src={this.state.disp_image_graph} onChange={this.changeDispImageGraph} id="graph-upload" className="ImageSize" />
          </Box>
          <Box display="flex" justifyContent="center" className="blur">
            <a class="waves-effect waves-light btn" onClick={this.getFile}>Blur</a>
          </Box>

        </div>

      </div>





    );
  }
}

export default UploadImgService;
