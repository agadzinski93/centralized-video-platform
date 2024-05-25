import "./LoadingTopicScreen.scss";

const LoadingTopicScreen = () => {
  return (
    <div className="loading-topic-page-container">
      <div className="loading-topic-page-info">
        <div className="loading-topic-image"></div>
        <div className="loading-topic-info">
          <div className="loading-topic-title"></div>
          <div className="loading-topic-difficulty">
            <div className="loading-difficulty"></div>
            <div className="div">-</div>
            <div className="loading-date"></div>
          </div>
          <div className="loading-topic-description"></div>
        </div>
      </div>
      <div className="loading-topic-page-playlist">
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

export default LoadingTopicScreen;
