import axios from "axios";
import React, { Component } from "react";
import "./style/Upload.css";

const BACKEND_URL =
  "https://v7ktx843pb.execute-api.us-east-1.amazonaws.com/dev";

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
    ] = require(`./upload-status/${uploadState.toLowerCase()}.svg`);
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

  submitPhoto = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { file } = this.state.current;

    this.setState((prevState) => ({
      current: { ...prevState.current, uploadState: UploadState.PREPARING },
    }));

    axios
      .post(`${BACKEND_URL}/photos`)
      .then((res) => {
        console.log("GET photo upload url complete");
        const { uploadUrl, photoId } = res.data;

        this.setState((prevState) => ({
          current: { ...prevState.current, photoId },
        }));

        console.log("upload Url: ", uploadUrl);

        return axios
          .put(uploadUrl, file, {
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
          })
          .then(() => photoId);
      })
      .then((photoId) => {
        this.setState((prevState) => ({
          current: {
            ...prevState.current,
            uploadState: UploadState.PROCESSING,
          },
        }));
        const markPhotoUploadedUrl = `${BACKEND_URL}/mark-photo-uploaded/${photoId}`;
        return axios.post(markPhotoUploadedUrl, null);
      })
      .then((res) => {
        this.setState((prevState) => ({
          current: { ...prevState.current, uploadState: UploadState.FINISHED },
        }));
        console.log(res);
      })
      .catch((err) => {
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
      });
  };

  cancelUpload = () => {
    // TODO: database call to clean up upload by removing entry
    if (this.cancel) this.cancel(CANCELLED_BY_USER);
  };

  closeUploadForm = () => {
    const { current } = { ...this.state };
    const { uploadState } = current;

    if (
      [
        UploadState.UPLOADING,
        UploadState.PREPARING,
        UploadState.PROCESSING,
      ].includes(uploadState) &&
      !window.confirm("Are you sure you want to quit this upload?")
    )
      return;

    this.cancelUpload();

    this.setState({
      current: {
        src: null,
        file: undefined,
        uploadProgress: 0,
        uploadState: UploadState.NO_PHOTO,
      },
    });
  };

  render() {
    const upload = this.state;

    const uploadFormDisplay = ({
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
            {uploadState === UploadState.FINISHED && (
              <div>Click to view (TODO)</div>
            )}
          </div>
        );
      }

      // @ts-ignore
      const uploadButton = {
        [UploadState.READY]: <input type="submit" value="Upload!" />,
        [UploadState.UPLOADING]: <button onClick={this.cancelUpload}>Cancel</button>,
        [UploadState.ERROR]: <input type="submit" value="Try again" />,
        [UploadState.CANCELLED]: <input type="submit" value="Try again" />
      }[uploadState]

      return (
        <div className={`upload-form-container`}>
          <form
            ref="uploadForm"
            id="uploadForm"
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
          {uploadFormDisplay(upload)}
        </div>
      </div>
    );
  }
}

export default Upload;
