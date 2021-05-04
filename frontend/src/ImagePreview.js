import React from 'react';
import axios from 'axios';
//import 'materialize-css';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';

class UploadImgService extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      file: null,
      image: null,
      disp_image: null,
      image_id: 0
    }
    this.handleChange = this.handleChange.bind(this)

    this.makeId = this.makeId.bind(this)
    this.sendFile = this.sendFile.bind(this)
    this.getFile = this.getFile.bind(this)
  }

  makeId(length) {
    var result           = [];
    var characters       = '0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
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

  upload(img, id) {
    console.log(img)
    return axios.post("http://localhost:5000/upload?id=" + id, img, {
      headers: {
        "Content-Type": "image/png",
      }
    })
  };

  
  sendFile () {
    var img = this.state.file
    let id = this.makeId(8);
    this.setCurrentImageId(id);
    this.upload(img, id);
  }


  download(id) {
    return axios.get("http://localhost:5000/download?id=" + id, { responseType: 'arraybuffer' })
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

  getFile() {
    var id = this.state.image_id
    this.download(id)
  }


  async handleChange(event) {
    await this.setState({
      file: event.target.files[0],
      disp_image: URL.createObjectURL(event.target.files[0]),
    })
    this.sendFile()
  }

  handleImageChange = (e) => {
    this.setState({
      image: e.target.files[0]
    })
  };

  render() {
    return (

      <div>

        <div class="file-field input-field">
            <Box display="flex" alignSelf="flex-end" justifyContent="center" className="upl">
              <span class="btn">Upload</span>
              <input type="file" multiple class="btn" onChange={this.handleChange}/>
            </Box>
            <Box display="flex" justifyContent="center">
              <img src={this.state.disp_image} onChange={this.handleImageChange} id="image-upload" className="ImageSize"/>
              {console.log(this.state.file)}
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
