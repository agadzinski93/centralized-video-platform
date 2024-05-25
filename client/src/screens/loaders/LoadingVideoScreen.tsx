import "./LoadingVideoScreen.scss";

const LoadingVideoScreen = () => {
  return (
    <div className="loading-video-container">
      <div className="loading-video-info">
        <div className="loading-video"></div>
        <div className="loading-title"></div>
        <div className="loading-video-date"></div>
        <div className="loading-video-author-info">
          <div className="loading-author-avatar"></div>
          <div className="loading-author-details">
            <div className="loading-author-username"></div>
            <div className="loading-author-subscribers"></div>
          </div>
        </div>
      </div>
      <div className="loading-video-playlist">
        <div className="loading-topic-video">
          <div className="loading-topic-image"></div>
          <div className="loading-topic-video-info">
            <div className="loading-topic-video-title"></div>
            <div className="loading-topic-video-author"></div>
            <div className="loading-topic-video-uploaded-when"></div>
          </div>
        </div>
        <div className="loading-topic-video">
          <div className="loading-topic-image"></div>
          <div className="loading-topic-video-info">
            <div className="loading-topic-video-title"></div>
            <div className="loading-topic-video-author"></div>
            <div className="loading-topic-video-uploaded-when"></div>
          </div>
        </div>
        <div className="loading-topic-video">
          <div className="loading-topic-image"></div>
          <div className="loading-topic-video-info">
            <div className="loading-topic-video-title"></div>
            <div className="loading-topic-video-author"></div>
            <div className="loading-topic-video-uploaded-when"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingVideoScreen;
