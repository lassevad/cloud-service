import React from 'react';
import {Button} from 'react-bootstrap';
import axios from 'axios';

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
    console.log(this.state.file)
    let id = this.makeId(8);
    console.log(id)
    this.setCurrentImageId(id);
    console.log(this.state.image_id)
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
    console.log(id)
    this.download(id)
  }


  handleChange(event) {
    this.setState({
      file: event.target.files[0],
      disp_image: URL.createObjectURL(event.target.files[0]),
    })
  }

  handleImageChange = (e) => {
    this.setState({
      image: e.target.files[0]
    })
  };

  render() {
    return (
      <div>
        <input type="file" onChange={this.handleChange}/>
        <img src={this.state.disp_image} onChange={this.handleImageChange} id="image-upload" className="ImageSize"/>
        {console.log(this.state.file)}
        <Button variant="secondary" onClick={this.sendFile} >Post</Button>
        <Button variant="success" onClick={this.getFile} >Blur</Button>
      </div>
    );
  }
}

export default UploadImgService;
