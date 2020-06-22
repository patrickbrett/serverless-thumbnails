import axios from "axios";
import React, { Component } from "react";
import { API_URL } from "../constants";
import "../style/Upload.css";

enum UploadState {
  NO_PHOTO = "No photo",
  READY = "Ready",
  PREPARING = "Preparing...",
  UPLOADING = "Uploading...",
  PROCESSING = "Processing...",
  FINISHED = "Finished",
  ERROR = "Error",
  CANCELLED = "Cancelled",
}

const uploadStateImage: { [key: string]: string } = {};
Object.keys(UploadState)
  .filter(
    (uploadState) =>
      UploadState[uploadState as keyof typeof UploadState] !==
      UploadState.UPLOADING
  )
  .forEach((uploadState) => {
    const val = UploadState[uploadState as keyof typeof UploadState];
    uploadStateImage[
      val
    ] = require(`../upload-status/${uploadState.toLowerCase()}.svg`);
  });

const CANCELLED_BY_USER = "Cancelled by user";

interface Props {}

interface State {
  current: {
    src: null | string;
    file?: File;
    uploadProgress: number;
    uploadState: UploadState;
  };
  past: {
    photoId: string;
    src: string;
  }[];
}

class Upload extends Component<Props, State> {
  cancel?: (reason: string) => void;

  state: State = {
    current: {
      src: null,
      file: undefined,
      uploadProgress: 0,
      uploadState: UploadState.NO_PHOTO,
    },
    past: [],
  };

  setFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    const file = target?.files && target.files[0];

    if (!file) return;

    var url = URL.createObjectURL(file);
    var img = new Image();

    img.onload = () => {
      const upload = { ...this.state.current };
      upload.src = img.src;
      upload.file = file;
      upload.uploadState = UploadState.READY;
      this.setState({ current: upload });
    };

    img.src = url;
  };

  submitPhoto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { file } = this.state.current;

    this.setState((prevState) => ({
      current: { ...prevState.current, uploadState: UploadState.PREPARING },
    }));

    try {
      const uploadUrlRes = await axios.post(`${API_URL}/photos`);

      const { uploadUrl } = uploadUrlRes.data;

      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": "image/jpeg" },
        cancelToken: new axios.CancelToken((c) => (this.cancel = c)),
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const uploadProgress = Math.floor((loaded / total) * 100);
          this.setState((prevState) => ({
            current: {
              ...prevState.current,
              uploadState: UploadState.UPLOADING,
              uploadProgress,
            },
          }));
        },
      });

      this.setState((prevState) => ({
        current: { ...prevState.current, uploadState: UploadState.FINISHED },
      }));
    } catch (err) {
      console.error(err, err.message);
      if (err.message && err.message === CANCELLED_BY_USER) {
        this.setState((prevState) => ({
          current: {
            ...prevState.current,
            uploadState: UploadState.CANCELLED,
          },
        }));
      } else {
        this.setState((prevState) => ({
          current: { ...prevState.current, uploadState: UploadState.ERROR },
        }));
      }
    }
  };

  cancelUpload = () => {
    if (this.cancel) this.cancel(CANCELLED_BY_USER);
  };

  render() {
    const upload = this.state;

    const UploadForm = ({
      current: { uploadState, uploadProgress, src },
    }: State) => {
      let uploadStateDisplay;
      if (uploadState === UploadState.UPLOADING) {
        uploadStateDisplay = (
          <div>
            {uploadProgress}%
            <div id="progressbar">
              <div style={{ width: uploadProgress + "%" }} />
            </div>
          </div>
        );
      } else {
        uploadStateDisplay = (
          <div className={`upload-state`}>
            <img
              className={`upload-state-icon`}
              alt={`Upload state`}
              src={uploadStateImage[uploadState]}
            />
            <span className={`upload-state-text`}>{uploadState}</span>
          </div>
        );
      }

      // @ts-ignore
      const uploadButton = {
        [UploadState.READY]: <input type="submit" value="Upload!" />,
        [UploadState.UPLOADING]: (
          <button onClick={this.cancelUpload}>Cancel</button>
        ),
        [UploadState.ERROR]: <input type="submit" value="Try again" />,
        [UploadState.CANCELLED]: <input type="submit" value="Try again" />,
      }[uploadState];

      return (
        <div className={`upload-form-container`}>
          <form
            method="post"
            encType="multipart/form-data"
            onSubmit={this.submitPhoto}
          >
            <div>
              <strong>Choose photo:</strong>{" "}
              <input
                type="file"
                accept={`.jpg,.jpeg`}
                onChange={this.setFile}
              />
            </div>
            {src && (
              <div>
                <img src={src} alt={`Preview upload`} id={`imagePreview`} />
              </div>
            )}
            <div>{uploadButton}</div>
            {uploadStateDisplay}
          </form>
        </div>
      );
    };

    return (
      <div id={`upload`}>
        <div id={`container-main`} className={`container-uploads`}>
          <h1>Upload photo</h1>
          <UploadForm {...upload} />
        </div>
      </div>
    );
  }
}

export default Upload;
