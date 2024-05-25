import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { addMessage } from "../../redux/slices/flashMessageSlice";
import { useRenderTopicScreenMutation } from "../../redux/api/libApi";
import { castApiResponse } from "../../types/types";
import VideoPlaylistTile from "../../components/Video/VideoPlaylistTile";
import LoadingTopicScreen from "../loaders/LoadingTopicScreen";

import "./TopicScreen.scss";

import type { topic, video, ApiResponseTopicScreen } from "../../types/types";

const TopicScreen = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTopic, setCurrentTopic] = useState<topic | null>(null);
  const [videos, setVideos] = useState<video[] | null>(null);
  const [bg, setBg] = useState<string | null>(null);
  const [opacity, setOpacity] = useState<number>(0);
  const { topic } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [renderTopicScreen] = useRenderTopicScreenMutation();

  useEffect(() => {
    setIsLoading(true);
    if (topic) {
      renderTopicScreen({ topic })
        .then((data) => {
          const res = castApiResponse<ApiResponseTopicScreen>(data);
          if (res.data) {
            if (res.data.response === "success") {
              setCurrentTopic(res.data.data.topic);
              setVideos(res.data.data.videos);

              document.title = `${res.data.data.topic.name} | ${res.data.data.topic.username} | Centralized Video Platform`;

              const TOPIC_BACKGROUND = res.data.data.topic.imageUrl;

              if (TOPIC_BACKGROUND) {
                const img = new Image();
                img.onload = () => {
                  setOpacity(0.15);
                  setBg(TOPIC_BACKGROUND);
                };
                img.src = TOPIC_BACKGROUND;
              }
            } else {
              dispatch(
                addMessage({
                  type: res.data.response,
                  message: res.data.message,
                })
              );
            }
          } else {
            if (res.error) console.error(res.error.error);
            dispatch(
              addMessage({ type: "error", message: "Something went wrong." })
            );
          }
        })
        .catch((err) => {
          if (err instanceof Error) {
            dispatch(addMessage({ type: "error", message: err.message }));
          }
          navigate("/");
        });
    } else {
      dispatch(
        addMessage({ type: "error", message: "Topic was not provided." })
      );
      navigate("/");
    }
    setIsLoading(false);
  }, [topic]);

  const topicScreen = (
    <div className="topic-container">
      {currentTopic && (
        <>
          <div className="topic-info">
            <div className="topic-image-container">
              <img src={currentTopic.imageUrl} alt="topic image" />
            </div>
            <div>
              <h1>{currentTopic.name}</h1>
              <p className="difficulty">
                <span>{currentTopic.difficulty}</span> -{" "}
                {new Date(Date.parse(currentTopic.timeCreated)).toDateString()}
              </p>
              <p className="description">{currentTopic.description}</p>
            </div>
          </div>
          {videos && videos.length > 0 && (
            <div tabIndex={-1} className="topic-playlist-container">
              <div className="topic-playlist">
                {videos.map((v, index) => (
                  <VideoPlaylistTile key={index} video={v} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="topic-page-container">
      {isLoading ? (
        <LoadingTopicScreen />
      ) : (
        <>
          <div
            className="topic-background"
            style={{ backgroundImage: `url('${bg}')`, opacity }}
          ></div>
          {topicScreen}
        </>
      )}
    </div>
  );
};

export default TopicScreen;
