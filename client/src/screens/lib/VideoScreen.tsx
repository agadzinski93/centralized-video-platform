import { useState, useEffect, BaseSyntheticEvent } from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { addMessage } from "../../redux/slices/flashMessageSlice";
import { useRenderVideoScreenMutation } from "../../redux/api/libApi";
import { castApiResponse } from "../../types/types";
import VideoPlaylistTile from "../../components/Video/VideoPlaylistTile";
import { scanForLinks } from "../../assets/scripts/scripts";
import LoadingVideoScreen from "../loaders/LoadingVideoScreen";

import "./VideoScreen.scss";

import type { topic, video } from "../../types/types";

const VideoScreen = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTopic, setCurrentTopic] = useState<topic | null>(null);
  const [currentVideo, setCurrentVideo] = useState<
    (video & { videoId: string; subscribers: number }) | null
  >(null);
  const [videos, setVideos] = useState<video[] | null>(null);
  const [seeMore, setSeeMore] = useState<boolean>(false);
  const { topic, video } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [renderVideoScreen] = useRenderVideoScreenMutation();

  const handleSeeMore = (e: unknown) =>
    ((e as BaseSyntheticEvent).type === "click" ||
      (e as KeyboardEvent).key === "Enter") &&
    setSeeMore((prev) => !prev);

  useEffect(() => {
    setIsLoading(true);
    if (topic && video) {
      renderVideoScreen({ topic, video })
        .then((data) => {
          const res = castApiResponse(data);
          if (res.data) {
            if (res.data.response === "success") {
              setCurrentTopic(res.data.data.topic);
              setCurrentVideo(res.data.data.video);
              setVideos(res.data.data.videos);

              document.title = `${res.data.data.video.title} | ${res.data.data.video.username} | Centralized Video Platform`;
              setIsLoading(false);
            } else {
              setIsLoading(false);
              dispatch(
                addMessage({
                  type: res.data.response,
                  message: res.data.message,
                })
              );
            }
          } else {
            setIsLoading(false);
            if (res.error) console.error(res.error.error);
            dispatch(
              addMessage({ type: "error", message: "Something went wrong." })
            );
          }
        })
        .catch((err) => {
          setIsLoading(false);
          if (err instanceof Error) {
            dispatch(addMessage({ type: "error", message: err.message }));
          }
          navigate("/");
        });
    } else {
      setIsLoading(false);
      dispatch(
        addMessage({
          type: "error",
          message: "Topic or video was not provided.",
        })
      );
      navigate("/");
    }
  }, [video]);

  const videoScreen = (
    <div className="video-container">
      {currentTopic && currentVideo && (
        <>
          <div className="video-info">
            <div className="video">
              <iframe
                src={`https://www.youtube.com/embed/${currentVideo.videoId}`}
                title="YouTube video player"
                style={{ border: "0px" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <h1 className="video-title">{currentVideo.title}</h1>
            <div className="uploaded-when">
              {new Date(Date.parse(currentVideo.timeCreated)).toDateString()}
            </div>
            <div className="uploader-info">
              <div
                className="avatar"
                style={{ backgroundImage: `url('${currentVideo.pic_url}')` }}
              ></div>
              <div>
                <div className="username">{currentVideo.username}</div>
                <div className="subscriber-count">
                  {`${currentVideo.subscribers} ` +
                    `${
                      currentVideo.subscribers === 1
                        ? "subscriber"
                        : "subscribers"
                    }`}
                </div>
              </div>
            </div>
            <div
              className={
                seeMore
                  ? "video-description"
                  : "video-description hide-overflow"
              }
              dangerouslySetInnerHTML={{
                __html: scanForLinks(currentVideo.description),
              }}
            ></div>
            <div
              tabIndex={0}
              className="video-description-see-more"
              onClick={handleSeeMore}
              onKeyUp={handleSeeMore}
            >
              {seeMore ? "- See less -" : "- See more -"}
            </div>
          </div>
          <div tabIndex={-1} className="video-playlist-container">
            {videos && videos.length > 0 && (
              <div className="topic-playlist">
                {videos.map((v, index) => (
                  <VideoPlaylistTile key={index} video={v} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="video-page-container">
      {isLoading ? <LoadingVideoScreen /> : videoScreen}
    </div>
  );
};

export default VideoScreen;
