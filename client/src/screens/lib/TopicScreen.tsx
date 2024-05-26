import { useState, useEffect, useRef } from "react";
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
  const videos = useRef<video[] | null>(null);
  const [bg, setBg] = useState<string | null>(null);
  const opacity = useRef<number>(0);
  const { topic } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [renderTopicScreen] = useRenderTopicScreenMutation();

  useEffect(() => {
    if (topic) {
      renderTopicScreen({ topic })
        .then((data) => {
          const res = castApiResponse<ApiResponseTopicScreen>(data);
          if (res.data) {
            if (res.data.response === "success") {
              setCurrentTopic(res.data.data.topic);
              videos.current = res.data.data.videos;

              document.title = `${res.data.data.topic.name} | ${res.data.data.topic.username} | Centralized Video Platform`;

              const TOPIC_BACKGROUND = res.data.data.topic.imageUrl;

              if (TOPIC_BACKGROUND) {
                const img = new Image();
                img.onload = () => {
                  opacity.current = 0.15;
                  setBg(TOPIC_BACKGROUND);
                };
                img.src = TOPIC_BACKGROUND;
              }
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
        addMessage({ type: "error", message: "Topic was not provided." })
      );
      navigate("/");
    }
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
          {videos.current && videos.current.length > 0 && (
            <div tabIndex={-1} className="topic-playlist-container">
              <div className="topic-playlist">
                {videos.current.map((v, index) => (
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
      {isLoading === true ? (
        <LoadingTopicScreen />
      ) : (
        <>
          <div
            className="topic-background"
            style={{
              backgroundImage: `url('${bg}')`,
              opacity: opacity.current,
            }}
          ></div>
          {topicScreen}
        </>
      )}
    </div>
  );
};

export default TopicScreen;
