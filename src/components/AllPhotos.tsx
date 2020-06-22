import React, { Component } from "react";
import axios from "axios";
import { API_URL, BUCKET_URL, POLL_INTERVAL } from "../constants";
import "../style/Photos.css";

interface Props {}

interface State {
  fullSize: string[];
  thumbnail: string[];
}

class AllPhotos extends Component<Props, State> {
  state: State = {
    fullSize: [],
    thumbnail: [],
  };

  componentDidMount() {
    this.loadPhotos();
    setInterval(this.loadPhotos, POLL_INTERVAL);
  }

  loadPhotos = async () => {
    const { data } = await axios.get(API_URL + "/photos");
    console.log(data);
    this.setState({ ...data });
  };

  render() {
    const { fullSize, thumbnail } = this.state;
    return (
      <>
        <div className="container">
          {fullSize.map((objectKey) => (
            <div key={objectKey}>
              <img
                className="image-fullsize"
                src={BUCKET_URL + "/" + objectKey}
              ></img>
            </div>
          ))}
        </div>
        <div className="container">
          {thumbnail.map((objectKey) => (
            <div key={objectKey}>
              <img
                className="image-thumbnail"
                src={BUCKET_URL + "/" + objectKey}
              ></img>
            </div>
          ))}
        </div>
      </>
    );
  }
}

export default AllPhotos;
